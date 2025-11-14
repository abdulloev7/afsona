import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  category: { name: string; slug: string } | null;
  brand: string | null;
  brand_info: { name: string } | null;
  price: number;
  image: string | null;
  category_id: string;
}

interface GroupedResults {
  [key: string]: SearchResult[];
}

const groupByCategory = (results: SearchResult[]): GroupedResults => {
  return results.reduce((acc, item) => {
    const categoryName = item.category?.name || "Без категории";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as GroupedResults);
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const latestRequestId = useRef(0);

  // Обработка Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Поиск с debounce
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      const requestId = ++latestRequestId.current;
      const searchTerm = `%${q}%`;

      const selectFields = `
        id,
        name,
        description,
        brand,
        price,
        image,
        category_id,
        category:categories(name, slug),
        brand_info:brands(name)
      `;

      try {
        // Параллельно ищем категории и прямые совпадения товаров
        const [catsResp, directResp] = await Promise.all([
          supabase
            .from('categories')
            .select('id, name, slug')
            .ilike('name', searchTerm)
            .limit(10),
          supabase
            .from('products')
            .select(selectFields)
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},brand.ilike.${searchTerm}`)
            .eq('archived', false)
            .eq('in_stock', true)
            .limit(30),
        ]);

        const cats = catsResp.data || [];
        const direct = (directResp.data || []) as SearchResult[];

        // Поиск по категориям если найдены
        let byCategory: SearchResult[] = [];
        if (cats.length) {
          const catIds = cats.map(c => c.id);
          const catProductsResp = await supabase
            .from('products')
            .select(selectFields)
            .in('category_id', catIds)
            .eq('archived', false)
            .eq('in_stock', true)
            .limit(50);
          byCategory = (catProductsResp.data as SearchResult[]) || [];
        }

        // Применяем результат только если это самый свежий запрос
        if (requestId === latestRequestId.current) {
          const merged = new Map<string, SearchResult>();
          [...direct, ...byCategory].forEach(p => merged.set(p.id, p));
          setResults(Array.from(merged.values()));
          setLoading(false);
        }
      } catch (e) {
        if (requestId === latestRequestId.current) {
          setResults([]);
          setLoading(false);
        }
        console.error('Search error:', e);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSelectItem = (item: SearchResult) => {
    navigate(`/product/${item.id}`);
    setOpen(false);
    setSearch("");
  };

  const scrollToSection = (sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Поиск товаров, брендов, категорий..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {!search && (
              <CommandGroup heading="Быстрые ссылки">
                <CommandItem onSelect={() => scrollToSection('tinting')}>
                  Услуга колеровки
                </CommandItem>
                <CommandItem onSelect={() => scrollToSection('brands')}>
                  Наши бренды
                </CommandItem>
                <CommandItem onSelect={() => scrollToSection('contacts')}>
                  Контакты
                </CommandItem>
              </CommandGroup>
            )}

            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Поиск...
              </div>
            )}
            {!loading && search && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </div>
            )}
            
            {/* Группировка по категориям */}
            {Object.entries(groupByCategory(results)).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelectItem(item)}
                  >
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.brand_info?.name || item.brand} • {item.price.toLocaleString('ru-RU')} сом.
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        
        {/* Подсказка для клавиатуры */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Нажмите <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">K</kbd> для быстрого поиска
        </div>
      </DialogContent>
    </Dialog>
  );
}
