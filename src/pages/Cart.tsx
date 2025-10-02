import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

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
  
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Добавьте товары в корзину для оформления заказа",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const total = getCartTotal();
      
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

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send order notification email
      try {
        const orderItemsForEmail = items.map(item => ({
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        }));

        await supabase.functions.invoke('send-order-notification', {
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
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the order if email fails
      }

      // Clear cart
      await clearCart();

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold mb-4">Войдите для просмотра корзины</h1>
            <p className="text-muted-foreground mb-8">
              Для добавления товаров в корзину и оформления заказов необходимо войти в систему
            </p>
            <Button onClick={() => navigate('/auth')}>
              Войти в систему
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {item.product.image && (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-lg font-bold">
                            {item.product.price.toLocaleString('ru-RU')} сом.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Итого</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getCartTotal().toLocaleString('ru-RU')} сом.
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

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Оформляем заказ...' : 'Оформить заказ'}
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