const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');
const QRCode = require('qrcode');
const archiver = require('archiver');
const PDFDocument = require('pdfkit');

// Generate QR codes
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { count = 1, format = 'png' } = req.body;

    if (count < 1 || count > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 1000'
      });
    }

    // Find the highest existing BAGO number from qr_codes table
    const { data: existingCodes, error: queryError } = await supabase
      .from('qr_codes')
      .select('qr_code')
      .like('qr_code', 'BAGO%')
      .order('qr_code', { ascending: false })
      .limit(1);

    if (queryError) {
      console.error('Query existing codes error:', queryError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing QR codes'
      });
    }

    let nextNumber = 1; // Start from BAGO000001 if no codes exist

    if (existingCodes && existingCodes.length > 0) {
      // Extract the number from the highest existing code (e.g., "BAGO000005" -> 5)
      const lastCode = existingCodes[0].qr_code;
      const numberPart = lastCode.replace('BAGO', '');
      const lastNumber = parseInt(numberPart, 10) || 0;
      nextNumber = lastNumber + 1;
    }

    const generatedQrs = [];
    const qrBatch = [];

    for (let i = 0; i < count; i++) {
      // Format as BAGO + 6-digit zero-padded number
      const number = nextNumber + i;
      const formattedNumber = number.toString().padStart(6, '0');
      const qrCode = `BAGO${formattedNumber}`;

      generatedQrs.push({
        qr_code: qrCode,
        number: number,
        formatted_number: formattedNumber
      });

      // Insert into qr_codes table - only qr_code and created_by are needed
      qrBatch.push({
        qr_code: qrCode,
        created_by: req.session.userId
      });
    }

    // Insert the QR codes into the qr_codes table
    const { data: insertedQrs, error: insertError } = await supabase
      .from('qr_codes')
      .insert(qrBatch)
      .select();

    if (insertError) {
      console.error('Insert QR error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to insert QR codes into the database: ' + insertError.message
      });
    }

    // Log the activity
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: req.session.userId,
        action: 'GENERATE_QR_CODES',
        table_name: 'qr_codes',
        new_values: JSON.stringify({
          count,
          format,
          range: `BAGO${nextNumber.toString().padStart(6, '0')} - BAGO${(nextNumber + count - 1).toString().padStart(6, '0')}`
        }),
        old_values: null,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }]);

    try {
      if (format === 'png') {
        // Generate ZIP file with PNG images
        const archive = archiver('zip', {
          zlib: { level: 9 } // Best compression
        });

        // Set response headers
        const startCode = `BAGO${nextNumber.toString().padStart(6, '0')}`;
        const endCode = `BAGO${(nextNumber + count - 1).toString().padStart(6, '0')}`;
        const filename = `QR_Codes_${startCode}_${endCode}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        archive.pipe(res);

        // Generate QR code images and add to ZIP
        for (const qr of generatedQrs) {
          try {
            // Create canvas with QR code and text
            const { createCanvas } = require('canvas');
            const canvas = createCanvas(400, 450); // Width: 400px, Height: 450px (extra for text)
            const ctx = canvas.getContext('2d');

            // Fill white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Generate QR code buffer
            const qrBuffer = await QRCode.toBuffer(qr.qr_code, {
              type: 'png',
              width: 300,
              margin: 2,
              errorCorrectionLevel: 'M'
            });

            // Load QR code image
            const { loadImage } = require('canvas');
            const qrImage = await loadImage(qrBuffer);

            // Center QR code horizontally
            const qrX = (canvas.width - 300) / 2; // Center horizontally
            const qrY = 20; // Top margin

            // Draw QR code
            ctx.drawImage(qrImage, qrX, qrY, 300, 300);

            // Add text below QR code
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(qr.qr_code, canvas.width / 2, qrY + 300 + 15); // Center text below QR

            // Convert to buffer and add to ZIP
            const finalBuffer = canvas.toBuffer('image/png');
            archive.append(finalBuffer, { name: `${qr.qr_code}.png` });
          } catch (qrError) {
            console.error(`Error generating QR code for ${qr.qr_code}:`, qrError);
            // Continue with other QR codes
          }
        }

        archive.finalize();

      } else if (format === 'pdf') {
        // Generate PDF with 1 QR code per page
        const startCode = `BAGO${nextNumber.toString().padStart(6, '0')}`;
        const endCode = `BAGO${(nextNumber + count - 1).toString().padStart(6, '0')}`;
        const filename = `QR_Codes_${startCode}_${endCode}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const doc = new PDFDocument({
          size: [170, 227], // 6cm x 8cm custom size (converted to points)
          margin: 14 // 0.5 cm margins to fit QR codes properly
        });

        doc.pipe(res);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 14; // 0.5 cm margins (adjusted for 6x7cm paper size)
        const qrSize = 142; // 5x5 cm QR codes (approximately)

        // Create one page per QR code
        for (let i = 0; i < generatedQrs.length; i++) {
          const qr = generatedQrs[i];

          // Add new page for each QR code (except first one)
          if (i > 0) {
            doc.addPage();
          }

          try {
            // Generate QR code buffer
            const qrBuffer = await QRCode.toBuffer(qr.qr_code, {
              type: 'png',
              width: qrSize,
              margin: 4,
              errorCorrectionLevel: 'M'
            });

            // Calculate dimensions for centering QR code + text as a group
            const textSpacing = 20; // Space between QR and text
            const textHeight = 14; // Estimated height for 12pt font
            const totalContentHeight = qrSize + textSpacing + textHeight; // ~176 points

            // Center the entire QR + text group vertically on the page
            const groupY = (pageHeight - totalContentHeight) / 2;

            // Position QR code and text horizontally centered
            const qrX = (pageWidth - qrSize) / 2;
            const qrY = groupY + 10; // Small top margin from group start

            // Add QR code image (centered)
            doc.image(qrBuffer, qrX, qrY, {
              width: qrSize,
              height: qrSize
            });

            // Add QR code text below the QR code (centered, compact, readable)
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text(qr.qr_code, qrX, qrY + qrSize + textSpacing, {
              width: qrSize,
              align: 'center'
            });

          } catch (qrError) {
            console.error(`Error generating QR code for ${qr.qr_code}:`, qrError);
            // Add error page
            doc.fontSize(18).text(`Error generating QR code: ${qr.qr_code}`, { align: 'center' });
          }
        }

        doc.end();

      } else {
        // Invalid format - fallback to JSON response
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use "png" or "pdf"'
        });
      }

    } catch (downloadError) {
      console.error('Download generation error:', downloadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate download file: ' + downloadError.message
      });
    }

  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR codes'
    });
  }
});

// Get QR code statistics
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    // Get total QR codes generated
    const { data: totalData, error: totalError } = await supabase
      .from('qr_codes')
      .select('id', { count: 'exact' });

    if (totalError) {
      throw totalError;
    }

    // Get used QR codes count
    const { data: usedData, error: usedError } = await supabase
      .from('qr_codes')
      .select('id', { count: 'exact' })
      .eq('is_used', true);

    if (usedError) {
      throw usedError;
    }

    // Get last generated QR code timestamp
    const { data: lastData, error: lastError } = await supabase
      .from('qr_codes')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastError) {
      throw lastError;
    }

    // Calculate statistics
    const total_generated = totalData?.length || 0;
    const total_used = usedData?.length || 0;
    const total_unused = total_generated - total_used;
    const last_generated = lastData && lastData.length > 0 ? lastData[0].created_at : null;

    res.json({
      success: true,
      data: {
        total_generated,
        total_used,
        total_unused,
        last_generated: last_generated ? new Date(last_generated).toLocaleString('id-ID') : null
      }
    });
  } catch (error) {
    console.error('Get QR stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get QR code statistics'
    });
  }
});

module.exports = router;
