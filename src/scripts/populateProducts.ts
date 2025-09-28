// Script to populate products database with existing data
import { supabase } from '@/integrations/supabase/client';

// Wall Paints Data
const wallPaintsData = [
  {
    name: "Интерьерная краска Premium",
    description: "Высококачественная интерьерная краска с матовым финишем. Идеально подходит для стен в жилых помещениях.",
    price: 245.00,
    image: "/public/lovable-uploads/0cfee039-9423-4008-a9cd-6439832fb35b.png",
    features: ["Матовый финиш", "Износостойкая", "Легко наносится", "Быстро сохнет"],
    eco: true,
    brand: "AFSONA Premium",
    sizes: ["1л", "2.5л", "5л", "10л"]
  },
  {
    name: "Краска для стен Эко",
    description: "Экологически чистая краска без запаха. Безопасна для детских комнат и спален.",
    price: 189.00,
    image: "/public/lovable-uploads/71f2c8f2-9a50-40f6-a04a-ed72628711e1.png",
    features: ["Без запаха", "Экологична", "Гипоаллергенна", "Высокая укрывистость"],
    eco: true,
    brand: "AFSONA Eco",
    sizes: ["1л", "2.5л", "5л"]
  },
  {
    name: "Латексная краска Deluxe",
    description: "Прочная латексная краска с шелковистым блеском. Устойчива к влаге и загрязнениям.",
    price: 299.00,
    image: "/public/lovable-uploads/91661c6f-f1ee-4df4-8e2d-ccfb828393fc.png",
    features: ["Шелковистый блеск", "Влагостойкая", "Моющаяся", "Долговечная"],
    eco: false,
    brand: "AFSONA Deluxe",
    sizes: ["2.5л", "5л", "10л"]
  }
];

// Ceiling Paints Data
const ceilingPaintsData = [
  {
    name: "Потолочная краска Белоснежная",
    description: "Специальная краска для потолков с высокой укрывистостью и матовым финишем.",
    price: 210.00,
    image: "/public/lovable-uploads/c88946de-deb3-4226-930f-77d2f016ef99.png",
    features: ["Матовый финиш", "Высокая укрывистость", "Не капает", "Белоснежный цвет"],
    eco: true,
    brand: "AFSONA Ceiling",
    sizes: ["2.5л", "5л", "10л"]
  },
  {
    name: "Краска потолочная Премиум",
    description: "Премиальная потолочная краска с улучшенной формулой для идеального покрытия.",
    price: 275.00,
    image: "/public/lovable-uploads/0cfee039-9423-4008-a9cd-6439832fb35b.png",
    features: ["Улучшенная формула", "Легкое нанесение", "Равномерное покрытие", "Быстрое высыхание"],
    eco: true,
    brand: "AFSONA Premium",
    sizes: ["1л", "2.5л", "5л", "10л"]
  }
];

// Facade Paints Data
const facadePaintsData = [
  {
    name: "Фасадная краска Стойкая",
    description: "Атмосферостойкая фасадная краска для наружных работ с защитой от UV-излучения.",
    price: 320.00,
    image: "/public/lovable-uploads/71f2c8f2-9a50-40f6-a04a-ed72628711e1.png",
    features: ["UV защита", "Атмосферостойкая", "Паропроницаемая", "Долговечная"],
    eco: false,
    brand: "AFSONA Facade",
    sizes: ["2.5л", "5л", "10л", "20л"]
  },
  {
    name: "Краска фасадная Эко Плюс",
    description: "Экологичная фасадная краска с улучшенными защитными свойствами.",
    price: 385.00,
    image: "/public/lovable-uploads/91661c6f-f1ee-4df4-8e2d-ccfb828393fc.png",
    features: ["Экологична", "Самоочищающаяся", "Высокая адгезия", "Цветостойкая"],
    eco: true,
    brand: "AFSONA Eco Plus",
    sizes: ["5л", "10л", "20л"]
  }
];

// Primers Data
const primersData = [
  {
    name: "Грунтовка универсальная",
    description: "Универсальная грунтовка глубокого проникновения для всех типов поверхностей.",
    price: 165.00,
    image: "/public/lovable-uploads/c88946de-deb3-4226-930f-77d2f016ef99.png",
    features: ["Глубокое проникновение", "Укрепляет основание", "Быстро сохнет", "Экономичный расход"],
    eco: true,
    brand: "AFSONA Base",
    sizes: ["1л", "2.5л", "5л", "10л"]
  },
  {
    name: "Грунт-концентрат Профи",
    description: "Концентрированная грунтовка для профессионального применения.",
    price: 195.00,
    image: "/public/lovable-uploads/0cfee039-9423-4008-a9cd-6439832fb35b.png",
    features: ["Концентрат 1:5", "Глубокое проникновение", "Антисептические добавки", "Универсальная"],
    eco: false,
    brand: "AFSONA Professional",
    sizes: ["1л", "2.5л", "5л"]
  }
];

// Decorative Coatings Data
const decorativeCoatingsData = [
  {
    name: "Декоративная штукатурка Барашек",
    description: "Декоративная минеральная штукатурка с фактурой 'барашек' для интерьера и фасада.",
    price: 450.00,
    image: "/public/lovable-uploads/71f2c8f2-9a50-40f6-a04a-ed72628711e1.png",
    features: ["Минеральная основа", "Фактура барашек", "Паропроницаемая", "Колеруется"],
    eco: true,
    brand: "AFSONA Decorative",
    sizes: ["15кг", "25кг"]
  },
  {
    name: "Венецианская штукатурка Люкс",
    description: "Элитная венецианская штукатурка для создания роскошных интерьеров.",
    price: 680.00,
    image: "/public/lovable-uploads/91661c6f-f1ee-4df4-8e2d-ccfb828393fc.png",
    features: ["Мраморный эффект", "Глянцевый финиш", "Водостойкая", "Ручная работа"],
    eco: false,
    brand: "AFSONA Luxury",
    sizes: ["5кг", "10кг", "20кг"]
  }
];

// Tools Data
const toolsData = [
  {
    name: "Валик малярный премиум 25см",
    description: "Профессиональный малярный валик с велюровой шубкой для идеального нанесения краски.",
    price: 89.00,
    image: "/public/lovable-uploads/c88946de-deb3-4226-930f-77d2f016ef99.png",
    features: ["Велюровая шубка", "Эргономичная ручка", "Равномерное нанесение", "Долговечный"],
    eco: false,
    brand: "AFSONA Tools",
    sizes: ["25см"]
  },
  {
    name: "Кисть плоская 100мм",
    description: "Плоская кисть из натуральной щетины для точных малярных работ.",
    price: 125.00,
    image: "/public/lovable-uploads/0cfee039-9423-4008-a9cd-6439832fb35b.png",
    features: ["Натуральная щетина", "Эргономичная ручка", "Не оставляет разводов", "Профессиональное качество"],
    eco: false,
    brand: "AFSONA Professional",
    sizes: ["100мм"]
  },
  {
    name: "Шпатель металлический 20см",
    description: "Металлический шпатель для нанесения и выравнивания шпаклевочных составов.",
    price: 156.00,
    image: "/public/lovable-uploads/71f2c8f2-9a50-40f6-a04a-ed72628711e1.png",
    features: ["Нержавеющая сталь", "Удобная ручка", "Гибкое лезвие", "Профессиональный инструмент"],
    eco: false,
    brand: "AFSONA Tools",
    sizes: ["20см"]
  }
];

export const populateProducts = async () => {
  try {
    console.log('Starting to populate products...');

    // Get category IDs
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug');

    if (categoriesError) throw categoriesError;

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as { [key: string]: string });

    // Prepare all products data
    const allProducts = [
      ...wallPaintsData.map(p => ({ ...p, category_id: categoryMap['wall-paints'] })),
      ...ceilingPaintsData.map(p => ({ ...p, category_id: categoryMap['ceiling-paints'] })),
      ...facadePaintsData.map(p => ({ ...p, category_id: categoryMap['facade-paints'] })),
      ...primersData.map(p => ({ ...p, category_id: categoryMap['primers'] })),
      ...decorativeCoatingsData.map(p => ({ ...p, category_id: categoryMap['decorative-coatings'] })),
      ...toolsData.map(p => ({ ...p, category_id: categoryMap['tools'] }))
    ];

    // Insert products
    const { error: productsError } = await supabase
      .from('products')
      .insert(allProducts);

    if (productsError) throw productsError;

    console.log('Products populated successfully!');
    return { success: true, count: allProducts.length };
  } catch (error) {
    console.error('Error populating products:', error);
    return { success: false, error };
  }
};