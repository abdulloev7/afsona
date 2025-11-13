import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pbdmochmasoylofhasrk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZG1vY2htYXNveWxvZmhhc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjA5MzIsImV4cCI6MjA3NDYzNjkzMn0.E6Cui94_fN8x_aV6JccT2DWLFjPKBbh6K4NAUY3J278";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface BrandMapping {
  id: string;
  name: string;
  keywords: string[];
  brandTextMatch?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  brand_id: string | null;
}

interface MigrationStats {
  total: number;
  updated: number;
  unchanged: number;
  byBrand: Record<string, number>;
  unassigned: Product[];
}

async function migrateBrandIds(dryRun: boolean = true) {
  console.log('🚀 Начало миграции товаров по брендам...');
  console.log(`📋 Режим: ${dryRun ? 'DRY RUN (без изменений)' : 'ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ'}\n`);

  // Получаем все бренды
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*') as { data: Brand[] | null; error: any };

  if (brandsError || !brands) {
    console.error('❌ Ошибка загрузки брендов:', brandsError);
    return;
  }

  // Создаем маппинг брендов с правилами сопоставления
  const brandMappings: BrandMapping[] = [
    {
      id: brands.find(b => b.name === 'Радуга')?.id || '',
      name: 'Радуга',
      brandTextMatch: 'Радуга',
      keywords: [
        'Радуга-', 'Комфорт', 'Фасадная', 'Extra', 'Aquablock',
        'Интерьерная', 'Краска для потолков', 'Грунтовка',
        'Шпатлевка', 'Валик', 'Кисть', 'Шпатель', 'Колер'
      ]
    },
    {
      id: brands.find(b => b.name === 'Soudal')?.id || '',
      name: 'Soudal',
      brandTextMatch: 'Soudal',
      keywords: ['SOUDAL', 'SOUDAFOAM', 'SILIRUB', 'ACRYRUB', 'Soudal']
    },
    {
      id: brands.find(b => b.name === 'San Marito')?.id || '',
      name: 'San Marito',
      brandTextMatch: 'San Marito',
      keywords: ['San Marito', 'Quarzo', 'Ottocenture', 'Sahara']
    },
    {
      id: brands.find(b => b.name === 'Alantex')?.id || '',
      name: 'Alantex',
      brandTextMatch: 'Alantex',
      keywords: ['Alantex']
    }
  ];

  console.log('📊 Найдено брендов:', brands.length);
  brandMappings.forEach(b => console.log(`   - ${b.name} (ID: ${b.id})`));
  console.log();

  // Получаем все товары
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, brand, brand_id')
    .eq('archived', false) as { data: Product[] | null; error: any };

  if (productsError || !products) {
    console.error('❌ Ошибка загрузки товаров:', productsError);
    return;
  }

  console.log(`📦 Загружено товаров: ${products.length}\n`);

  const stats: MigrationStats = {
    total: products.length,
    updated: 0,
    unchanged: 0,
    byBrand: {},
    unassigned: []
  };

  const updates: Array<{ id: string; brand_id: string; brand_name: string }> = [];

  // Анализируем каждый товар
  for (const product of products) {
    let matchedBrand: BrandMapping | null = null;

    // Сначала проверяем точное совпадение с текстовым полем brand
    for (const brandMapping of brandMappings) {
      if (brandMapping.brandTextMatch && 
          product.brand?.toLowerCase() === brandMapping.brandTextMatch.toLowerCase()) {
        matchedBrand = brandMapping;
        break;
      }
    }

    // Если не нашли по текстовому полю, ищем по ключевым словам в названии
    if (!matchedBrand) {
      for (const brandMapping of brandMappings) {
        const nameMatch = brandMapping.keywords.some(keyword => 
          product.name.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (nameMatch) {
          matchedBrand = brandMapping;
          break;
        }
      }
    }

    if (matchedBrand && matchedBrand.id) {
      // Проверяем, нужно ли обновлять
      if (product.brand_id !== matchedBrand.id) {
        stats.updated++;
        stats.byBrand[matchedBrand.name] = (stats.byBrand[matchedBrand.name] || 0) + 1;
        updates.push({
          id: product.id,
          brand_id: matchedBrand.id,
          brand_name: matchedBrand.name
        });
      } else {
        stats.unchanged++;
      }
    } else {
      // Товар не сопоставлен ни с одним брендом
      if (product.brand_id === null) {
        stats.unassigned.push(product);
      } else {
        stats.unchanged++;
      }
    }
  }

  // Выводим отчет
  console.log('📊 ОТЧЕТ О МИГРАЦИИ:');
  console.log('━'.repeat(60));
  console.log(`Всего товаров: ${stats.total}`);
  console.log(`Будет обновлено: ${stats.updated}`);
  console.log(`Без изменений: ${stats.unchanged}`);
  console.log(`Не сопоставлено: ${stats.unassigned.length}\n`);

  if (Object.keys(stats.byBrand).length > 0) {
    console.log('📈 Обновления по брендам:');
    Object.entries(stats.byBrand).forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} товаров`);
    });
    console.log();
  }

  if (stats.unassigned.length > 0) {
    console.log(`⚠️  Товары без бренда (${stats.unassigned.length}):`);
    stats.unassigned.slice(0, 10).forEach(p => {
      console.log(`   - ${p.name} ${p.brand ? `(бренд: ${p.brand})` : ''}`);
    });
    if (stats.unassigned.length > 10) {
      console.log(`   ... и еще ${stats.unassigned.length - 10} товаров`);
    }
    console.log();
  }

  // Применяем изменения, если не dry-run
  if (!dryRun && updates.length > 0) {
    console.log('💾 Применение изменений к базе данных...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      const { error } = await supabase
        .from('products')
        .update({ brand_id: update.brand_id } as any)
        .eq('id', update.id);

      if (error) {
        console.error(`❌ Ошибка обновления товара ${update.id}:`, error);
        errorCount++;
      } else {
        successCount++;
      }
    }

    console.log('\n✅ РЕЗУЛЬТАТЫ:');
    console.log(`   Успешно обновлено: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   Ошибок: ${errorCount}`);
    }
  } else if (dryRun) {
    console.log('ℹ️  Для применения изменений запустите скрипт с флагом --apply');
    console.log('   Пример: node migrateBrandIds.ts --apply\n');
  }

  console.log('━'.repeat(60));
  console.log('✨ Миграция завершена!\n');
}

// Запуск скрипта
const isDryRun = !process.argv.includes('--apply');
migrateBrandIds(isDryRun).catch(console.error);
