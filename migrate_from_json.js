import fs from 'fs';

// Read the JSON file
const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// Process the data to extract unique product templates
const templates = new Map();

data.forEach(item => {
  // Skip items with null price (likely not active products)
  if (!item.price) return;

  // Handle category - take the first category if multiple
  let category = item.category;
  if (category.includes(',')) {
    category = category.split(',')[0].trim();
  }

  // Clean up category names to match existing template categories
  const categoryMap = {
    'Set': 'Sofa', // Map "Set" to "Sofa" as default
    'Sungkai': 'Kursi', // Map Sungkai chairs to Kursi
    'Rotan Sintetis': 'Kursi', // Map rattan to Kursi
    'Industrial': 'Meja', // Map industrial tables to Meja
    'Mahoni': 'Meja', // Map mahogany tables to Meja
    'Divan': 'Nakas', // Map divans to Nakas
    'Cabinet': 'Nakas', // Map cabinets to Nakas
    'Kursi Cafe': 'Kursi',
    'Stool': 'Kursi',
    'Buffet': 'Buffet',
    'Nakas': 'Nakas',
    'Meja': 'Meja',
    'Kursi': 'Kursi',
    'Sofa': 'Sofa'
  };

  if (categoryMap[category]) {
    category = categoryMap[category];
  }

  const product_name = item.name;
  const key = `${category}-${product_name}`;

  // Only add if we haven't seen this combination before
  if (!templates.has(key)) {
    // Use the colors from the item, or default
    let colors = item.colors || [{"name": "Default", "hex": "#3B82F6"}];

    // Ensure colors is an array and each has name and hex
    if (!Array.isArray(colors)) {
      colors = [{"name": "Default", "hex": "#3B82F6"}];
    }

    colors = colors.map(color => {
      if (typeof color === 'string') {
        return {"name": color, "hex": "#3B82F6"};
      }
      return {
        name: color.name || "Default",
        hex: color.hex || "#3B82F6"
      };
    });

    templates.set(key, {
      category,
      product_name,
      colors
    });
  }
});

// Generate SQL INSERT statements
let sql = `-- Migration from db.json to product_templates table\n\n`;

templates.forEach((template, key) => {
  const colorsJson = JSON.stringify(template.colors);
  sql += `INSERT INTO product_templates (category, product_name, colors, created_by) VALUES\n`;
  sql += `('${template.category.replace(/'/g, "''")}', '${template.product_name.replace(/'/g, "''")}', '${colorsJson}', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));\n\n`;
});

console.log(`Generated migration for ${templates.size} product templates`);
console.log('SQL migration:');
console.log(sql);

// Write to file
fs.writeFileSync('migration_from_json.sql', sql);
console.log('Migration SQL written to migration_from_json.sql');
