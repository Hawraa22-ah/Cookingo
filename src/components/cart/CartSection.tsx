// import React, { useState, useEffect } from 'react';
// import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../contexts/AuthContext';
// import toast from 'react-hot-toast';

// const CartSection: React.FC = () => {
//   const { user } = useAuth();
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user) loadCartItems();
//   }, [user]);

//   const loadCartItems = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('cart_items')
//         .select(`*, product:product_id (id, title, description, image_url, price, seller_id)`) // ensure seller_id is included
//         .eq('user_id', user?.id);

//       if (error) throw error;
//       setCartItems(data || []);
//     } catch (error) {
//       toast.error('Failed to load cart items');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateQuantity = async (itemId: string, newQuantity: number) => {
//     if (newQuantity < 1) return;
//     try {
//       await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId);
//       setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
//     } catch {
//       toast.error('Failed to update quantity');
//     }
//   };

//   const removeItem = async (itemId: string) => {
//     try {
//       await supabase.from('cart_items').delete().eq('id', itemId);
//       setCartItems(prev => prev.filter(item => item.id !== itemId));
//       toast.success('Item removed from cart');
//     } catch {
//       toast.error('Failed to remove item');
//     }
//   };

//   const calculateTotal = () => cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);

//   const handleFinishOrder = async () => {
//     try {
//       for (const item of cartItems) {
//         const { data: orderData, error: orderError } = await supabase.from('orders').insert([
//           {
//             user_id: user.id,
//             seller_id: item.product.seller_id,
//             product_id: item.product.id,
//             quantity: item.quantity,
//             status: 'pending',
//           },
//         ]).select();

//         if (orderError) throw orderError;

//         const orderId = orderData[0].id;

//         const { error: notificationError } = await supabase.from('notifications').insert([
//           {
//             recipient_id: item.product.seller_id,
//             order_id: orderId,
//             message: `New order placed for ${item.product.title}`,
//           },
//         ]);

//         if (notificationError) throw notificationError;
//       }

//       await supabase.from('cart_items').delete().eq('user_id', user.id);
//       setCartItems([]);
//       toast.success('Order placed and seller notified!');
//     } catch (error) {
//       console.error('Checkout error:', error);
//       toast.error('Order failed');
//     }
//   };

//   if (loading) return <div>Loading cart...</div>;
//   if (cartItems.length === 0) return <div className="text-center py-12 bg-white rounded-xl shadow-md">
//     <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//     <p className="text-gray-600 mb-4">Your cart is empty</p>
//   </div>;

//   return (
//     <div className="space-y-6">
//       {cartItems.map((item) => (
//         <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
//           <img src={item.product?.image_url} alt={item.product?.title} className="w-24 h-24 object-cover rounded-md" />
//           <div className="flex-1">
//             <h3 className="font-medium text-gray-800">{item.product?.title}</h3>
//             <p className="text-gray-600 text-sm">{item.product?.description}</p>
//             <p className="text-orange-500 font-medium mt-1">${item.product?.price.toFixed(2)}</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-4 h-4" /></button>
//             <span className="w-8 text-center">{item.quantity}</span>
//             <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-4 h-4" /></button>
//           </div>
//           <button onClick={() => removeItem(item.id)}><Trash2 className="w-5 h-5" /></button>
//         </div>
//       ))}

//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex justify-between items-center mb-4">
//           <span className="text-gray-600">Subtotal</span>
//           <span className="font-medium">${calculateTotal().toFixed(2)}</span>
//         </div>
//         <button onClick={handleFinishOrder} className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600">
//           Finish Order
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CartSection;

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CartSection: React.FC = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadCartItems();
  }, [user]);

  const loadCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`*, product:product_id (id, title, description, image_url, price, seller_id)`)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId);
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await supabase.from('cart_items').delete().eq('id', itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () =>
    cartItems.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );

  const handleFinishOrder = async () => {
    try {
      for (const item of cartItems) {
        // 1. Insert into orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              user_id: user.id,
              seller_id: item.product.seller_id,
              product_id: item.product.id,
              quantity: item.quantity,
              status: 'pending',
            },
          ])
          .select();

        if (orderError) throw orderError;
        const orderId = orderData[0].id;

        // 2. Insert into notifications
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              recipient_id: item.product.seller_id,
              order_id: orderId,
              message: `New order placed for ${item.product.title}`,
              is_read: false,
            },
          ]);

        if (notificationError) throw notificationError;
      }

      // 3. Clear the cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      setCartItems([]);
      toast.success('Order placed and seller notified!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Order failed');
    }
  };

  if (loading) return <div>Loading cart...</div>;

  if (cartItems.length === 0)
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Your cart is empty</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
        >
          <img
            src={item.product?.image_url}
            alt={item.product?.title}
            className="w-24 h-24 object-cover rounded-md"
          />

          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{item.product?.title}</h3>
            <p className="text-gray-600 text-sm">{item.product?.description}</p>
            <p className="text-orange-500 font-medium mt-1">
              ${item.product?.price.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
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
          <span className="font-medium">${calculateTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={handleFinishOrder}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600"
        >
          Finish Order
        </button>
      </div>
    </div>
  );
};

export default CartSection;


