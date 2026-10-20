export const STORE_PHONE_DISPLAY = "+992 927 55 79 19";
export const STORE_PHONE_HREF = "tel:+992927557919";
export const STORE_WHATSAPP_URL = "https://wa.me/992927557919";

export type StorePhone = { display: string; href: string };

export type Store = {
  city: string;
  address: string;
  phones: StorePhone[];
  mapUrl: string;
  lat: number;
  lng: number;
};

export const mapEmbedUrl = (store: Store) =>
  `https://www.google.com/maps?q=${store.lat},${store.lng}&z=17&output=embed`;

export const yandexMapUrl = (store: Store) =>
  `https://yandex.ru/maps/?pt=${store.lng},${store.lat}&z=17&l=map`;

// Same addresses as the Telegram bot (api/telegram.js); map pins from the owner.
export const STORES: Store[] = [
  {
    city: "Худжанд",
    address: "Джумъа бозор",
    phones: [{ display: STORE_PHONE_DISPLAY, href: STORE_PHONE_HREF }],
    mapUrl: "https://maps.app.goo.gl/GLjf89PfguoddwVz5",
    lat: 40.294528,
    lng: 69.6087954,
  },
  {
    city: "Душанбе",
    address: "Базар Кушониён, блок 7, вход между линиями 3 и 4, магазин 797",
    phones: [
      { display: "+992 906 66 70 60", href: "tel:+992906667060" },
      { display: "+992 501 79 52 79", href: "tel:+992501795279" },
    ],
    mapUrl: "https://maps.app.goo.gl/Hk5hH399Yy8MiBXz8",
    lat: 38.6326319,
    lng: 68.7662565,
  },
];

export const STORE_HOURS = "Пн–Сб 08:00–18:00, обед 12:00–13:00";
