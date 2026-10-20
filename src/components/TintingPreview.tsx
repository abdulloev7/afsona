import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Clock } from "lucide-react";
import tintingMachine from "@/assets/tinting-machine.jpg";
import { FAN_DECKS, TINT_MACHINE, TINT_TIME } from "@/lib/facts";
import { t } from "@/i18n";

const TintingPreview = () => {
  return (
    <section className="py-16 bg-background" id="tinting">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 rounded-lg border border-border bg-card overflow-hidden">
          <img
            src={tintingMachine}
            alt={t("Колеровочный аппарат {machine} в магазине AFSONA", { machine: TINT_MACHINE })}
            className="w-full h-64 md:h-full object-cover"
            loading="lazy"
          />
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-foreground">{t("Колеровка краски")}</h2>
            <p className="text-muted-foreground mb-5">
              {t("Заколеруем краску в нужный цвет на аппарате {machine} прямо в магазине.", { machine: TINT_MACHINE })}
            </p>
            <ul className="space-y-2 mb-6 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary shrink-0" />
                {t("Веера {decks}", { decks: FAN_DECKS.join(", ") })}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                {t("Готово за {time}", { time: TINT_TIME })}
              </li>
            </ul>
            <Button asChild className="w-full sm:w-auto self-start">
              <Link to="/tinting">
                {t("Как это работает")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TintingPreview;
