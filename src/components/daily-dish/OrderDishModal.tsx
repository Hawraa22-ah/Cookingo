// // import React, { useState } from 'react';
// // import { X } from 'lucide-react';
// // import { Dish } from '../../types';
// // import { supabase } from '../../lib/supabase';
// // import toast from 'react-hot-toast';
// // import { useAuth } from '../../contexts/AuthContext';
// // import { useNavigate } from 'react-router-dom';

// // interface OrderDishModalProps {
// //   dish: Dish;
// //   onClose: () => void;
// //   onOrderComplete: () => void;
// // }

// // const OrderDishModal: React.FC<OrderDishModalProps> = ({ dish, onClose, onOrderComplete }) => {
// //   const { user } = useAuth();
// //   const navigate = useNavigate();
// //   const [quantity, setQuantity] = useState(1);
// //   const [deliveryDate, setDeliveryDate] = useState('');
// //   const [deliveryTime, setDeliveryTime] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
    
// //     if (!user) {
// //       toast.error('Please log in to place an order');
// //       navigate('/login');
// //       return;
// //     }

// //     if (!deliveryDate || !deliveryTime) {
// //       toast.error('Please select delivery date and time');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const { error } = await supabase
// //         .from('daily_dish_orders')
// //         .insert([{
// //           dish_id: dish.id,
// //           user_id: user.id,
// //           quantity,
// //           delivery_date: deliveryDate,
// //           delivery_time: deliveryTime,
// //           status: 'pending'
// //         }]);

// //       if (error) throw error;

// //       toast.success('Order placed successfully!');
// //       onOrderComplete();
// //       onClose();
// //     } catch (error) {
// //       console.error('Error placing order:', error);
// //       toast.error('Failed to place order');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Get tomorrow's date as minimum date for delivery
// //   const tomorrow = new Date();
// //   tomorrow.setDate(tomorrow.getDate() + 1);
// //   const minDate = tomorrow.toISOString().split('T')[0];

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
// //         <div className="flex justify-between items-center mb-4">
// //           <h2 className="text-xl font-bold">Order {dish.title}</h2>
// //           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
// //             <X size={24} />
// //           </button>
// //         </div>

// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Quantity
// //             </label>
// //             <input
// //               type="number"
// //               min="1"
// //               value={quantity}
// //               onChange={(e) => setQuantity(parseInt(e.target.value))}
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Delivery Date
// //             </label>
// //             <input
// //               type="date"
// //               min={minDate}
// //               value={deliveryDate}
// //               onChange={(e) => setDeliveryDate(e.target.value)}
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Delivery Time
// //             </label>
// //             <input
// //               type="time"
// //               value={deliveryTime}
// //               onChange={(e) => setDeliveryTime(e.target.value)}
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
// //             />
// //           </div>

// //           <div className="mt-6">
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //             >
// //               {loading ? 'Placing Order...' : 'Place Order'}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default OrderDishModal;
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
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!user) {
//       toast.error('Please log in to place an order');
//       navigate('/login');
//       return;
//     }

//     if (!deliveryDate || !deliveryTime) {
//       toast.error('Please select delivery date and time');
//       return;
//     }

//     setLoading(true);

//     try {
//       const { error } = await supabase
//         .from('daily_dish_orders')
//         .insert([{
//           dish_id: dish.id,
//           user_id: user.id,
//           quantity,
//           delivery_date: deliveryDate,
//           delivery_time: deliveryTime,
//           status: 'pending',
//           created_at: new Date().toISOString()
//         }]);

//       if (error) throw error;

//       toast.success('Order placed successfully!');
//       onOrderComplete();
//       onClose();
//     } catch (error) {
//       console.error('Error placing order:', error);
//       toast.error('Failed to place order');
//     } finally {
//       setLoading(false);
//     }
//   };

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
//             <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//             <input
//               type="number"
//               min="1"
//               value={quantity}
//               onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
//             <input
//               type="date"
//               min={minDate}
//               value={deliveryDate}
//               onChange={(e) => setDeliveryDate(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
//             <input
//               type="time"
//               value={deliveryTime}
//               onChange={(e) => setDeliveryTime(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//               required
//             />
//           </div>

//           <div className="mt-6">
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Placing Order...' : 'Place Order'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OrderDishModal;

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      toast.error('Please select delivery date and time');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('daily_dish_orders').insert([{
        dish_id: dish.id,
        user_id: user.id,
        quantity,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      toast.success('Order placed successfully!');
      onOrderComplete(); // Refresh orders
      onClose();         // Close modal
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

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
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Delivery Time</label>
            <input
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
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
