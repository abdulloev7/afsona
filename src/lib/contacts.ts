export const STORE_PHONE_DISPLAY = "+992 927 55 79 19";
export const STORE_PHONE_HREF = "tel:+992927557919";
export const STORE_WHATSAPP_URL = "https://wa.me/992927557919";

export type StorePhone = { display: string; href: string };

export type Store = {
  city: string;
  address: string;
  phones: StorePhone[];
  mapUrl: string;
};

// Same addresses as the Telegram bot (api/telegram.js). Map links search by
// name until the store owner sends exact pins.
const mapSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const STORES: Store[] = [
  {
    city: "Худжанд",
    address: "Джумъа бозор",
    phones: [{ display: STORE_PHONE_DISPLAY, href: STORE_PHONE_HREF }],
    mapUrl: mapSearch("Джума базар, Худжанд"),
  },
  {
    city: "Душанбе",
    address: "Базар Кушониён, блок 7, вход между линиями 3 и 4, магазин 797",
    phones: [
      { display: "+992 906 66 70 60", href: "tel:+992906667060" },
      { display: "+992 501 79 52 79", href: "tel:+992501795279" },
    ],
    mapUrl: mapSearch("Базар Кушониён, Душанбе"),
  },
];

export const STORE_HOURS = "Пн–Сб 08:00–18:00, обед 12:00–13:00";
