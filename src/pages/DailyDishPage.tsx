import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Star, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Dish, DailyDishOrder } from '../types';
import { formatTime, calculateAverageRating } from '../utils/helpers';
import OrderDishModal from '../components/daily-dish/OrderDishModal';
import toast from 'react-hot-toast';

const DailyDishPage: React.FC = () => {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<DailyDishOrder[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyDishes();
    if (user) loadUserOrders();
  }, [user]);

  const getPublicImageUrl = (path: string): string => {
    const { data } = supabase.storage.from('dish-images').getPublicUrl(path);
    return data?.publicUrl || '';
  };

  const loadDailyDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const dishesWithUrls = (data || []).map(dish => ({
        ...dish,
        image_url: dish.image_url || (dish.image_path ? getPublicImageUrl(dish.image_path) : '')
      }));

      setDishes(dishesWithUrls);
    } catch (error) {
      console.error('Error loading daily dishes:', error);
      toast.error('Failed to load daily dishes');
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_dish_orders')
        .select(`*, dish:dishes(*)`)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithUrls = (data || []).map(order => ({
        ...order,
        dish: order.dish
          ? {
              ...order.dish,
              image_url: order.dish.image_url || (order.dish.image_path ? getPublicImageUrl(order.dish.image_path) : '')
            }
          : null
      }));

      setOrders(ordersWithUrls);
    } catch (error) {
      console.error('Error loading user orders:', error);
      toast.error('Failed to load your orders');
    }
  };

  const handleOrderComplete = () => {
    loadUserOrders();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading daily dishes...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 font-serif">
        Daily Dishes
      </h1>

      <div className="space-y-16">
        {dishes.map((dish) => {
          const averageRating = calculateAverageRating(dish.rating ? [dish.rating] : []);

          return (
            <div key={dish.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 relative">
                  <img
                    src={dish.image_url}
                    alt={dish.title}
                    className="w-full h-full object-cover"
                  />
                  
                </div>

                <div className="lg:w-1/2 p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1 font-serif">{dish.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">By: {dish.chef_name || 'Unknown Chef'}</p>
                  <p className="text-gray-600 mb-6">{dish.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">
                        {dish.time ? formatTime(dish.time) : 'N/A'}
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">
                        {dish.servings ? `${dish.servings} servings` : 'N/A'}
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <ChefHat className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">
                        {dish.difficulty || 'N/A'}
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <span className="text-sm text-gray-600">${dish.price}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {dish.tags?.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDish(dish)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
                  >
                    Order Now
                  </button>
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

