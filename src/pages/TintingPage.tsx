import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Clock, Palette, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSeo } from "@/hooks/useSeo";
import tintingMachine from "@/assets/tinting-machine.jpg";
import { STORE_PHONE_DISPLAY, STORE_PHONE_HREF, STORE_WHATSAPP_URL } from "@/lib/contacts";
import { DUSHANBE_TINT_NOTE, FAN_DECKS, TINT_MACHINE, TINT_TIME } from "@/lib/facts";
import { t } from "@/i18n";

const TINT_WHATSAPP_URL = `${STORE_WHATSAPP_URL}?text=${encodeURIComponent(
  `${t("Здравствуйте! Хочу заколеровать краску. Цвет:")} `,
)}`;

const STEPS = [
  t("Выбираете цвет по вееру в магазине или приносите свой образец"),
  t("Подбираем краску-основу под вашу задачу: стены, потолок, фасад"),
  t("Аппарат {machine} по формуле добавляет колоранты", { machine: TINT_MACHINE }),
  t("Через {time} забираете готовую краску", { time: TINT_TIME }),
];

const TintingPage = () => {
  useSeo({
    title: t("Колеровка краски"),
    description: t("Колеровка краски в AFSONA на аппарате {machine}: цвета по веерам {decks}, готово за {time}.", {
      machine: TINT_MACHINE,
      decks: FAN_DECKS.join(", "),
      time: TINT_TIME,
    }),
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center mb-16">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold mb-5 text-foreground">{t("Колеровка краски")}</h1>
              <p className="text-lg text-muted-foreground mb-6">
                {t("Колеруем краску на аппарате {machine} прямо в магазине в Худжанде. Выберите цвет по вееру или принесите образец, и через {time} краска готова.", {
                  machine: TINT_MACHINE,
                  time: TINT_TIME,
                })}
              </p>
              <ul className="space-y-3 mb-8 text-foreground">
                <li className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t("Веера {decks}", { decks: FAN_DECKS.join(", ") })}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t("Готово за {time}", { time: TINT_TIME })}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{DUSHANBE_TINT_NOTE}</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <a href={TINT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp className="w-5 h-5 mr-2" />
                    {t("Написать в WhatsApp")}
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-card">
                  <a href={STORE_PHONE_HREF}>
                    <Phone className="w-5 h-5 mr-2" />
                    {STORE_PHONE_DISPLAY}
                  </a>
                </Button>
              </div>
            </div>
            <figure className="rounded-lg overflow-hidden border border-border bg-card">
              <img
                src={tintingMachine}
                alt={t("Колеровочный аппарат {machine} в магазине AFSONA", { machine: TINT_MACHINE })}
                className="w-full aspect-[4/5] object-cover"
              />
            </figure>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">{t("Как это происходит")}</h2>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((step, index) => (
                <li key={index} className="rounded-lg border border-border bg-card p-5">
                  <span className="block text-sm font-semibold text-primary mb-2">{t("Шаг {n}", { n: index + 1 })}</span>
                  <p className="text-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">{t("Цветовые веера")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("Веера лежат в магазине, по ним удобно выбрать цвет вживую. Номер цвета можно прислать и в WhatsApp.")}
            </p>
            <div className="flex flex-wrap gap-3">
              {FAN_DECKS.map((deck) => (
                <span
                  key={deck}
                  className="rounded-lg border border-border bg-card px-5 py-3 text-lg font-semibold text-foreground"
                >
                  {deck}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-primary text-primary-foreground p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">{t("Знаете номер цвета?")}</h2>
            <p className="text-primary-foreground/85 mb-6 max-w-2xl">
              {t("Напишите его в WhatsApp вместе с нужным объёмом. Подскажем, какая основа подойдёт, и сколько это будет стоить.")}
            </p>
            <Button asChild size="lg" variant="secondary">
              <a href={TINT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="w-5 h-5 mr-2" />
                {t("Написать в WhatsApp")}
              </a>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TintingPage;
