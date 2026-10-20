import { Link } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { STORES, STORE_HOURS, STORE_WHATSAPP_URL } from "@/lib/contacts";

// "Where to buy" box on the product page: ask on WhatsApp or come to a store.
const ProductStores = ({ productName }: { productName: string }) => {
  const whatsappUrl = `${STORE_WHATSAPP_URL}?text=${encodeURIComponent(
    `Здравствуйте! Интересует товар: ${productName}. Есть в наличии?`,
  )}`;

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">Есть вопрос по товару?</h2>
        <p className="text-sm text-muted-foreground">
          Подскажем по наличию, расходу и цвету. Отвечаем в рабочее время.
        </p>
      </div>
      <Button asChild variant="outline" className="w-full">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp className="mr-2 h-4 w-4" />
          Спросить в WhatsApp
        </a>
      </Button>
      <div className="border-t border-border pt-4">
        <h2 className="text-base font-semibold text-foreground mb-3">Купить в магазине</h2>
        <ul className="space-y-3">
          {STORES.map((store) => (
            <li key={store.city} className="text-sm">
              <p className="flex items-start gap-2 text-foreground">
                <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <span className="font-medium">{store.city}</span>, {store.address}
                </span>
              </p>
              <a
                href={store.phones[0].href}
                className="flex items-center gap-2 mt-1 text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                {store.phones[0].display}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mt-3">
          {STORE_HOURS}.{" "}
          <Link to="/contacts" className="text-primary underline underline-offset-4 decoration-primary/40">
            Карта и все телефоны
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ProductStores;
