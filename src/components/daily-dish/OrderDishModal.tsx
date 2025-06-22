import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Props {
  dish: any;
  onClose: () => void;
  onOrderComplete: () => void;
}

const OrderDishModal: React.FC<Props> = ({ dish, onClose, onOrderComplete }) => {
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [placing, setPlacing] = useState(false);

  // Geolocation function
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        toast.success('Location detected!');
      },
      () => toast.error('Could not get current location.')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);

    // Get current user ID
    const user = await supabase.auth.getUser();
    const user_id = user.data.user?.id;
    if (!user_id) {
      setPlacing(false);
      return toast.error('User not logged in');
    }

    // Check required fields
    if (!latitude || !longitude) {
      setPlacing(false);
      return toast.error('Please provide your location.');
    }

    const { error } = await supabase.from('daily_dish_orders').insert([{
      user_id,
      dish_id: dish.id,
      quantity: qty,
      delivery_date: date,
      delivery_time: time,
      address,
      latitude,
      longitude,
      status: 'pending'
    }]);

    setPlacing(false);
    if (error) return toast.error('Order failed: ' + error.message);
    toast.success('Order placed!');
    onOrderComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Order {dish.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Quantity</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(+e.target.value)}
              className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label>Delivery Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label>Delivery Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label>Delivery Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label>Latitude / Longitude</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                value={latitude ?? ''}
                onChange={e => setLatitude(Number(e.target.value))}
                className="w-1/2 border rounded px-3 py-2"
                placeholder="Latitude"
                step="any"
                required
              />
              <input
                type="number"
                value={longitude ?? ''}
                onChange={e => setLongitude(Number(e.target.value))}
                className="w-1/2 border rounded px-3 py-2"
                placeholder="Longitude"
                step="any"
                required
              />
            </div>
            <button
              type="button"
              className="mt-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded px-3 py-1"
              onClick={handleUseCurrentLocation}
            >
              Use Current Location
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={placing} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
              {placing ? 'Placing…' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderDishModal;
