import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dish } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OrderDishModalProps {
  dish: Dish;
  onClose: () => void;
  onOrderComplete: () => void;
}

const OrderDishModal: React.FC<OrderDishModalProps> = ({ dish, onClose, onOrderComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Use browser geolocation
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation not supported.');
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLatitude(lat);
        setLongitude(lng);
        setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      },
      () => toast.error('Unable to fetch location.')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to place an order');
      return navigate('/login');
    }
    if (!deliveryDate || !deliveryTime) {
      return toast.error('Please select delivery date and time');
    }
    if (!address) {
      return toast.error('Please enter or select a delivery address');
    }

    setLoading(true);
    try {
      // Insert all required fields (address, latitude, longitude)
      const { data: newOrder, error: orderError } = await supabase
        .from('daily_dish_orders')
        .insert([{  
          dish_id:       dish.id,
          user_id:       user.id,
          quantity,
          delivery_date: deliveryDate,
          delivery_time: deliveryTime,
          status:        'pending',
          created_at:    new Date().toISOString(),
          address,       // now included!
          latitude,      // now included!
          longitude,     // now included!
        }])
        .select()
        .single();

      if (orderError || !newOrder) {
        console.error('Order insert error:', orderError);
        throw orderError || new Error('Failed to create order');
      }

      // Notify chef
      const { data: dishData, error: dishError } = await supabase
        .from('dishes')
        .select('chef_id, name')
        .eq('id', dish.id)
        .single();

      if (!dishError && dishData) {
        await supabase.from('notifications').insert([{  
          seller_id:  dishData.chef_id,
          order_id:   newOrder.id,
          product_id: dish.id,
          qty:        quantity,
          type:       'daily_dish',
          message:    `New order: ${quantity}× ${dishData.name}`,
        }]);
      }

      toast.success('Order placed successfully!');
      onOrderComplete();
      onClose();
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order {dish.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Delivery Date</label>
            <input
              type="date"
              min={minDate}
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Delivery Time</label>
            <input
              type="time"
              value={deliveryTime}
              onChange={e => setDeliveryTime(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* LOCATION INPUT */}
          <div>
            <label className="block text-sm font-medium">Delivery Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Street, City, etc."
              className="w-full px-3 py-2 border rounded mb-2"
              required
            />
            <button
              type="button"
              onClick={useMyLocation}
              className="text-sm text-blue-600 hover:underline"
            >
              Use my current location
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderDishModal;
