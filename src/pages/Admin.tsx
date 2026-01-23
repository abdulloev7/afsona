import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductManagement } from '@/components/admin/ProductManagement';
import BrandManagement from '@/components/admin/BrandManagement';
import NewsManagement from '@/components/admin/NewsManagement';
import BannerManagement from '@/components/admin/BannerManagement';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, CheckCircle, XCircle, Bell, ArrowLeft } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  notes: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  order_items?: {
    product_id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Проверка прав доступа
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав администратора",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  // Загрузка заказов
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            price,
            product:products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);

      // Log admin viewing orders
      if (user) {
        await supabase
          .from('admin_audit_log')
          .insert({
            admin_user_id: user.id,
            action_type: 'VIEW_ORDERS',
            details: { orders_count: data?.length || 0 }
          });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  // Real-time подписка на новые заказы
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('New order received:', payload);
          
          // Воспроизведение звука
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error('Error playing sound:', e));
          }

          // Увеличение счетчика новых заказов
          setNewOrdersCount(prev => prev + 1);

          // Показ уведомления
          toast({
            title: "🎉 Новый заказ!",
            description: `Заказ от ${payload.new.customer_name}`,
          });

          // Обновление списка заказов
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, toast]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Log admin action
      if (user) {
        await supabase
          .from('admin_audit_log')
          .insert({
            admin_user_id: user.id,
            action_type: 'UPDATE_ORDER_STATUS',
            order_id: orderId,
            details: { new_status: newStatus }
          });
      }

      toast({
        title: "Статус обновлен",
        description: `Статус заказа изменен на "${getStatusLabel(newStatus)}"`,
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус заказа",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      processing: { variant: "default", icon: Package },
      completed: { variant: "secondary", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      processing: 'В обработке',
      completed: 'Завершен',
      cancelled: 'Отменен',
    };
    return labels[status] || status;
  };

  const clearNewOrdersCount = () => {
    setNewOrdersCount(0);
  };

  if (roleLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Скрытый аудио элемент для уведомлений */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTA0PU6vn77BfGAlAl93wxm0gBSuBzfLaizsIGGS57OihUhELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBSh+zPDajjkHF2K37OekUxELTKXh8bllHAU2jdXzzn0pBQ==" />

      <main className="flex-1 py-8 pt-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Админ-панель</h1>
                <p className="text-muted-foreground">Управление магазином</p>
              </div>
            </div>
            
            {newOrdersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearNewOrdersCount}
                className="relative"
              >
                <Bell className="h-4 w-4 mr-2" />
                Новых заказов: {newOrdersCount}
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white animate-pulse">
                  {newOrdersCount}
                </span>
              </Button>
            )}
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full max-w-5xl grid-cols-5 mb-8">
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="banners">Баннеры</TabsTrigger>
              <TabsTrigger value="brands">Бренды</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="news">Новости</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {loading ? (
                <div className="text-center py-8">Загрузка заказов...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h2 className="text-2xl font-bold mb-4">Заказов пока нет</h2>
                  <p className="text-muted-foreground">
                    Когда клиенты начнут делать заказы, они появятся здесь
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Заказ #{order.id.slice(0, 8)}
                              {getStatusBadge(order.status)}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(order.created_at).toLocaleString('ru-RU')}
                            </p>
                          </div>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Ожидает</SelectItem>
                              <SelectItem value="processing">В обработке</SelectItem>
                              <SelectItem value="completed">Завершен</SelectItem>
                              <SelectItem value="cancelled">Отменен</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Информация о клиенте */}
                          <div>
                            <h3 className="font-semibold mb-2">Информация о клиенте</h3>
                            <div className="space-y-1 text-sm">
                              <p><strong>Имя:</strong> {order.customer_name}</p>
                              <p><strong>Телефон:</strong> {order.customer_phone}</p>
                              {order.customer_email && (
                                <p><strong>Email:</strong> {order.customer_email}</p>
                              )}
                              <p><strong>Адрес:</strong> {order.delivery_address}</p>
                              {order.notes && (
                                <p><strong>Комментарий:</strong> {order.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Товары */}
                          <div>
                            <h3 className="font-semibold mb-2">Состав заказа</h3>
                            <div className="space-y-2">
                              {order.order_items?.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>
                                    {item.product.name} x {item.quantity}
                                  </span>
                                  <span className="font-medium">
                                    {(item.price * item.quantity).toLocaleString('ru-RU')} сом.
                                  </span>
                                </div>
                              ))}
                              <div className="border-t pt-2 flex justify-between font-bold">
                                <span>Итого:</span>
                                <span>{order.total_amount.toLocaleString('ru-RU')} сом.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="banners">
              <BannerManagement />
            </TabsContent>

            <TabsContent value="brands">
              <BrandManagement />
            </TabsContent>

            <TabsContent value="products">
              <ProductManagement />
            </TabsContent>

            <TabsContent value="news">
              <NewsManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
