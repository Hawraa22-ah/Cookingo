
import React, { useState, useEffect } from 'react';
import { Package, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  quantity: number;
  unit_price: number;
  status: string;
  created_at: string;
  seller: { username: string };
  product: { name: string; image_url: string | null };
}

const OrdersSection: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:seller_products (
            name,
            image_url
          ),
          seller:profiles!orders_seller_id_fkey (
            username
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error loading orders:', err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">You haven’t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
              {order.product.image_url && (
                <img
                  src={order.product.image_url}
                  alt={order.product.name}
                  className="w-full h-48 md:h-full object-cover"
                />
              )}
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {order.product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sold by: {order.seller.username}
                  </p>
                </div>
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : order.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  `}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Ordered on {formatDate(order.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">Quantity:</span> {order.quantity}
                </div>
                <div>
                  <span className="font-medium">Total:</span>{' '}
                  ${(order.unit_price * order.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersSection;
