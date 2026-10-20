import { NUMBER_LOCALE, t } from "@/i18n";

// Facts about the store confirmed by the owner (2026-10-20). Keep site copy to these.
// Owner said "about 4 years" (2026-10-20); change here if it turns out different.
export const YEARS_IN_BUSINESS = 4;
export const FAN_DECKS = ["Caparol", "Nova", "NCS"];
export const TINT_TIME = t("5–10 минут");
export const TINT_MACHINE = "Sigma Tint";
export const DELIVERY_MIN_ORDER = 2000;
export const DELIVERY_TEXT = t("Доставка по городу при заказе от {amount} сом", {
  amount: DELIVERY_MIN_ORDER.toLocaleString(NUMBER_LOCALE),
});
// In Dushanbe tinting with AFSONA colorants is done at three partner shops.
export const DUSHANBE_TINT_NOTE = t(
  "В Душанбе краску по нашим колорантам колеруют в трёх магазинах. Подскажем ближайший по телефону.",
);
