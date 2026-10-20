import { Link } from "react-router-dom";
import {
  IconPhone,
  IconBrandWhatsapp,
  IconClock,
  IconMapPin,
  IconPalette,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DELIVERY_TEXT, FAN_DECKS, TINT_TIME } from "@/lib/facts";
import { STORE_HOURS, STORE_PHONE_DISPLAY, STORE_PHONE_HREF, STORE_WHATSAPP_URL } from "@/lib/contacts";
import { t } from "@/i18n";

// Text block under the banner: banners carry their copy inside the image,
// so this is the page's real heading for visitors and search engines.
// The right column is one white "counter" card: the two services people ask
// about most, then the phone and WhatsApp buttons.
const StoreIntro = () => {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-8 md:py-10 grid gap-6 lg:gap-12 md:grid-cols-[1fr_minmax(0,24rem)] lg:grid-cols-2 md:items-center">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
            {t("Краски и материалы для ремонта")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-4">
            {t("Интерьерные и фасадные краски, грунтовки, штукатурки, клеи и малярный инструмент.")}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
            <span className="inline-flex items-center gap-1.5">
              <IconClock size={16} stroke={1.75} className="text-primary" />
              {STORE_HOURS}
            </span>
            <Link to="/contacts" className="inline-flex items-center gap-1.5 underline underline-offset-4 decoration-primary/40 hover:text-primary">
              <IconMapPin size={16} stroke={1.75} className="text-primary" />
              {t("Худжанд и Душанбе: адреса")}
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 xl:gap-6 text-sm text-foreground mb-5">
            <li className="flex gap-3">
              <IconPalette size={20} stroke={1.75} className="text-primary shrink-0 mt-px" />
              <span>
                <Link to="/tinting" className="font-medium underline underline-offset-4 decoration-primary/40 hover:text-primary">
                  {t("Компьютерная колеровка за {time}", { time: TINT_TIME })}
                </Link>
                <span className="block text-muted-foreground">
                  {t("Веера {decks}", { decks: FAN_DECKS.join(", ") })}
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <IconTruckDelivery size={20} stroke={1.75} className="text-primary shrink-0 mt-px" />
              <span className="font-medium">{DELIVERY_TEXT}</span>
            </li>
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
            <Button asChild size="lg">
              <a href={STORE_PHONE_HREF}>
                <IconPhone size={18} stroke={1.75} className="mr-2" />
                {STORE_PHONE_DISPLAY}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={STORE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <IconBrandWhatsapp size={18} stroke={1.75} className="mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreIntro;
