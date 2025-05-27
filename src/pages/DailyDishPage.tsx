import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat, Star, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Dish, DailyDishOrder } from '../types';
import { formatDate, formatTime, calculateAverageRating } from '../utils/helpers';
import OrderDishModal from '../components/daily-dish/OrderDishModal';
import ShoppingListButton from '../components/shopping/ShoppingListButton';
import toast from 'react-hot-toast';

const DailyDishPage: React.FC = () => {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<DailyDishOrder[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyDishes();
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadDailyDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error('Error loading daily dishes:', error);
      toast.error('Failed to load daily dishes');
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async () => {
    if (!user) return;
    
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('daily_dish_orders')
        .select(`
          *,
          dish:dishes(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;
      setOrders(orderData || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const handleOrderComplete = () => {
    loadUserOrders();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading daily dishes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif mb-4">
          Daily Dishes
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our chef-selected dishes of the day, complete with cooking tips and seasonal ingredients.
          Each dish is carefully chosen to inspire your culinary journey.
        </p>
      </div>

      {/* User's Orders */}
      {user && orders.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Orders</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {order.dish && (
                  <>
                    <div className="relative h-48">
                      <img
                        src={order.dish.image_url}
                        alt={order.dish.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-medium">
                        {order.status}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2">{order.dish.title}</h3>
                      <div className="space-y-2 text-gray-600 mb-4">
                        <p>Quantity: {order.quantity}</p>
                        <p>Delivery: {formatDate(order.delivery_date)} at {order.delivery_time}</p>
                      </div>
                      <ShoppingListButton order={order} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Dishes */}
      <div className="space-y-16">
        {dishes.map((dish) => {
          const averageRating = calculateAverageRating(dish.rating ? [dish.rating] : []);
          
          return (
            <div key={dish.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 relative">
                  <img 
                    src={dish.image_url} 
                    alt={dish.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center shadow-md">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{averageRating}</span>
                  </div>
                </div>
                <div className="lg:w-1/2 p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif">{dish.title}</h2>
                  <p className="text-gray-600 mb-6">{dish.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">
                        {formatTime(30)} {/* Default time */}
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">
                        4 servings
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <ChefHat className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">
                        Medium
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">
                        ${dish.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <h3 className="font-medium text-gray-800">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {dish.tags?.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setSelectedDish(dish)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium inline-block text-center transition-colors flex-1"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDish && (
        <OrderDishModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </div>
  );
};

export default DailyDishPage;