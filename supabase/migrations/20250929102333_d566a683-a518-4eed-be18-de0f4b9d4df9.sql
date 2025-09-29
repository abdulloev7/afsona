-- Clear existing data and insert new categories and products

-- Delete existing products and categories
DELETE FROM public.products;
DELETE FROM public.categories;

-- Insert new categories
INSERT INTO public.categories (name, slug, description) VALUES
('Краски и лакокрасочные материалы', 'paints-and-coatings', 'Широкий ассортимент красок, эмалей и лаков для внутренних и наружных работ'),
('Клеи, герметики и монтажные материалы', 'adhesives-sealants', 'Профессиональные клеи, герметики, монтажные пены и материалы'),
('Грунтовки и подготовительные материалы', 'primers-preparatory', 'Грунтовки и материалы для подготовки поверхностей перед окраской'),
('Шпатлевки и выравнивающие материалы', 'putties-leveling', 'Шпатлевки и материалы для выравнивания поверхностей'),
('Декоративные покрытия и штукатурки', 'decorative-coatings', 'Декоративные краски, штукатурки и специальные покрытия'),
('Колеры и разбавители', 'tints-thinners', 'Колеры для тонировки красок и разбавители'),
('Гидроизоляция', 'waterproofing', 'Материалы для гидроизоляции и защиты от влаги'),
('Кисти и малярные инструменты', 'brushes-tools', 'Кисти и инструменты для малярных работ'),
('Валики', 'rollers', 'Валики для нанесения красок и покрытий'),
('Шпатели и вспомогательные инструменты', 'spatulas-accessories', 'Шпатели и вспомогательные инструменты для отделочных работ');

-- Insert products for Краски и лакокрасочные материалы
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('Краска моющаяся "Радуга-210" акриловая, база "С"', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 120, 'Высококачественная моющаяся акриловая краска', 'Радуга', ARRAY['1 кг', '5 кг', '10 кг'], false, true),
('Краска моющаяся "Радуга-210" акриловая', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 150, 'Готовая к применению моющаяся краска', 'Радуга', ARRAY['14 кг', '24 кг'], false, true),
('Краска "Комфорт"', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 10.4, 'Экономичная краска для внутренних работ', 'Радуга', ARRAY['1,3 кг', '3,5 кг', '7 кг', '10 кг', '14 кг', '24 кг'], false, true),
('Краска Р-25', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 80, 'Универсальная краска для различных поверхностей', 'Радуга', ARRAY['7 кг', '14 кг', '24 кг'], false, true),
('Краска "Фасадная" акриловая', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 18.27, 'Атмосферостойкая краска для фасадов', 'Радуга', ARRAY['7 кг', '14 кг', '24 кг'], false, true),
('Краска "Extra" для фасадов и интерьеров "Радуга-114" акриловая', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 44.34, 'Премиальная краска повышенного качества', 'Радуга', ARRAY['0,9 л', '9 л'], false, true),
('Краска Alantex Interior washing', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 200, 'Моющаяся краска для интерьеров', 'Alantex', ARRAY['14 кг'], false, true),
('Краска GREEN', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 45, 'Экологичная краска высокого качества', 'GREEN', ARRAY['0,7 л', '3,18 л', '4 л'], true, true),
('Краска GREEN SUPER', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 55, 'Супер качественная экологичная краска', 'GREEN', ARRAY['0,7 л', '4 л'], true, true),
('Краска GREEN половая', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 50, 'Специальная краска для пола', 'GREEN', ARRAY['0,7 л'], true, true),
('Лак для дерева матовый "Радуга-129" акриловый', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 85, 'Защитный лак для деревянных поверхностей', 'Радуга', ARRAY['3 кг'], false, true),
('Эмаль "Gold" декоративная "Радуга-117" перламутровая', (SELECT id FROM categories WHERE slug = 'paints-and-coatings'), 4.48, 'Декоративная перламутровая эмаль', 'Радуга', ARRAY['0,1 л'], false, true);

-- Insert products for Клеи, герметики и монтажные материалы
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('SOUDAL FIX ALL HIGH TACK WHITE', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 35, 'Универсальный монтажный клей высокой липкости', 'Soudal', ARRAY['290 ML'], false, true),
('Пена-клей SOUDAL SOUDABOND EASY GUN', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 4.72, 'Профессиональная пена-клей с аппликатором', 'Soudal', ARRAY['750 ML'], false, true),
('Силикон прозрачный SOUDAL SILICONE U', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 1.48, 'Универсальный прозрачный силикон', 'Soudal', ARRAY['280 GR'], false, true),
('Клей Р-18 супермастика', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 25, 'Профессиональный монтажный клей', 'Радуга', ARRAY['1 кг', '3,5 кг'], false, true),
('Пена Genius Gun SOUDAL SOUDAFOAM COMFORT', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 4.42, 'Монтажная пена с комфортным нанесением', 'Soudal', ARRAY['750 ML'], false, true),
('Пена профессиональная SOUDAL SOUDAFOAM PU', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 3.89, 'Профессиональная полиуретановая пена', 'Soudal', ARRAY['750 ML'], false, true),
('Пена простая SOUDAL SOUDAFOAM 1K PU', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 3.75, 'Однокомпонентная полиуретановая пена', 'Soudal', ARRAY['750 ML'], false, true),
('2 компонентный клей SOUDAL MITRE KIT', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 1.2, 'Двухкомпонентный клей для углов', 'Soudal', ARRAY['200 ML+50 GR', '400 ML+100 GR'], false, true),
('Акриловый герметик SOUDAL ACRYRUB', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 1.17, 'Акриловый герметик для швов', 'Soudal', ARRAY['500 GR'], false, true),
('Силикон прозрачный аквариум SOUDAL SILIRUB AQ', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 20, 'Специальный силикон для влажных помещений', 'Soudal', ARRAY['300 ML'], false, true),
('Жидкие гвозди SOUDAL MONTAGE 125', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 1.64, 'Универсальные жидкие гвозди', 'Soudal', ARRAY['310 ML'], false, true),
('Клей ПВА 801', (SELECT id FROM categories WHERE slug = 'adhesives-sealants'), 15, 'Универсальный клей ПВА', 'Радуга', ARRAY['1 кг'], false, true);

-- Insert products for Грунтовки и подготовительные материалы
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('PRIMER грунтовка концентрат "Радуга-019" акриловая', (SELECT id FROM categories WHERE slug = 'primers-preparatory'), 3.08, 'Концентрированная акриловая грунтовка', 'Радуга', ARRAY['1 л'], false, true),
('Грунтовка укрепляющая "Радуга-26" акриловая', (SELECT id FROM categories WHERE slug = 'primers-preparatory'), 5.46, 'Укрепляющая грунтовка для слабых оснований', 'Радуга', ARRAY['5 л', '10 л'], false, true),
('Кварц Грунт "Бетон Контакт" "Радуга-30" акриловый', (SELECT id FROM categories WHERE slug = 'primers-preparatory'), 10.14, 'Адгезионная грунтовка с кварцевым наполнителем', 'Радуга', ARRAY['3,5 кг', '7 кг', '15 кг'], false, true),
('Грунт кварцевый "San Marito Quarzo primer"', (SELECT id FROM categories WHERE slug = 'primers-preparatory'), 120, 'Профессиональный кварцевый грунт', 'San Marito', ARRAY['15 кг'], false, true);

-- Insert products for Шпатлевки и выравнивающие материалы
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('Шпатлевка на виниловой основе "Vinyl Finish" финишная', (SELECT id FROM categories WHERE slug = 'putties-leveling'), 180, 'Финишная шпатлевка на виниловой основе', 'Vinyl', ARRAY['14 кг'], false, true),
('Шпатлевка для деревянных изделий "Радуга-0023" акриловая, цвет белый', (SELECT id FROM categories WHERE slug = 'putties-leveling'), 1.76, 'Акриловая шпатлевка для дерева', 'Радуга', ARRAY['0,85 кг'], false, true),
('Шпатлевка для деревянных изделий "Радуга-0023" акриловая, цвет сосна', (SELECT id FROM categories WHERE slug = 'putties-leveling'), 1.57, 'Акриловая шпатлевка под цвет сосны', 'Радуга', ARRAY['0,85 кг'], false, true);

-- Insert products for Декоративные покрытия и штукатурки
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('Штукатурка декоративная "Veneziano" "Радуга-37"', (SELECT id FROM categories WHERE slug = 'decorative-coatings'), 150, 'Декоративная венецианская штукатурка', 'Радуга', ARRAY['5 кг'], false, true),
('Краска декоративная с эффектом белого шелка "San Marito Ottocenture Bianco"', (SELECT id FROM categories WHERE slug = 'decorative-coatings'), 200, 'Декоративная краска с эффектом шелка', 'San Marito', ARRAY['5 кг'], false, true),
('Краска декоративная с эффектом искрящегося песка "San Marito Sahara Metallico"', (SELECT id FROM categories WHERE slug = 'decorative-coatings'), 220, 'Декоративная краска с металлическим эффектом', 'San Marito', ARRAY['5 кг'], false, true),
('Краска декоративная с эффектом светоотражающего песка "San Marito Sahara Perfetto Argento"', (SELECT id FROM categories WHERE slug = 'decorative-coatings'), 250, 'Декоративная краска с серебристым эффектом', 'San Marito', ARRAY['5 кг'], false, true),
('Лак-воск для декоративных покрытий "San Marito Veneziano Forte"', (SELECT id FROM categories WHERE slug = 'decorative-coatings'), 80, 'Защитный лак-воск для декоративных покрытий', 'San Marito', ARRAY['0,3 кг'], false, true),
('Штукатурка декоративная "San Marito Arte-Betono"', (SELECT id FROM categories WHERE slug = 'decorative-coatings'), 300, 'Декоративная штукатурка под бетон', 'San Marito', ARRAY['15 кг'], false, true),
('Штукатурка декоративная "San Marito Marmo Veneziano"', (SELECT id FROM categories WHERE slug = 'decorative-coatings'), 180, 'Декоративная мраморная штукатурка', 'San Marito', ARRAY['5 кг'], false, true);

-- Insert products for Колеры и разбавители
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('1301 RT Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 16.79, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1302 FT Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 18, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1303 HS Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 20, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1304 KS Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 19, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1305 LS Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 21.98, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1306 LT Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 17, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1307 MS Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 22.68, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1309 MT Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 18.5, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1310 PT Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 19.5, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1311 RS Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 20.5, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1313 US Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 21, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1315 ZT Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 16, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('1316 XT Колер', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 17.5, 'Универсальный колер для тонировки', 'Радуга', ARRAY['100 мл'], false, true),
('Разбавитель Tekman', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 25, 'Профессиональный разбавитель для красок', 'Tekman', ARRAY['1 л'], false, true),
('Разбавитель Uzcolor', (SELECT id FROM categories WHERE slug = 'tints-thinners'), 22, 'Универсальный разбавитель', 'Uzcolor', ARRAY['1 л'], false, true);

-- Insert products for Гидроизоляция
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('Мастика гидроизоляционная "Aquablock" "Радуга-021"', (SELECT id FROM categories WHERE slug = 'waterproofing'), 27.42, 'Битумно-полимерная гидроизоляционная мастика', 'Радуга', ARRAY['3 кг', '7 кг'], false, true);

-- Insert products for Кисти и малярные инструменты
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('Кисть Вторник', (SELECT id FROM categories WHERE slug = 'brushes-tools'), 0.54, 'Универсальная малярная кисть', 'Радуга', ARRAY['№15'], false, true),
('Кисть Среда', (SELECT id FROM categories WHERE slug = 'brushes-tools'), 0.8, 'Универсальная малярная кисть', 'Радуга', ARRAY['№25'], false, true),
('Кисть Четверг', (SELECT id FROM categories WHERE slug = 'brushes-tools'), 0.93, 'Универсальная малярная кисть', 'Радуга', ARRAY['№35'], false, true),
('Кисть Пятница', (SELECT id FROM categories WHERE slug = 'brushes-tools'), 1.16, 'Универсальная малярная кисть', 'Радуга', ARRAY['№45'], false, true),
('Profi для грунта', (SELECT id FROM categories WHERE slug = 'brushes-tools'), 2.38, 'Профессиональная кисть для грунтовки', 'Profi', ARRAY['35 мм', '55 мм', '65 мм', '75 мм', '100 мм'], false, true),
('Кисть Black White универсальная', (SELECT id FROM categories WHERE slug = 'brushes-tools'), 3.43, 'Универсальная кисть высокого качества', 'Black White', ARRAY['75 мм', '100 мм'], false, true),
('Кисть для декоративных работ', (SELECT id FROM categories WHERE slug = 'brushes-tools'), 3.3, 'Специальная кисть для декоративных техник', 'Радуга', ARRAY['75 мм', '100 мм'], false, true);

-- Insert products for Валики
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('Валик для эмалей шероховатые поверхности', (SELECT id FROM categories WHERE slug = 'rollers'), 4.0, 'Валик для нанесения эмалей на шероховатые поверхности', 'Радуга', ARRAY['100 мм', '150 мм', '240 мм'], false, true),
('Валик для лака ровные поверхности', (SELECT id FROM categories WHERE slug = 'rollers'), 4.0, 'Валик для нанесения лака на ровные поверхности', 'Радуга', ARRAY['60 мм', '100 мм', '150 мм', '180 мм'], false, true),
('Валик для нанесения шпаклёвки', (SELECT id FROM categories WHERE slug = 'rollers'), 12.0, 'Специальный валик для шпаклевочных работ', 'Радуга', ARRAY['стандарт'], false, true),
('Валик для красок на водной основе для ровных поверхностей', (SELECT id FROM categories WHERE slug = 'rollers'), 1.03, 'Валик для водоэмульсионных красок', 'Радуга', ARRAY['60 мм', '100 мм'], false, true),
('Валик универсальный', (SELECT id FROM categories WHERE slug = 'rollers'), 15, 'Универсальный валик для различных покрытий', 'Радуга', ARRAY['стандарт'], false, true);

-- Insert products for Шпатели и вспомогательные инструменты
INSERT INTO public.products (name, category_id, price, description, brand, sizes, eco, in_stock) VALUES
('Шпатель правило', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 32.3, 'Длинное правило для выравнивания поверхностей', 'Радуга', ARRAY['стандарт'], false, true),
('Шпатель', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 2.65, 'Универсальный шпатель для отделочных работ', 'Радуга', ARRAY['40 мм', '60 мм', '100 мм', '300 мм'], false, true),
('Шпатель Фасадный', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 5.91, 'Широкий шпатель для фасадных работ', 'Радуга', ARRAY['стандарт'], false, true),
('Мини кельма круглая', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 3.67, 'Малая круглая кельма для точных работ', 'Радуга', ARRAY['стандарт'], false, true),
('Мини кельма овальная малая', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 3.67, 'Малая овальная кельма', 'Радуга', ARRAY['стандарт'], false, true),
('Кельма угловая', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 4.31, 'Угловая кельма для работы в углах', 'Радуга', ARRAY['стандарт'], false, true),
('Миксер для краски', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 2.37, 'Миксер для размешивания красок', 'Радуга', ARRAY['стандарт'], false, true),
('Миксер', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 11.57, 'Профессиональный миксер', 'Радуга', ARRAY['стандарт'], false, true),
('Малярная лента', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 8, 'Защитная лента для малярных работ', 'Радуга', ARRAY['стандарт'], false, true),
('Щетка', (SELECT id FROM categories WHERE slug = 'spatulas-accessories'), 12, 'Щетка для очистки поверхностей', 'Радуга', ARRAY['стандарт'], false, true);