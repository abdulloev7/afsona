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
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/locales/translations';

// Schema will be created dynamically in component

const Cart = () => {
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);
  
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
      const orderSchema = z.object({
        customerName: z.string().trim().min(1, { message: t('nameRequired') }),
        customerPhone: z.string().trim().min(1, { message: t('phoneRequired') }),
        customerEmail: z.string().trim().email({ message: t('invalidEmail') }).optional(),
        deliveryAddress: z.string().trim().min(1, { message: t('addressRequired') }),
        notes: z.string().optional(),
      });
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
        title: t('cartEmpty'),
        description: t('addProductsToOrder'),
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

      // Clear cart
      await clearCart();

      toast({
        title: t('orderPlaced'),
        description: `${t('order')} #${order.id.slice(0, 8)} ${t('orderCreated')}`,
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: t('error'),
        description: t('orderError'),
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
            <h1 className="text-2xl font-bold mb-4">{t('loginToViewCart')}</h1>
            <p className="text-muted-foreground mb-8">
              {t('loginRequired')}
            </p>
            <Button onClick={() => navigate('/auth')}>
              {t('loginButton')}
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
              {t('backToShopping')}
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              {t('cartTitle')} ({items.length})
            </h1>
          </div>

          {cartLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-4">{t('emptyCart')}</h2>
              <p className="text-muted-foreground mb-8">
                {t('emptyCartText')}
              </p>
              <Button onClick={() => navigate('/')}>
                {t('goToProducts')}
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
                    <CardTitle>{t('total')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getCartTotal().toLocaleString('ru-RU')} сом.
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('orderForm')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">{t('customerName')} {t('requiredField')}</Label>
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
                        <Label htmlFor="customerPhone">{t('customerPhone')} {t('requiredField')}</Label>
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
                        <Label htmlFor="customerEmail">{t('customerEmail')}</Label>
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
                        <Label htmlFor="deliveryAddress">{t('deliveryAddress')} {t('requiredField')}</Label>
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
                        <Label htmlFor="notes">{t('orderNotes')}</Label>
                        <Textarea
                          id="notes"
                          value={orderForm.notes}
                          onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                          placeholder={t('additionalWishes')}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? t('placingOrder') : t('placeOrder')}
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