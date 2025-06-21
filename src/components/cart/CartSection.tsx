
// import React, { useState, useEffect, useCallback } from 'react';
// import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../contexts/AuthContext';
// import toast from 'react-hot-toast';
// import type { RealtimeChannel } from '@supabase/supabase-js';

// interface CartRow {
//   id: string;
//   quantity: number;
//   seller_products: {
//     id: string;
//     name: string;
//     image_url: string | null;
//     price: number;
//     seller_id: string;
//   };
// }

// const CartSection: React.FC = () => {
//   const { user } = useAuth();
//   const [items, setItems] = useState<CartRow[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);

//   const loadCart = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('shopping_cart')
//         .select(`
//           *,
//           seller_products :product_id(
//             id,
//             name,
//             image_url,
//             price,
//             seller_id
//           )
//         `)
//         .eq('user_id', user!.id);

//       if (error) throw error;
//       setItems(data || []);
//     } catch (err) {
//       console.error('Error loading cart:', err);
//       toast.error('Failed to load cart');
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (!user) return;
//     loadCart();

//     const channel: RealtimeChannel = supabase
//       .channel('cart_updates')
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'shopping_cart',
//           filter: `user_id=eq.${user.id}`,
//         },
//         loadCart
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [user, loadCart]);

//   const updateQuantity = async (cartId: string, newQty: number) => {
//     if (newQty < 1) return;
//     try {
//       const { error } = await supabase
//         .from('shopping_cart')
//         .update({ quantity: newQty })
//         .eq('id', cartId);
//       if (error) throw error;
//       setItems(prev =>
//         prev.map(item =>
//           item.id === cartId ? { ...item, quantity: newQty } : item
//         )
//       );
//     } catch {
//       toast.error('Couldn’t update quantity');
//     }
//   };

//   const removeItem = async (cartId: string) => {
//     try {
//       const { error } = await supabase
//         .from('shopping_cart')
//         .delete()
//         .eq('id', cartId);
//       if (error) throw error;
//       setItems(prev => prev.filter(i => i.id !== cartId));
//       toast.success('Removed from cart');
//     } catch {
//       toast.error('Couldn’t remove item');
//     }
//   };

//   const getTotal = () =>
//     items.reduce((sum, i) => sum + i.seller_products.price * i.quantity, 0);

//   const handleCheckout = async () => {
//   if (!items.length) return;

//   setProcessing(true);
//   try {
//     for (const i of items) {
//       // 1) orders
//       const { data: orderData, error: orderErr } = await supabase
//         .from('orders')
//         .insert([{
//           user_id: user!.id,
//           seller_id: i.seller_products.seller_id,
//           product_id: i.seller_products.id,
//           quantity: i.quantity,
//           status: 'pending',
//         }])
//         .select()
//         .single();

//       if (orderErr) {
//         console.error('❌ orders.insert error:', orderErr);
//         throw orderErr;
//       }
//       console.log('✅ orders.insert →', orderData);

//       // 2) seller_notifications
//       const { data: snData, error: snErr } = await supabase
//         .from('seller_notifications')
//         .insert([{
//           seller_id:  i.seller_products.seller_id,
//           product_id: i.seller_products.id,
//           qty:         i.quantity,
//           message:     `New order: ${i.quantity}× ${i.seller_products.name}`,
//           is_read:     false,
//         }])
//         .select();

//       if (snErr) {
//         console.error('❌ seller_notifications.insert error:', snErr);
//         throw snErr;
//       }
//       console.log('✅ seller_notifications.insert →', snData);

//       // 3) finish_order
//       const { data: foData, error: foErr } = await supabase
//         .from('finish_order')
//         .insert([{
//           user_id:       user!.id,
//           seller_id:     i.seller_products.seller_id,
//           product_id:    i.seller_products.id,
//           quantity:      i.quantity,
//           unit_price:    i.seller_products.price,
//           product_name:  i.seller_products.name,
//           product_image: i.seller_products.image_url,
//         }])
//         .select();

//       if (foErr) {
//         console.error('❌ finish_order.insert error:', foErr);
//         throw foErr;
//       }
//       console.log('✅ finish_order.insert →', foData);
//     }

//     // 4) clear cart
//     const { error: clearErr } = await supabase
//       .from('shopping_cart')
//       .delete()
//       .eq('user_id', user!.id);

//     if (clearErr) {
//       console.error('❌ shopping_cart.delete error:', clearErr);
//       throw clearErr;
//     }
//     console.log('✅ shopping_cart cleared');

//     await loadCart();
//     toast.success('Order placed! Sellers have been notified.');
//   } catch (err: any) {
//     toast.error(`Checkout failed: ${err.message}`);
//   } finally {
//     setProcessing(false);
//   }
// };


//   return (
//     <div className="space-y-6">
//       {loading ? (
//         <div>Loading cart…</div>
//       ) : !items.length ? (
//         <div className="text-center py-12 bg-white rounded-xl shadow-md">
//           <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600 mb-4">Your cart is empty.</p>
//           <button
//             onClick={() => window.location.assign('/products')}
//             className="text-orange-500 hover:underline"
//           >
//             Browse Products
//           </button>
//         </div>
//       ) : (
//         <>
//           {items.map(item => (
//             <div
//               key={item.id}
//               className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
//             >
//               {item.seller_products.image_url && (
//                 <img
//                   src={item.seller_products.image_url}
//                   alt={item.seller_products.name}
//                   className="w-24 h-24 object-cover rounded-md"
//                 />
//               )}
//               <div className="flex-1">
//                 <h3 className="font-medium text-gray-800">
//                   {item.seller_products.name}
//                 </h3>
//                 <p className="text-orange-500 font-medium mt-1">
//                   ${item.seller_products.price.toFixed(2)}
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
//                   <Minus className="w-4 h-4" />
//                 </button>
//                 <span className="w-8 text-center">{item.quantity}</span>
//                 <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
//                   <Plus className="w-4 h-4" />
//                 </button>
//               </div>
//               <button onClick={() => removeItem(item.id)}>
//                 <Trash2 className="w-5 h-5" />
//               </button>
//             </div>
//           ))}

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <span className="text-gray-600">Subtotal</span>
//               <span className="font-medium">${getTotal().toFixed(2)}</span>
//             </div>
//             <button
//               onClick={handleCheckout}
//               disabled={processing}
//               className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
//             >
//               {processing ? 'Processing…' : 'Finish Order'}
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default CartSection;
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CartRow {
  id: string;
  quantity: number;
  seller_products: {
    id: string;
    name: string;
    image_url: string | null;
    price: number;
    seller_id: string;
  };
}

const CartSection: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // ─── new location state ───
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          seller_products:product_id (
            id,
            name,
            image_url,
            price,
            seller_id
          )
        `)
        .eq('user_id', user!.id);
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error loading cart:', err);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadCart();
    const channel: RealtimeChannel = supabase
      .channel('cart_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_cart', filter: `user_id=eq.${user.id}` },
        loadCart
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadCart]);

  // ─── geolocation helper ───
  const getMyLocation = () => {
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

  // quantity + remove (unchanged)…
  const updateQuantity = async (cartId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const { error } = await supabase.from('shopping_cart').update({ quantity: newQty }).eq('id', cartId);
      if (error) throw error;
      setItems(prev => prev.map(i => i.id === cartId ? { ...i, quantity: newQty } : i));
    } catch {
      toast.error('Couldn’t update quantity');
    }
  };

  const removeItem = async (cartId: string) => {
    try {
      const { error } = await supabase.from('shopping_cart').delete().eq('id', cartId);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== cartId));
      toast.success('Removed from cart');
    } catch {
      toast.error('Couldn’t remove item');
    }
  };

  const getTotal = () => items.reduce((sum, i) => sum + i.seller_products.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (!items.length) return toast.error('Cart is empty');
    if (!address) return toast.error('Please enter your delivery location');
    setProcessing(true);

    try {
      for (const i of items) {
        // 1) create product order
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert([{
            user_id:    user!.id,
            seller_id:  i.seller_products.seller_id,
            product_id: i.seller_products.id,
            quantity:   i.quantity,
            status:     'pending',
            address,        // ← include
            latitude,       // ← include
            longitude,      // ← include
          }])
          .select()
          .single();
        if (orderErr) throw orderErr;

        // 2) notify seller
        const { data: snData, error: snErr } = await supabase
          .from('seller_notifications')
          .insert([{
            seller_id:  i.seller_products.seller_id,
            product_id: i.seller_products.id,
            qty:        i.quantity,
            message:    `New order: ${i.quantity}× ${i.seller_products.name}`,
            is_read:    false,
            address,     // ← include
            latitude,    // ← include
            longitude,   // ← include
          }])
          .select();
        if (snErr) throw snErr;

        // 3) finish_order (optional: also include location here if you want!)
        await supabase
          .from('finish_order')
          .insert([{
            user_id:       user!.id,
            seller_id:     i.seller_products.seller_id,
            product_id:    i.seller_products.id,
            quantity:      i.quantity,
            unit_price:    i.seller_products.price,
            product_name:  i.seller_products.name,
            product_image: i.seller_products.image_url,
            address,       // ← include if you extended finish_order
            latitude,      // ← include
            longitude,     // ← include
          }]);
      }

      // 4) clear cart
      await supabase.from('shopping_cart').delete().eq('user_id', user!.id);
      await loadCart();

      toast.success('Order placed! Sellers have been notified.');
    } catch (err: any) {
      console.error(err);
      toast.error(`Checkout failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Location Input ─── */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold mb-2">Delivery Location</h2>
        {address ? (
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            <span>{address}</span>
            <button
              onClick={() => { setAddress(''); setLatitude(null); setLongitude(null); }}
              className="ml-auto text-sm text-red-500 hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={getMyLocation}
            className="text-blue-600 hover:underline"
          >
            Enter or use my current location
          </button>
        )}
      </div>

      {/* ─── Cart Items ─── */}
      {loading ? (
        <div>Loading cart…</div>
      ) : !items.length ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <button
            onClick={() => (window.location.href = '/products')}
            className="text-orange-500 hover:underline"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
            >
              {item.seller_products.image_url && (
                <img
                  src={item.seller_products.image_url}
                  alt={item.seller_products.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">
                  {item.seller_products.name}
                </h3>
                <p className="text-orange-500 font-medium mt-1">
                  ${item.seller_products.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)}>
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${getTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {processing ? 'Processing…' : 'Finish Order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSection;
