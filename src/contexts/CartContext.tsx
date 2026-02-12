import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_size?: string | null;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    sizes?: string[] | null;
    size_variants?: { volume: string; price: number }[] | null;
    category_id?: string;
    brand_id?: string | null;
    category?: { id: string; name: string; slug: string } | null;
    brand?: { id: string; name: string } | null;
  };
}

// Category groups for visual separation
export const CATEGORY_GROUPS: Record<string, { label: string; order: number }> = {
  'paints-and-coatings': { label: 'Краски и покрытия', order: 1 },
  'decorative-coatings': { label: 'Декоративные покрытия', order: 2 },
  'primers-preparatory': { label: 'Подготовка поверхности', order: 3 },
  'putties-leveling': { label: 'Шпатлевки и выравнивание', order: 4 },
  'waterproofing': { label: 'Гидроизоляция', order: 5 },
  'adhesives-sealants': { label: 'Клеи и герметики', order: 6 },
  'tints-thinners': { label: 'Колеры и разбавители', order: 7 },
  'brushes-tools': { label: 'Инструменты', order: 8 },
  'rollers': { label: 'Валики', order: 8 },
  'spatulas-accessories': { label: 'Инструменты', order: 8 },
};

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number, selectedSize?: string | null) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// localStorage helpers
const GUEST_CART_KEY = 'afsona_guest_cart';

interface GuestCartEntry {
  id: string;
  product_id: string;
  quantity: number;
  selected_size: string | null;
  created_at: string;
}

const loadGuestCart = (): GuestCartEntry[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (entries: GuestCartEntry[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(entries));
};

const clearGuestCartStorage = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

const generateId = () => crypto.randomUUID();

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Fetch product details for guest cart entries
  const hydrateGuestCart = useCallback(async (entries: GuestCartEntry[]): Promise<CartItem[]> => {
    if (entries.length === 0) return [];
    const productIds = [...new Set(entries.map(e => e.product_id))];
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, image, sizes, size_variants, category_id, brand_id, category:categories(id, name, slug), brand:brands(id, name)')
      .in('id', productIds);

    if (!products) return [];
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    return entries
      .filter(e => productMap.has(e.product_id))
      .map(e => ({
        id: e.id,
        product_id: e.product_id,
        quantity: e.quantity,
        selected_size: e.selected_size,
        created_at: e.created_at,
        product: {
          ...productMap.get(e.product_id)!,
          size_variants: productMap.get(e.product_id)!.size_variants as { volume: string; price: number }[] | null,
        },
      }));
  }, []);

  // Merge guest cart into Supabase on login
  const mergeGuestCartToDb = useCallback(async (userId: string) => {
    const guestEntries = loadGuestCart();
    if (guestEntries.length === 0) return;

    for (const entry of guestEntries) {
      try {
        // Check if item already in DB cart
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', entry.product_id)
          .eq('selected_size', entry.selected_size ?? '')
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + entry.quantity })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: entry.product_id,
              quantity: entry.quantity,
              selected_size: entry.selected_size,
            });
        }
      } catch (err) {
        console.error('Error merging guest cart item:', err);
      }
    }
    clearGuestCartStorage();
  }, []);

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      // Load guest cart
      const guestEntries = loadGuestCart();
      if (guestEntries.length > 0) {
        const hydrated = await hydrateGuestCart(guestEntries);
        setItems(hydrated);
      } else {
        setItems([]);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          selected_size,
          created_at,
          product:products(
            id, 
            name, 
            price, 
            image, 
            sizes, 
            size_variants,
            category_id,
            brand_id,
            category:categories(id, name, slug),
            brand:brands(id, name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data as any[])?.map(item => ({
        ...item,
        product: {
          ...item.product,
          size_variants: item.product?.size_variants as { volume: string; price: number }[] | null,
          category: item.product?.category,
          brand: item.product?.brand,
        }
      })) || [];
      
      setItems(typedData);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить корзину",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, hydrateGuestCart, toast]);

  useEffect(() => {
    const init = async () => {
      if (session && user) {
        await mergeGuestCartToDb(user.id);
        await fetchCartItems();
      } else {
        await fetchCartItems();
      }
    };
    init();
  }, [session, user]);

  const addToCart = async (productId: string, quantity: number = 1, selectedSize: string | null = null) => {
    // Guest cart (localStorage)
    if (!user) {
      // Validate variants
      const { data: productData } = await supabase
        .from('products')
        .select('size_variants')
        .eq('id', productId)
        .single();
      const sizeVariants = productData?.size_variants as { volume: string; price: number }[] | null;
      if (sizeVariants && sizeVariants.length > 0 && !selectedSize) {
        toast({ title: "Ошибка", description: "Пожалуйста, выберите объем товара", variant: "destructive" });
        return;
      }

      const guestEntries = loadGuestCart();
      const existingIdx = guestEntries.findIndex(e => e.product_id === productId && e.selected_size === selectedSize);
      if (existingIdx >= 0) {
        guestEntries[existingIdx].quantity += quantity;
      } else {
        guestEntries.push({ id: generateId(), product_id: productId, quantity, selected_size: selectedSize, created_at: new Date().toISOString() });
      }
      saveGuestCart(guestEntries);
      const hydrated = await hydrateGuestCart(guestEntries);
      setItems(hydrated);
      toast({ title: "Товар добавлен", description: "Товар успешно добавлен в корзину" });
      return;
    }

    // Authenticated cart (Supabase)
    try {
      const { data: productData } = await supabase
        .from('products')
        .select('size_variants')
        .eq('id', productId)
        .single();
      const sizeVariants = productData?.size_variants as { volume: string; price: number }[] | null;
      if (sizeVariants && sizeVariants.length > 0 && !selectedSize) {
        toast({ title: "Ошибка", description: "Пожалуйста, выберите объем товара", variant: "destructive" });
        return;
      }

      const existingItem = items.find(item => item.product_id === productId && item.selected_size === selectedSize);
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity, selected_size: selectedSize });
        if (error) throw error;
        await fetchCartItems();
        toast({ title: "Товар добавлен", description: "Товар успешно добавлен в корзину" });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({ title: "Ошибка", description: "Не удалось добавить товар в корзину", variant: "destructive" });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    if (!user) {
      // Guest cart
      const guestEntries = loadGuestCart();
      const entry = guestEntries.find(e => e.id === itemId);
      if (entry) {
        entry.quantity = quantity;
        saveGuestCart(guestEntries);
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
      }
      return;
    }

    const previousItems = [...items];
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating quantity:', error);
      setItems(previousItems);
      toast({ title: "Ошибка", description: "Не удалось обновить количество", variant: "destructive" });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) {
      // Guest cart
      const guestEntries = loadGuestCart().filter(e => e.id !== itemId);
      saveGuestCart(guestEntries);
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({ title: "Товар удален", description: "Товар удален из корзины" });
      return;
    }

    const previousItems = [...items];
    setItems(prev => prev.filter(item => item.id !== itemId));

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Товар удален", description: "Товар удален из корзины" });
    } catch (error) {
      console.error('Error removing from cart:', error);
      setItems(previousItems);
      toast({ title: "Ошибка", description: "Не удалось удалить товар из корзины", variant: "destructive" });
    }
  };

  const clearCart = async () => {
    if (!user) {
      clearGuestCartStorage();
      setItems([]);
      toast({ title: "Корзина очищена", description: "Все товары удалены из корзины" });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setItems([]);
      toast({ title: "Корзина очищена", description: "Все товары удалены из корзины" });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({ title: "Ошибка", description: "Не удалось очистить корзину", variant: "destructive" });
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      let itemPrice = item.product.price;
      if (item.product.size_variants && item.selected_size) {
        const variant = item.product.size_variants.find(v => v.volume === item.selected_size);
        if (variant) itemPrice = variant.price;
      }
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = { items, loading, addToCart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
