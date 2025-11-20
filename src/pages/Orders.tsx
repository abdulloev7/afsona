import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

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
    selected_size?: string | null;
    product: {
      name: string;
    };
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const goToCatalog = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('afsona-scroll-target', 'products');
    }
    navigate(`/#products`);
  };

  useEffect(() => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите, чтобы увидеть свои заказы",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    fetchOrders();
  }, [user, navigate, toast]);

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
            selected_size,
            product:products (
              name
            )
          )
        `)
        .eq('user_id', user?.id)
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
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; label: string }> = {
      pending: { variant: "outline", icon: Clock, label: "Ожидает" },
      processing: { variant: "default", icon: Package, label: "В обработке" },
      completed: { variant: "secondary", icon: CheckCircle, label: "Завершен" },
      cancelled: { variant: "destructive", icon: XCircle, label: "Отменен" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 py-8 mt-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Мои заказы</h1>
              <p className="text-muted-foreground">История ваших заказов</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Загрузка заказов...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-4">Заказов пока нет</h2>
              <p className="text-muted-foreground mb-6">
                Вы еще не сделали ни одного заказа
              </p>
              <Button onClick={goToCatalog}>
                Перейти к каталогу
              </Button>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Информация о доставке */}
                      <div>
                        <h3 className="font-semibold mb-2">Информация о доставке</h3>
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
                                {item.selected_size && (
                                  <span className="text-muted-foreground ml-1">
                                    ({item.selected_size})
                                  </span>
                                )}
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
