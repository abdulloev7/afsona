import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useCart, type CartItem } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { GroupedCartItems } from '@/components/cart/GroupedCartItems';
import { DELIVERY_TEXT } from "@/lib/facts";
import { useSeo } from "@/hooks/useSeo";

type OrderForm = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  notes: string;
};

// Plain checks keep a form library out of the shop bundle.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateOrder = (form: OrderForm) => {
  const errors: { [key: string]: string } = {};
  if (!form.customerName.trim()) errors.customerName = "Имя обязательно";
  if (!form.customerPhone.trim()) errors.customerPhone = "Телефон обязателен";
  const email = form.customerEmail.trim();
  if (email && !EMAIL_RE.test(email)) errors.customerEmail = "Некорректный email";
  if (!form.deliveryAddress.trim()) errors.deliveryAddress = "Адрес доставки обязателен";
  return errors;
};

const Cart = () => {
  useSeo({ title: 'Корзина', noindex: true });
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { items, updateQuantity, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Select all items on initial load
  useEffect(() => {
    if (items.length > 0 && !isInitialized) {
      setSelectedItems(new Set(items.map(item => item.id)));
      setIsInitialized(true);
    }
  }, [items, isInitialized]);

  // Sync selection when items change (e.g., item removed)
  useEffect(() => {
    setSelectedItems(prev => {
      const itemIds = new Set(items.map(item => item.id));
      const next = new Set<string>();
      prev.forEach(id => {
        if (itemIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [items]);

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const removeSelected = async () => {
    const itemsToRemove = Array.from(selectedItems);
    for (const itemId of itemsToRemove) {
      await removeFromCart(itemId);
    }
    setSelectedItems(new Set());
  };

  const getItemPrice = (item: CartItem) => {
    let itemPrice = item.product.price;
    if (item.product.size_variants && item.selected_size) {
      const variant = item.product.size_variants.find(v => v.volume === item.selected_size);
      if (variant) itemPrice = variant.price;
    }
    return itemPrice;
  };

  const getSelectedTotal = () => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + (getItemPrice(item) * item.quantity), 0);
  };

  const validateForm = () => {
    const newErrors = validateOrder(orderForm);
    setErrors(newErrors);
    const firstInvalid = Object.keys(newErrors)[0];
    if (firstInvalid) document.getElementById(firstInvalid)?.focus();
    return !firstInvalid;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedItemsList = items.filter(item => selectedItems.has(item.id));

    if (selectedItemsList.length === 0) {
      toast({
        title: "Ничего не выбрано",
        description: "Выберите хотя бы один товар для оформления заказа",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Works for guests and signed-in users; prices and the total are computed in the database
      const { data, error: orderError } = await supabase.rpc('create_order', {
        p_customer_name: orderForm.customerName,
        p_customer_phone: orderForm.customerPhone,
        p_customer_email: orderForm.customerEmail || null,
        p_delivery_address: orderForm.deliveryAddress,
        p_notes: orderForm.notes || null,
        p_items: selectedItemsList.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          selected_size: item.selected_size || null,
        })),
      });

      if (orderError) throw orderError;
      const order = data?.[0];
      if (!order) throw new Error('create_order returned no order');

      // Copy of the order to the shop's Telegram chat (api/site-order.js); never blocks the order
      fetch('/api/site-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.order_id }),
        keepalive: true,
      }).catch((tgError) => console.error('Error sending Telegram notification:', tgError));

      // Send order notification email
      try {
        const { data: emailData, error: emailInvokeError } = await supabase.functions.invoke('send-order-notification', {
          body: { orderId: order.order_id },
        });

        if (emailInvokeError) {
          throw emailInvokeError;
        }

        console.log('Order notification sent:', emailData);
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the order if email fails
      }

      // Remove only ordered items from cart
      for (const item of selectedItemsList) {
        await removeFromCart(item.id);
      }
      setSelectedItems(new Set());

      toast({
        title: "Заказ оформлен!",
        description: `Заказ #${order.order_id.slice(0, 8)} успешно создан. Мы свяжемся с вами в ближайшее время.`,
      });

      navigate(user ? '/profile' : '/');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ. Попробуйте еще раз или позвоните: +992 927 55 79 19",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < items.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
            <Button variant="ghost" className="-ml-4" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к покупкам
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
              Корзина ({items.length})
            </h1>
          </div>

          {cartLoading ? (
            <div className="text-center py-8">Загружаем корзину...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-4">Корзина пуста</h2>
              <p className="text-muted-foreground mb-8">
                Добавьте товары в корзину, чтобы продолжить покупки
              </p>
              <Button onClick={() => navigate('/')}>
                Перейти к покупкам
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="sr-only">Товары в корзине</h2>
                {/* Selection Header */}
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isPartiallySelected ? "indeterminate" : isAllSelected}
                      onCheckedChange={toggleAll}
                      id="select-all"
                    />
                    <Label htmlFor="select-all" className="cursor-pointer text-sm font-medium">
                      Выбрать все ({selectedItems.size} из {items.length})
                    </Label>
                  </div>
                  
                  {selectedItems.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeSelected}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить ({selectedItems.size})
                    </Button>
                  )}
                </div>

                {/* Cart Items - Grouped when > 5 items */}
                <GroupedCartItems
                  items={items}
                  selectedItems={selectedItems}
                  onToggleItem={toggleItem}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  getItemPrice={getItemPrice}
                />
              </div>

              {/* Order Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle as="h2">Итого</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Товаров в корзине:</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Выбрано для заказа:</span>
                      <span>{selectedItems.size}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Сумма:</span>
                      <span>{getSelectedTotal().toLocaleString('ru-RU')} сом.</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle as="h2">Оформление заказа</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Имя *</Label>
                        <Input
                          id="customerName"
                          autoComplete="name"
                          aria-invalid={!!errors.customerName}
                          aria-describedby={errors.customerName ? "customerName-error" : undefined}
                          value={orderForm.customerName}
                          onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                          required
                        />
                        {errors.customerName && (
                          <p id="customerName-error" className="text-sm text-destructive">{errors.customerName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Телефон *</Label>
                        <Input
                          id="customerPhone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          aria-invalid={!!errors.customerPhone}
                          aria-describedby={errors.customerPhone ? "customerPhone-error" : undefined}
                          value={orderForm.customerPhone}
                          onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                          placeholder="+992 90 123 45 67"
                          required
                        />
                        {errors.customerPhone && (
                          <p id="customerPhone-error" className="text-sm text-destructive">{errors.customerPhone}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Эл. почта</Label>
                        <Input
                          id="customerEmail"
                          autoComplete="email"
                          aria-invalid={!!errors.customerEmail}
                          aria-describedby={errors.customerEmail ? "customerEmail-error" : undefined}
                          type="email"
                          value={orderForm.customerEmail}
                          onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                          placeholder="example@mail.com"
                        />
                        {errors.customerEmail && (
                          <p id="customerEmail-error" className="text-sm text-destructive">{errors.customerEmail}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Адрес доставки *</Label>
                        <Textarea
                          id="deliveryAddress"
                          autoComplete="street-address"
                          aria-invalid={!!errors.deliveryAddress}
                          aria-describedby={errors.deliveryAddress ? "deliveryAddress-error" : undefined}
                          value={orderForm.deliveryAddress}
                          onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                          placeholder="г. Худжанд, ул. ..."
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          {DELIVERY_TEXT}. Заказ на меньшую сумму можно забрать в магазине.
                        </p>
                        {errors.deliveryAddress && (
                          <p id="deliveryAddress-error" className="text-sm text-destructive">{errors.deliveryAddress}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Комментарий к заказу</Label>
                        <Textarea
                          id="notes"
                          value={orderForm.notes}
                          onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                          placeholder="Дополнительные пожелания..."
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading || selectedItems.size === 0}
                      >
                        {loading 
                          ? 'Оформляем заказ...' 
                          : selectedItems.size === 0 
                            ? 'Выберите товары' 
                            : `Оформить заказ (${selectedItems.size})`
                        }
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
