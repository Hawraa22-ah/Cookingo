import React, { useState, useEffect } from 'react';
import { Package, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DailyDishOrder } from '../../types';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OrdersSection: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DailyDishOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_dish_orders')
        .select(`
          *,
          dish:dishes(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
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
        <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
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
              {order.dish?.image_url && (
                <img
                  src={order.dish.image_url}
                  alt={order.dish?.title}
                  className="w-full h-48 md:h-full object-cover"
                />
              )}
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {order.dish?.title}
                  </h3>
                  <p className="text-gray-600">{order.dish?.description}</p>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'}
                `}>
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
                  <span className="font-medium">Delivery:</span>{' '}
                  {formatDate(order.delivery_date)} at {order.delivery_time}
                </div>
                {order.dish?.price && (
                  <div>
                    <span className="font-medium">Total:</span>{' '}
                    ${(order.dish.price * order.quantity).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersSection;