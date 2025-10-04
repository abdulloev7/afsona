import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Package, User, ShoppingBag } from 'lucide-react';

interface Profile {
  display_name?: string;
  phone?: string;
  address?: string;
  city?: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name: string;
  delivery_address: string;
  order_items: {
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [tab, setTab] = useState<'profile' | 'orders'>('profile');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t === 'orders') setTab('orders');
  }, [location.search]);

  // Сохраняем время просмотра заказов
  useEffect(() => {
    if (tab === 'orders') {
      localStorage.setItem('lastOrdersView', new Date().toISOString());
    }
  }, [tab]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          customer_name,
          delivery_address,
          order_items(
            quantity,
            price,
            product:products(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profile,
        });

      if (error) throw error;

      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'В обработке',
      processing: 'Обрабатывается',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              Личный кабинет
            </h1>
            <Button variant="outline" onClick={signOut}>
              Выйти
            </Button>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'profile' | 'orders')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="orders">Мои заказы</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Личная информация</CardTitle>
                  <CardDescription>
                    Обновите свои личные данные и контактную информацию
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Имя</Label>
                        <Input
                          id="display_name"
                          value={profile.display_name || ''}
                          onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          id="phone"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Адрес</Label>
                      <Input
                        id="address"
                        value={profile.address || ''}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Город</Label>
                      <Input
                        id="city"
                        value={profile.city || 'Худжанд'}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Сохраняем...' : 'Сохранить изменения'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    История заказов
                  </CardTitle>
                  <CardDescription>
                    Просмотрите свои заказы и отслеживайте их статус
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="text-center py-8">Загружаем заказы...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">У вас пока нет заказов</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/')}
                      >
                        Перейти к покупкам
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold">Заказ #{order.id.slice(0, 8)}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {order.total_amount.toLocaleString('ru-RU')} сом.
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {getStatusLabel(order.status)}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {order.order_items.map((item, index) => (
                                <div key={index} className="text-sm flex justify-between">
                                  <span>{item.product.name}</span>
                                  <span>{item.quantity} шт. × {item.price} сом.</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm">
                                <strong>Доставка:</strong> {order.delivery_address}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;