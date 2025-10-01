-- Migration Instructions for BAGO Stock Management System
-- Run this file in your Supabase SQL Editor or PostgreSQL client

-- STEP 1: First run the updated database schema (database_schema.sql)
-- This will add the 'qr_codes' table and modify existing tables
-- The schema includes the 'colors' column in product_templates

-- STEP 2: Then run the product template data migration below

-- Migration from db.json to product_templates table
-- Migration from db.json to product_templates table

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Agogo', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Ahoop Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Amelia Sofa Set (Tanpa Meja)', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'American', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Amiku Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Angsa Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Arkoll Bench Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Asimbi', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Asoka Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Astry Table', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Ayoe Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Banta Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Barere Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Barsi Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Besante Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Bowie', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Buffet TV Gantung', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Danghe Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Dasly', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Dauwi', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Dayan Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Delys', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Denso', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Derima Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Dimsen', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Dining Set Seroshi', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Dipakne Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Ditampi Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Divan Mahoni 180x200', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Divan Mahoni 90x200', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Djani Drawer', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Donja', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Doolar Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Drawa', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Duklah Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Duksaja Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Dumata', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Dwilama Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Dympan', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Farmae Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Fuloro Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Galar Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Gania Shoe Rack', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Gashbir Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Gorya Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Hana Lipat Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Hifi Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Hotori', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Ikaaf Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Inagi Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Jajeg Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Jakyth Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Jangra Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Jangra Sofa Chair', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Jarken Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Jlentik Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Jopabench', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Joparo Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kacang Bar', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kacang Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kai Chair', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Kajetis Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kakida Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kakin Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kamara Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Kanara Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kane Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Karency', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Karo', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Karpi', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Katoon Cabinet', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Kayga Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kelawu Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Khosim Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kirsa Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Klamari Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kleewa Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Konsul Table Kotak', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Konsul Table Oval', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kursi Anak Hewan', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kursi Anak Jari', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kursi Sudut Letter L (Dengan Spons)', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kursi Sudut Letter L (Tanpa Spons)', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Kurtampu Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Kyfee', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Kyonan Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Lapit', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Lendean Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Lengsy Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Liencak Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Limare Drawer', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Linggoh Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Locca', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Lowes', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Machak Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Maksi Table', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Manya Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Manya Solid Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Margini Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Marwah Sofa', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Mauri Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Mejia Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Mejoe Table', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Mekko Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Mendi Table', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Mimore', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Mindie Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Mioji Double', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Mioji Single', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Mioji Triple', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Mirano Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Moeji Double', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Moeji Single', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Moeji Triple', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Mongga Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Namas', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Namja', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Nayotan', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Nick Cabinet', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Nihi', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Nikki Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Njonya Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Noora Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Nopey Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Numpi Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Odai Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Oled Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Onica Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Oosir', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Ortama Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Pantes Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Pinarak Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Planc', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Pohra Table', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Pulos Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Pulos Jok Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Qilla Sofa', '[{"name":"Cream 145","hex":"#FFECB3"},{"name":"Cream 182","hex":"#d7c796"},{"name":"Hitam 090","hex":"#000000"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Rajua Sofa Set', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Dwilama + Tooja set', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Rataya Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Ratton', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Riyaas Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Rokku', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Ronoa Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Ropan Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Rope Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Roque Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Rosyong Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Rotarota Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Rotjil Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Rounded Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Roxy Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Rumaoma Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Ryngkes', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Saari Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sambrow Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sandara Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sandro Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Santee Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Santiz Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Selica Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Seroshi Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Serwood Single', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Serwood Sofa Set', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Serwood Table Mini', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sesareng Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Set Rotan Besar', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Set Rotan Kecil', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sicangku Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Siepin Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sikura Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sikuth Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sinu Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Siroko', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Smalow Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Sofa Bed Gembul', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Sofa Bed Mini', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Sofa L', '[{"name":"Cream 182","hex":"#d7c796"},{"name":"Cream Coklat 183","hex":"#b5a26e"},{"name":"Abu Muda 162","hex":"#373430"},{"name":"Hitam 090","hex":"#000000"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Soopha', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Staku', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Stool Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Stoora', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Stooya Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Sumaar Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Swane', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Talelap', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Tana Table Natural', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Tana Table Wallnut', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Tapang Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Tatani Drawer', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Terias', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Teyko Table', '[]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Tlamak Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Tooja Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Trantul Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Triange', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Trobox', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Nakas', 'Tutug', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Buffet', 'Vinta', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Sofa', 'Vita Sofa 2 Seat', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Kursi', 'Yhantoo Chair', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

INSERT INTO product_templates (category, product_name, colors, created_by) VALUES
('Meja', 'Yumma Table', '[{"name":"Default","hex":"#3B82F6"}]', (SELECT id FROM users WHERE username = 'admin' LIMIT 1));

