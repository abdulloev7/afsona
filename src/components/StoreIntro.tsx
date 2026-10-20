import { Link } from "react-router-dom";
import { IconPhone, IconBrandWhatsapp, IconClock, IconMapPin } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { STORE_HOURS, STORE_PHONE_DISPLAY, STORE_PHONE_HREF, STORE_WHATSAPP_URL } from "@/lib/contacts";

// Text block under the banner: banners carry their copy inside the image,
// so this is the page's real heading for visitors and search engines.
const StoreIntro = () => {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-8 md:py-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Краски и материалы для ремонта
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-4">
            Интерьерные и фасадные краски, грунтовки, штукатурки, клеи и малярный инструмент.
            Компьютерная колеровка за <span className="whitespace-nowrap">5–10 минут</span>.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
            <span className="inline-flex items-center gap-1.5">
              <IconClock size={16} stroke={1.75} className="text-primary" />
              {STORE_HOURS}
            </span>
            <Link to="/contacts" className="inline-flex items-center gap-1.5 underline underline-offset-4 decoration-primary/40 hover:text-primary">
              <IconMapPin size={16} stroke={1.75} className="text-primary" />
              Худжанд и Душанбе: адреса
            </Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <a href={STORE_PHONE_HREF}>
              <IconPhone size={18} stroke={1.75} className="mr-2" />
              {STORE_PHONE_DISPLAY}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-card">
            <a href={STORE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <IconBrandWhatsapp size={18} stroke={1.75} className="mr-2" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StoreIntro;
