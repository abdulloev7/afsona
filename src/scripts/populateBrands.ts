import { supabase } from "@/integrations/supabase/client";

/**
 * Скрипт для добавления брендов в базу данных
 * Запустите этот скрипт один раз для добавления начальных брендов
 */

const brands = [
  {
    name: 'Soudal',
    slug: 'soudal',
    description: 'Ведущий производитель герметиков, монтажных пен и клеев из Бельгии. Компания предлагает широкий ассортимент высококачественных строительных химических продуктов для профессионалов и домашнего использования.',
    country: 'Бельгия',
    established_year: 1966,
    website: 'https://www.soudal.com',
    display_order: 0,
  },
  {
    name: 'Радуга',
    slug: 'raduga',
    description: 'Российский производитель строительных и отделочных материалов. Бренд известен своими качественными красками, грунтовками и шпатлевками по доступным ценам.',
    country: 'Россия',
    established_year: null,
    website: null,
    display_order: 1,
  },
  {
    name: 'San Marito',
    slug: 'san-marito',
    description: 'Производитель декоративных покрытий и интерьерных красок премиум-класса. Специализируется на создании уникальных текстур и эффектов для современного дизайна интерьеров.',
    country: null,
    established_year: null,
    website: null,
    display_order: 2,
  },
  {
    name: 'Alantex',
    slug: 'alantex',
    description: 'Надежный производитель строительных материалов и покрытий. Компания предлагает широкий спектр продукции для различных видов строительных и отделочных работ.',
    country: null,
    established_year: null,
    website: null,
    display_order: 3,
  },
];

export const populateBrands = async () => {
  try {
    console.log('Начинаем добавление брендов...');

    for (const brand of brands) {
      // Проверяем, существует ли бренд
      const { data: existing } = await supabase
        .from('brands' as any)
        .select('id')
        .eq('slug', brand.slug)
        .maybeSingle() as any;

      if (existing) {
        console.log(`Бренд ${brand.name} уже существует, пропускаем...`);
        continue;
      }

      // Добавляем бренд
      const { error } = await supabase
        .from('brands' as any)
        .insert([brand]) as any;

      if (error) {
        console.error(`Ошибка при добавлении бренда ${brand.name}:`, error);
      } else {
        console.log(`✓ Бренд ${brand.name} успешно добавлен`);
      }
    }

    console.log('Готово! Все бренды добавлены.');
  } catch (error) {
    console.error('Ошибка при добавлении брендов:', error);
  }
};

// Раскомментируйте строку ниже и запустите этот файл для добавления брендов
// populateBrands();
