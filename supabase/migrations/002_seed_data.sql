-- ============================================================
-- SHAJPORI — Migration 002: Seed Data (6 products, 31 variants)
-- ============================================================

INSERT INTO public.products
  (id, sku, name, slug, short_description, description, category,
   price, compare_at_price, cost_price, colors, available_sizes,
   materials, tags, thumbnail_url, image_urls,
   total_stock, low_stock_alert, badge, is_active, is_featured)
VALUES

-- 1. Chiffon Floral Maxi Dress
('a1000000-0000-0000-0000-000000000001',
 'SJP-DRS-001', 'Chiffon Floral Maxi Dress', 'chiffon-floral-maxi-dress',
 'Lightweight floral maxi dress perfect for any occasion.',
 'A beautifully flowing chiffon maxi dress featuring a vibrant floral print. Lightweight, breathable, and elegant — ideal for weddings, Eid parties, or casual outings.',
 'Dress', 2490, 2990, 950,
 ARRAY['Blush Pink','Sky Blue','Ivory White'],
 ARRAY['S','M','L','XL'],
 ARRAY['Chiffon','Polyester'],
 ARRAY['maxi','floral','party','eid'],
 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
 ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
       'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800'],
 42, 5, 'Bestseller', TRUE, TRUE),

-- 2. Embroidered Kurti Set
('a1000000-0000-0000-0000-000000000002',
 'SJP-DRS-002', 'Embroidered Kurti Set', 'embroidered-kurti-set',
 'Elegant hand-embroidered kurti with matching palazzo pants.',
 'Traditional yet modern hand-embroidered kurti crafted from premium cotton. Comes with matching palazzo pants — a perfect fusion of comfort and elegance.',
 'Dress', 3200, 3800, 1200,
 ARRAY['Dusty Rose','Sage Green','Cream'],
 ARRAY['S','M','L','XL','XXL'],
 ARRAY['Cotton','Georgette'],
 ARRAY['kurti','embroidered','traditional','casual'],
 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400',
 ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=800'],
 35, 5, 'New', TRUE, TRUE),

-- 3. Party Lehenga
('a1000000-0000-0000-0000-000000000003',
 'SJP-DRS-003', 'Party Lehenga', 'party-lehenga',
 'Stunning lehenga set for weddings and special occasions.',
 'A gorgeous semi-stitched lehenga set adorned with intricate zari work. Includes blouse, lehenga skirt, and dupatta. Perfect for weddings, mehndi nights, and Eid festivities.',
 'Dress', 5800, 7200, 2200,
 ARRAY['Deep Burgundy','Cobalt Blue','Rose Gold'],
 ARRAY['S','M','L'],
 ARRAY['Net','Silk','Zari'],
 ARRAY['lehenga','wedding','bridal','party'],
 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
 ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'],
 18, 3, 'Premium', TRUE, TRUE),

-- 4. Structured Tote Bag
('a1000000-0000-0000-0000-000000000004',
 'SJP-BAG-001', 'Structured Leather Tote Bag', 'structured-leather-tote-bag',
 'Spacious structured tote in premium vegan leather.',
 'A sleek, structured tote bag made from premium vegan leather. Roomy enough for daily essentials with interior pockets and a zip closure. Available in classic neutrals.',
 'Bag', 1890, 2200, 700,
 ARRAY['Black Onyx','Ivory White','Dusty Rose'],
 ARRAY['One Size'],
 ARRAY['Vegan Leather','Metal Hardware'],
 ARRAY['tote','bag','everyday','work'],
 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
 ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
       'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
 30, 5, NULL, TRUE, FALSE),

-- 5. Pearl Drop Earrings
('a1000000-0000-0000-0000-000000000005',
 'SJP-JWL-001', 'Pearl Drop Earrings', 'pearl-drop-earrings',
 'Delicate freshwater pearl drop earrings with gold finish.',
 'Elegant freshwater pearl drop earrings with an 18k gold-plated finish. Lightweight and hypoallergenic. Pairs beautifully with both traditional and modern outfits.',
 'Jewelry', 890, 1100, 300,
 ARRAY['Gold','Silver'],
 ARRAY['One Size'],
 ARRAY['Freshwater Pearl','18k Gold Plated'],
 ARRAY['earrings','pearl','gold','wedding'],
 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
 ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
 60, 10, 'Popular', TRUE, FALSE),

-- 6. Embroidered Clutch Bag
('a1000000-0000-0000-0000-000000000006',
 'SJP-BAG-002', 'Embroidered Clutch Bag', 'embroidered-clutch-bag',
 'Hand-embroidered clutch perfect for parties and weddings.',
 'A stunning hand-embroidered clutch bag featuring traditional Bangladeshi motifs. Features a magnetic clasp and wrist strap. The perfect companion for festive occasions.',
 'Bag', 1290, 1600, 480,
 ARRAY['Blush Pink','Deep Burgundy','Gold'],
 ARRAY['One Size'],
 ARRAY['Velvet','Embroidery Thread','Metal'],
 ARRAY['clutch','embroidered','party','eid'],
 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400',
 ARRAY['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800'],
 25, 5, 'Handcrafted', TRUE, TRUE);


-- ── VARIANTS ──────────────────────────────────────────────────

-- Product 1: Chiffon Floral Maxi Dress (12 variants: 3 colors x 4 sizes)
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-BLP-S',  'S', 'Blush Pink',  '#FFB6C1',5),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-BLP-M',  'M', 'Blush Pink',  '#FFB6C1',8),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-BLP-L',  'L', 'Blush Pink',  '#FFB6C1',6),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-BLP-XL', 'XL','Blush Pink',  '#FFB6C1',3),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-SKB-S',  'S', 'Sky Blue',    '#87CEEB',4),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-SKB-M',  'M', 'Sky Blue',    '#87CEEB',6),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-SKB-L',  'L', 'Sky Blue',    '#87CEEB',5),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-SKB-XL', 'XL','Sky Blue',    '#87CEEB',2),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-IVW-S',  'S', 'Ivory White', '#FFFFF0',2),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-IVW-M',  'M', 'Ivory White', '#FFFFF0',4),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-IVW-L',  'L', 'Ivory White', '#FFFFF0',3),
  ('a1000000-0000-0000-0000-000000000001','SJP-DRS-001-IVW-XL', 'XL','Ivory White', '#FFFFF0',4);

-- Product 2: Embroidered Kurti Set (8 variants)
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-DSR-S',   'S',  'Dusty Rose','#DCAE96',4),
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-DSR-M',   'M',  'Dusty Rose','#DCAE96',7),
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-DSR-L',   'L',  'Dusty Rose','#DCAE96',6),
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-DSR-XL',  'XL', 'Dusty Rose','#DCAE96',4),
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-DSR-XXL', 'XXL','Dusty Rose','#DCAE96',2),
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-SGR-M',   'M',  'Sage Green','#B2C9AD',5),
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-SGR-L',   'L',  'Sage Green','#B2C9AD',4),
  ('a1000000-0000-0000-0000-000000000002','SJP-DRS-002-CRM-M',   'M',  'Cream',     '#FFFDD0',3);

-- Product 3: Party Lehenga (8 variants: 3 colors x 3 sizes minus one sold-out)
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-DBG-S', 'S','Deep Burgundy','#800020',3),
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-DBG-M', 'M','Deep Burgundy','#800020',4),
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-DBG-L', 'L','Deep Burgundy','#800020',2),
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-CBL-S', 'S','Cobalt Blue',  '#0047AB',2),
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-CBL-M', 'M','Cobalt Blue',  '#0047AB',3),
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-CBL-L', 'L','Cobalt Blue',  '#0047AB',1),
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-RSG-S', 'S','Rose Gold',    '#B76E79',2),
  ('a1000000-0000-0000-0000-000000000003','SJP-DRS-003-RSG-M', 'M','Rose Gold',    '#B76E79',1);

-- Product 4: Structured Tote Bag (3 variants)
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
  ('a1000000-0000-0000-0000-000000000004','SJP-BAG-001-BLK-OS','One Size','Black Onyx', '#0A0A0A',12),
  ('a1000000-0000-0000-0000-000000000004','SJP-BAG-001-IVW-OS','One Size','Ivory White','#FFFFF0',10),
  ('a1000000-0000-0000-0000-000000000004','SJP-BAG-001-DSR-OS','One Size','Dusty Rose', '#DCAE96',8);

-- Product 5: Pearl Drop Earrings (2 variants)
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
  ('a1000000-0000-0000-0000-000000000005','SJP-JWL-001-GLD-OS','One Size','Gold',  '#FFD700',30),
  ('a1000000-0000-0000-0000-000000000005','SJP-JWL-001-SLV-OS','One Size','Silver','#C0C0C0',30);

-- Product 6: Embroidered Clutch Bag (3 variants)
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
  ('a1000000-0000-0000-0000-000000000006','SJP-BAG-002-BLP-OS','One Size','Blush Pink',   '#FFB6C1',9),
  ('a1000000-0000-0000-0000-000000000006','SJP-BAG-002-DBG-OS','One Size','Deep Burgundy','#800020',8),
  ('a1000000-0000-0000-0000-000000000006','SJP-BAG-002-GLD-OS','One Size','Gold',          '#FFD700',8);

-- ── Sync product total_stock ──────────────────────────────────
UPDATE public.products p
SET total_stock = (
  SELECT COALESCE(SUM(stock_quantity), 0)
  FROM public.product_variants v WHERE v.product_id = p.id
);

-- ── SAMPLE ORDERS ─────────────────────────────────────────────
INSERT INTO public.orders
  (user_id, guest_email, items_ordered, subtotal, delivery_charge,
   discount_amount, tax_amount, total_amount, payment_status, payment_method, status, shipping_address)
VALUES
(NULL, 'fatema@example.com',
 '[{"product_id":"a1000000-0000-0000-0000-000000000001","name":"Chiffon Floral Maxi Dress","size":"M","color":"Blush Pink","qty":1,"unit_price":2490,"total_price":2490}]',
 2490, 0, 0, 0, 2490, 'Paid', 'bkash', 'Delivered',
 '{"name":"Fatema Begum","street":"45 Gulshan Avenue","city":"Dhaka","district":"Dhaka","postal_code":"1212"}'),

(NULL, 'nusrat@example.com',
 '[{"product_id":"a1000000-0000-0000-0000-000000000005","name":"Pearl Drop Earrings","size":"One Size","color":"Gold","qty":2,"unit_price":890,"total_price":1780},{"product_id":"a1000000-0000-0000-0000-000000000006","name":"Embroidered Clutch Bag","size":"One Size","color":"Blush Pink","qty":1,"unit_price":1290,"total_price":1290}]',
 3070, 0, 0, 0, 3070, 'Paid', 'nagad', 'Shipped',
 '{"name":"Nusrat Jahan","street":"12 Banani Road 11","city":"Dhaka","district":"Dhaka","postal_code":"1213"}'),

(NULL, 'roksana@example.com',
 '[{"product_id":"a1000000-0000-0000-0000-000000000003","name":"Party Lehenga","size":"M","color":"Deep Burgundy","qty":1,"unit_price":5800,"total_price":5800}]',
 5800, 0, 200, 0, 5600, 'Unpaid', 'cod', 'Pending',
 '{"name":"Roksana Akter","street":"78 Mirpur Road","city":"Dhaka","district":"Dhaka","postal_code":"1216"}');

-- ── SAMPLE FINANCE ENTRIES ────────────────────────────────────
INSERT INTO public.finance_ledger (entry_type, category, description, amount, payment_method, entry_date) VALUES
  ('revenue','Sales',    'Opening week sales batch',    18500, 'bkash', CURRENT_DATE - 7),
  ('expense','Rent',     'Monthly shop rent',            8000, 'cash',  CURRENT_DATE - 5),
  ('expense','Supplies', 'Packaging materials purchase', 1200, 'cash',  CURRENT_DATE - 4),
  ('revenue','Sales',    'Weekend sales',               12300, 'nagad', CURRENT_DATE - 2),
  ('expense','Salary',   'Staff salary',                 6000, 'cash',  CURRENT_DATE - 1);
