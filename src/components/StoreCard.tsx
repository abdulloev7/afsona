import { MapPin, Phone, ExternalLink } from "lucide-react";
import type { Store } from "@/lib/contacts";

const StoreCard = ({ store }: { store: Store }) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h3 className="text-lg font-semibold text-foreground mb-3">{store.city}</h3>
    <p className="flex items-start gap-2 text-sm text-foreground mb-3">
      <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
      {store.address}
    </p>
    <div className="space-y-1.5 mb-4">
      {store.phones.map((phone) => (
        <a
          key={phone.href}
          href={phone.href}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <Phone className="w-4 h-4 shrink-0 text-primary" />
          {phone.display}
        </a>
      ))}
    </div>
    <a
      href={store.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
    >
      Открыть на карте
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  </div>
);

export default StoreCard;
