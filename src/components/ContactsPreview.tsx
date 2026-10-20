import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import StoreLocator from "@/components/StoreLocator";

const ContactsPreview = () => {
  return (
    <section id="contacts" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-primary">
            Контакты
          </h2>
          <p className="text-muted-foreground">
            Два магазина: в Худжанде и Душанбе
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <StoreLocator />
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/contacts">
                Все контакты
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactsPreview;
