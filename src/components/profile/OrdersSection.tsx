
// import React, { useState, useEffect } from 'react';
// import { Package, Clock, MapPin } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../contexts/AuthContext';
// import { formatDate } from '../../utils/helpers';
// import toast from 'react-hot-toast';

// interface ProductOrder {
//   id: string;
//   quantity: number;
//   status: string;
//   created_at: string;
//   product: {
//     name: string;
//     image_url: string | null;
//     price: number;
//   };
//   seller: {
//     username: string;
//   };
// }

// interface DishOrder {
//   id: string;
//   quantity: number;
//   status: string;
//   delivery_date: string;
//   delivery_time: string;
//   address: string;
//   created_at: string;
  
//   dish: {
//     name: string;
//     image_url: string | null;
//   };
// }

// const OrdersSection: React.FC = () => {
//   const { user } = useAuth();
//   const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
//   const [dishOrders, setDishOrders] = useState<DishOrder[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user) loadAllOrders();
//   }, [user]);

//   const loadAllOrders = async () => {
//     setLoading(true);
//     try {
//       // 1) Fetch product orders, joining on seller_products.price and seller profile
//       const { data: pData, error: pError } = await supabase
//         .from('orders')
//         .select(`
//           *,
//           product:seller_products (
//             name,
//             image_url,
//             price
//           ),
//           seller:profiles!orders_seller_id_fkey (
//             username
//           )
//         `)
//         .eq('user_id', user!.id)
//         .order('created_at', { ascending: false });

//       if (pError) throw pError;
//       setProductOrders(pData || []);

//       // 2) Fetch daily‐dish orders, joining on dishes
//       const { data: dData, error: dError } = await supabase
//         .from('daily_dish_orders')
//         .select(`
//           id,
//           quantity,
//           status,
//           created_at,
//           delivery_date,
//           delivery_time,
//           address,
//           latitude,
//           longitude,
//           location,
//           dish:dishes (
//               name,
//               image_url
//         )
//         `)
//         .eq('user_id', user!.id)
//         .order('created_at', { ascending: false });

//       if (dError) throw dError;
//       setDishOrders(dData || []);
//     } catch (err: any) {
//       console.error('Error loading orders:', err.message);
//       toast.error('Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <div>Loading orders…</div>;
//   }

//   if (productOrders.length === 0 && dishOrders.length === 0) {
//     return (
//       <div className="text-center py-12 bg-white rounded-xl shadow-md">
//         <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//         <p className="text-gray-600 mb-4">You haven’t placed any orders yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Product Orders */}
//       {productOrders.length > 0 && (
//         <section>
//           <h2 className="text-xl font-bold mb-4">Product Orders</h2>
//           <div className="space-y-6">
//             {productOrders.map((order) => (
//               <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <div className="flex flex-col md:flex-row">
//                   <div className="md:w-1/3">
//                     {order.product.image_url && (
//                       <img
//                         src={order.product.image_url}
//                         alt={order.product.name}
//                         className="w-full h-48 md:h-full object-cover"
//                       />
//                     )}
//                   </div>
//                   <div className="p-6 md:w-2/3">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-800">{order.product.name}</h3>
//                         <p className="text-sm text-gray-600">Sold by: {order.seller.username}</p>
//                       </div>
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${
//                           order.status === 'completed'
//                             ? 'bg-green-100 text-green-800'
//                             : order.status === 'cancelled'
//                             ? 'bg-red-100 text-red-800'
//                             : order.status === 'confirmed'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                       </span>
//                     </div>
//                     <div className="space-y-2 text-sm text-gray-600">
//                       <div className="flex items-center">
//                         <Clock className="w-4 h-4 mr-2" />
//                         <span>Ordered on {formatDate(order.created_at)}</span>
//                       </div>
//                       <div>
//                         <span className="font-medium">Quantity:</span> {order.quantity}
//                       </div>
//                       <div>
//                         <span className="font-medium">Total:</span>{' '}
//                         ${(order.product.price * order.quantity).toFixed(2)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* Daily Dish Orders */}
//       {dishOrders.length > 0 && (
//         <section>
//           <h2 className="text-xl font-bold mb-4">Daily Dish Orders</h2>
//           <div className="space-y-6">
//             {dishOrders.map((order) => (
//               <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <div className="flex flex-col md:flex-row">
//                   <div className="md:w-1/3">
//                     {order.dish.image_url && (
//                       <img
//                         src={order.dish.image_url}
//                         alt={order.dish.name}
//                         className="w-full h-48 md:h-full object-cover"
//                       />
//                     )}
//                   </div>
//                   <div className="p-6 md:w-2/3">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-800">{order.dish.name}</h3>
//                         <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
//                       </div>
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${
//                           order.status === 'completed'
//                             ? 'bg-green-100 text-green-800'
//                             : order.status === 'cancelled'
//                             ? 'bg-red-100 text-red-800'
//                             : order.status === 'confirmed'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                       </span>
//                     </div>
//                     <div className="space-y-2 text-sm text-gray-600">
//                       <div className="flex items-center">
//                         <Clock className="w-4 h-4 mr-2" />
//                         <span>
//                           Delivery: {formatDate(order.delivery_date)} at {order.delivery_time}
//                         </span>
//                       </div>
//                       <div className="flex items-center">
//                         <MapPin className="w-4 h-4 mr-2" />
//                         <span>{order.address}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// };

// export default OrdersSection;
import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

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
  const [dishOrders, setDishOrders] = useState<DishOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadDishOrders();
  }, [user]);

  const loadDishOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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

      if (error) throw error;
      setDishOrders(data || []);
    } catch (err: any) {
      console.error('Error loading orders:', err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading orders…</div>;
  }

  if (dishOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">You haven’t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Dish Orders</h2>
      {dishOrders.map((order) => (
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
            <div className="p-6 md:w-2/3 space-y-2 text-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{order.dish.name}</h3>
                  <p className="text-sm text-gray-500">
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

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  Delivery: {formatDate(order.delivery_date)} at {order.delivery_time}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
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
                <p className="italic text-gray-500">Note: {order.location}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersSection;
