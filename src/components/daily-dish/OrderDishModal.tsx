// import React, { useState } from 'react';
// import { X } from 'lucide-react';
// import { Dish } from '../../types';
// import { supabase } from '../../lib/supabase';
// import toast from 'react-hot-toast';
// import { useAuth } from '../../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';

// interface OrderDishModalProps {
//   dish: Dish;
//   onClose: () => void;
//   onOrderComplete: () => void;
// }

// const OrderDishModal: React.FC<OrderDishModalProps> = ({ dish, onClose, onOrderComplete }) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [quantity, setQuantity] = useState(1);
//   const [deliveryDate, setDeliveryDate] = useState('');
//   const [deliveryTime, setDeliveryTime] = useState('');
//   const [address, setAddress] = useState('');
//   const [latitude, setLatitude] = useState<number | null>(null);
//   const [longitude, setLongitude] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Use browser geolocation
//   const useMyLocation = () => {
//     if (!navigator.geolocation) {
//       return toast.error('Geolocation not supported.');
//     }
//     navigator.geolocation.getCurrentPosition(
//       pos => {
//         const { latitude: lat, longitude: lng } = pos.coords;
//         setLatitude(lat);
//         setLongitude(lng);
//         setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
//       },
//       () => toast.error('Unable to fetch location.')
//     );
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) {
//       toast.error('Please log in to place an order');
//       return navigate('/login');
//     }
//     if (!deliveryDate || !deliveryTime) {
//       return toast.error('Please select delivery date and time');
//     }
//     if (!address) {
//       return toast.error('Please enter or select a delivery address');
//     }

//     setLoading(true);
//     try {
//       // Insert all required fields (address, latitude, longitude)
//       const { data: newOrder, error: orderError } = await supabase
//         .from('daily_dish_orders')
//         .insert([{  
//           dish_id:       dish.id,
//           user_id:       user.id,
//           quantity,
//           delivery_date: deliveryDate,
//           delivery_time: deliveryTime,
//           status:        'pending',
//           created_at:    new Date().toISOString(),
//           address,       // now included!
//           latitude,      // now included!
//           longitude,     // now included!
//         }])
//         .select()
//         .single();

//       if (orderError || !newOrder) {
//         console.error('Order insert error:', orderError);
//         throw orderError || new Error('Failed to create order');
//       }

//       // Notify chef
//       const { data: dishData, error: dishError } = await supabase
//         .from('dishes')
//         .select('chef_id, name')
//         .eq('id', dish.id)
//         .single();

//       if (!dishError && dishData) {
//         await supabase.from('notifications').insert([{  
//           seller_id:  dishData.chef_id,
//           order_id:   newOrder.id,
//           product_id: dish.id,
//           qty:        quantity,
//           type:       'daily_dish',
//           message:    `New order: ${quantity}× ${dishData.name}`,
//         }]);
//       }

//       toast.success('Order placed successfully!');
//       onOrderComplete();
//       onClose();
//     } catch (err) {
//       console.error('Error placing order:', err);
//       toast.error('Failed to place order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Min date = tomorrow
//   const tomorrow = new Date();
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   const minDate = tomorrow.toISOString().split('T')[0];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Order {dish.name}</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X size={24} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Quantity</label>
//             <input
//               type="number"
//               min="1"
//               value={quantity}
//               onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//               className="w-full px-3 py-2 border rounded"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Delivery Date</label>
//             <input
//               type="date"
//               min={minDate}
//               value={deliveryDate}
//               onChange={e => setDeliveryDate(e.target.value)}
//               className="w-full px-3 py-2 border rounded"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Delivery Time</label>
//             <input
//               type="time"
//               value={deliveryTime}
//               onChange={e => setDeliveryTime(e.target.value)}
//               className="w-full px-3 py-2 border rounded"
//               required
//             />
//           </div>

//           {/* LOCATION INPUT */}
//           <div>
//             <label className="block text-sm font-medium">Delivery Address</label>
//             <input
//               type="text"
//               value={address}
//               onChange={e => setAddress(e.target.value)}
//               placeholder="Street, City, etc."
//               className="w-full px-3 py-2 border rounded mb-2"
//               required
//             />
//             <button
//               type="button"
//               onClick={useMyLocation}
//               className="text-sm text-blue-600 hover:underline"
//             >
//               Use my current location
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
//           >
//             {loading ? 'Placing Order...' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OrderDishModal;
import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface ProductOrder {
  id: string;
  quantity: number;
  status: string;
  created_at: string;
  product: {
    name: string;
    image_url: string | null;
    price: number;
  };
  seller: {
    username: string;
  };
}

interface DishOrder {
  id: string;
  quantity: number;
  status: string;
  created_at: string;
  delivery_date: string;
  delivery_time: string;
  address: string;
  latitude: number;
  longitude: number;
  location: string;
  dish: {
    name: string;
    image_url: string | null;
  };
}

const OrdersSection: React.FC = () => {
  const { user } = useAuth();
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [dishOrders, setDishOrders] = useState<DishOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadAllOrders();
  }, [user]);

  const loadAllOrders = async () => {
    setLoading(true);

    // --- 1) fetch product orders (won't block dish orders if it fails) ---
    try {
      const { data: pData, error: pError } = await supabase
        .from('orders')
        .select(`
          *,
          product:seller_products!orders_product_id_fkey (
            name,
            image_url,
            price
          ),
          seller:profiles!orders_seller_id_fkey (
            username
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (pError) {
        // supabase will print the exact error (including available FK names)
        console.error('Product-orders join failed:', pError);
        setProductOrders([]);
      } else {
        setProductOrders(pData || []);
      }
    } catch (err) {
      console.error('Unexpected error loading product orders:', err);
      setProductOrders([]);
    }

    // --- 2) fetch daily-dish orders ---
    try {
      const { data: dData, error: dError } = await supabase
        .from('daily_dish_orders')
        .select(`
          id,
          quantity,
          status,
          created_at,
          delivery_date,
          delivery_time,
          address,
          latitude,
          longitude,
          location,
          dish:dishes (
            name,
            image_url
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (dError) throw dError;
      setDishOrders(dData || []);
    } catch (err: any) {
      console.error('Error loading dish orders:', err.message);
      toast.error('Failed to load dish orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading orders…</div>;
  }

  if (productOrders.length === 0 && dishOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">You haven’t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Orders */}
      {productOrders.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Product Orders</h2>
          <div className="space-y-6">
            {productOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                        <p className="text-xs text-gray-500">
                          Ordered on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Quantity: {order.quantity}</span>
                      </div>
                      <div>
                        <span className="font-medium">Total:</span>{' '}
                        ${(order.product.price * order.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Dish Orders */}
      {dishOrders.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Daily Dish Orders</h2>
          <div className="space-y-6">
            {dishOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    {order.dish.image_url && (
                      <img
                        src={order.dish.image_url}
                        alt={order.dish.name}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-6 md:w-2/3 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {order.dish.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Ordered on {formatDate(order.created_at)}
                        </p>
                        <p className="text-sm">Quantity: {order.quantity}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        Delivery: {formatDate(order.delivery_date)} at {order.delivery_time}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{order.address}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Lat: {order.latitude.toFixed(4)}, Lng: {order.longitude.toFixed(4)}{' '}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View on Map
                      </a>
                    </div>
                    {order.location && (
                      <div className="italic text-gray-500">Note: {order.location}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OrdersSection;
