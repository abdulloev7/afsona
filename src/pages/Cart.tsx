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
import { z } from 'zod';
import { GroupedCartItems } from '@/components/cart/GroupedCartItems';

const orderSchema = z.object({
  customerName: z.string().trim().min(1, { message: "Имя обязательно" }),
  customerPhone: z.string().trim().min(1, { message: "Телефон обязателен" }),
  customerEmail: z.string().trim().email({ message: "Некорректный email" }).optional(),
  deliveryAddress: z.string().trim().min(1, { message: "Адрес доставки обязателен" }),
  notes: z.string().optional(),
});

const Cart = () => {
  const [orderForm, setOrderForm] = useState({
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
    try {
      orderSchema.parse(orderForm);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Для оформления заказа войдите в систему или зарегистрируйтесь",
      });
      navigate('/auth');
      return;
    }

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
      const total = getSelectedTotal();
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          customer_name: orderForm.customerName,
          customer_phone: orderForm.customerPhone,
          customer_email: orderForm.customerEmail || null,
          delivery_address: orderForm.deliveryAddress,
          notes: orderForm.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items from selected items only
      const orderItems = selectedItemsList.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: getItemPrice(item),
        selected_size: item.selected_size || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send order notification email
      try {
        const orderItemsForEmail = selectedItemsList.map(item => ({
          product_name: item.product.name,
          quantity: item.quantity,
          price: getItemPrice(item),
          selected_size: item.selected_size || null,
        }));

        const { data: emailData, error: emailInvokeError } = await supabase.functions.invoke('send-order-notification', {
          body: {
            orderId: order.id,
            customerName: orderForm.customerName,
            customerPhone: orderForm.customerPhone,
            customerEmail: orderForm.customerEmail || undefined,
            deliveryAddress: orderForm.deliveryAddress,
            notes: orderForm.notes || undefined,
            totalAmount: total,
            items: orderItemsForEmail,
          },
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
        description: `Заказ #${order.id.slice(0, 8)} успешно создан. Мы свяжемся с вами в ближайшее время.`,
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ. Попробуйте еще раз.",
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
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к покупкам
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
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
                {/* Selection Header */}
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) {
                          const input = el.querySelector('button');
                          if (input) {
                            (input as any).indeterminate = isPartiallySelected;
                          }
                        }
                      }}
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
                    <CardTitle>Итого</CardTitle>
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
                    <CardTitle>Оформление заказа</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Имя *</Label>
                        <Input
                          id="customerName"
                          value={orderForm.customerName}
                          onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                          required
                        />
                        {errors.customerName && (
                          <p className="text-sm text-destructive">{errors.customerName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Телефон *</Label>
                        <Input
                          id="customerPhone"
                          value={orderForm.customerPhone}
                          onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                          placeholder="+992 90 123 45 67"
                          required
                        />
                        {errors.customerPhone && (
                          <p className="text-sm text-destructive">{errors.customerPhone}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={orderForm.customerEmail}
                          onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                          placeholder="example@mail.com"
                        />
                        {errors.customerEmail && (
                          <p className="text-sm text-destructive">{errors.customerEmail}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Адрес доставки *</Label>
                        <Textarea
                          id="deliveryAddress"
                          value={orderForm.deliveryAddress}
                          onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                          placeholder="г. Худжанд, ул. ..."
                          required
                        />
                        {errors.deliveryAddress && (
                          <p className="text-sm text-destructive">{errors.deliveryAddress}</p>
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
