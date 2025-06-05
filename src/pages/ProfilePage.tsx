// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { User, ChefHat, Settings, ShoppingCart, Package, Bell } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import { Recipe } from '../types';
// import RecipeGrid from '../components/recipes/RecipeGrid';
// import OrdersSection from '../components/profile/OrdersSection';

// const ProfilePage: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState<any>(null);
//   const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'saved' | 'cart' | 'orders'>('saved');

//   useEffect(() => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }
//     loadProfileData();
//     fetchCartItems();
//     fetchNotifications();
//   }, [user, navigate]);

//   const loadProfileData = async () => {
//     try {
//       const { data: profileData } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', user?.id)
//         .maybeSingle();

//       if (profileData) setProfile(profileData);

//       const { data: favorites, error } = await supabase
//         .from('favorites')
//         .select(`recipe:recipe_id (id, title, description, image_url, cook_time, servings, difficulty, tags)`)
//         .eq('user_id', user?.id);

//       if (error) {
//         console.error('Error loading favorites:', error.message);
//         return;
//       }

//       const savedRecipes = (favorites || []).map((fav) => fav.recipe).filter(Boolean);
//       setSavedRecipes(savedRecipes);

//     } catch (error) {
//       console.error('Error loading profile data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCartItems = async () => {
//     const { data } = await supabase
//       .from('shopping_cart')
//       .select('id, quantity, seller_products (id, name, price, image_url, seller_id)')
//       .eq('user_id', user?.id);
//     setCartItems(data || []);
//   };

//   const fetchNotifications = async () => {
//     if (!user) return;
//     const { data, error } = await supabase
//       .from('notifications')
//       .select('*')
//       .eq('recipient_id', user.id)
//       .order('created_at', { ascending: false });
//     if (!error) setNotifications(data || []);
//   };

//   const removeFromCart = async (cartItemId: string) => {
//     await supabase.from('shopping_cart').delete().eq('id', cartItemId);
//     setCartItems(cartItems.filter((item) => item.id !== cartItemId));
//   };

//   const getCartTotal = () => {
//     return cartItems.reduce((sum, item) => sum + item.seller_products?.price * item.quantity, 0);
//   };

//   const handleCheckout = async () => {
//     try {
//       for (const item of cartItems) {
//         const { data: orderData, error: orderError } = await supabase.from('orders').insert([
//           {
//             user_id: user.id,
//             seller_id: item.seller_products.seller_id,
//             product_id: item.seller_products.id,
//             quantity: item.quantity,
//             status: 'pending',
//           },
//         ]).select();

//         if (orderError) {
//           console.error('Order error:', orderError.message);
//           continue;
//         }

//         const orderId = orderData[0].id;

//         const { error: notifError } = await supabase.from('notifications').insert([
//           {
//             recipient_id: item.seller_products.seller_id,
//             order_id: orderId,
//             message: `New order placed for ${item.seller_products.name}`,
//           },
//         ]);

//         if (notifError) {
//           console.error('Notification error:', notifError.message);
//         }
//       }

//       await supabase.from('shopping_cart').delete().eq('user_id', user.id);
//       setCartItems([]);
//       alert('Order completed and seller notified!');
//     } catch (err) {
//       console.error('Checkout error:', err);
//       alert('Something went wrong.');
//     }
//   };

//   if (loading) return <div className="text-center py-16">Loading profile...</div>;
//   if (!profile) return <div className="text-center py-16">Profile not found</div>;

//   return (
//     <div className="container mx-auto px-4 py-16">
//       <div className="max-w-4xl mx-auto">
//         {/* Profile Header */}
//         <div className="bg-white rounded-xl shadow-md p-8 mb-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
//                 {profile?.avatar_url ? (
//                   <img src={profile.avatar_url} alt={profile.full_name} className="w-16 h-16 rounded-full" />
//                 ) : (
//                   <User className="w-8 h-8 text-orange-500" />
//                 )}
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">Welcome {profile.username}</h1>
//                 <p className="text-gray-600">{user?.email}</p>
//                 {profile?.role === 'chef' && (
//                   <button onClick={() => navigate('/chef/dashboard')} className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
//                     🧑‍🍳 Go to Chef Dashboard
//                   </button>
//                 )}
//                 {profile?.role === 'seller' && (
//                   <button onClick={() => navigate('/seller/dashboard')} className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
//                     🛒 Go to Seller Dashboard
//                   </button>
//                 )}
//               </div>
//             </div>
//             <button onClick={() => navigate('/settings')} className="text-gray-600 hover:text-orange-500">
//               <Settings className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         {/* Seller Notifications */}
//         {profile?.role === 'seller' && (
//           <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</h2>
//             {notifications.length === 0 ? (
//               <p className="text-gray-500">No new notifications.</p>
//             ) : (
//               <ul className="list-disc ml-6 space-y-1">
//                 {notifications.map((n) => (
//                   <li key={n.id}>{n.message} <span className="text-sm text-gray-400">({new Date(n.created_at).toLocaleString()})</span></li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}

//         {/* Tabs */}
//         <div className="flex border-b border-gray-200 mb-8">
//           <button onClick={() => setActiveTab('saved')} className={`py-4 px-6 font-medium ${activeTab === 'saved' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
//             <div className="flex items-center gap-2">
//               <ChefHat className="w-5 h-5" />
//               <span>Saved Recipes</span>
//             </div>
//           </button>
//           <button onClick={() => setActiveTab('orders')} className={`py-4 px-6 font-medium ${activeTab === 'orders' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
//             <div className="flex items-center gap-2">
//               <Package className="w-5 h-5" />
//               <span>My Orders</span>
//             </div>
//           </button>
//           <button onClick={() => setActiveTab('cart')} className={`py-4 px-6 font-medium ${activeTab === 'cart' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
//             <div className="flex items-center gap-2">
//               <ShoppingCart className="w-5 h-5" />
//               <span>Shopping Cart</span>
//             </div>
//           </button>
//         </div>

//         {/* Tab Content */}
//         {activeTab === 'saved' && (
//           <div>
//             {savedRecipes.length > 0 ? <RecipeGrid recipes={savedRecipes} /> : (
//               <div className="text-center py-12 bg-white rounded-xl shadow-md">
//                 <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 mb-4">You haven't saved any recipes yet.</p>
//                 <button onClick={() => navigate('/recipes')} className="text-orange-500 hover:text-orange-600 font-medium">Browse Recipes</button>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'orders' && <OrdersSection />}

//         {activeTab === 'cart' && (
//           <div>
//             {cartItems.length === 0 ? (
//               <div className="text-center py-16 text-gray-500">
//                 <i className="text-4xl">🛒</i>
//                 <p className="mt-4">Your cart is empty</p>
//               </div>
//             ) : (
//               <div>
//                 <ul className="space-y-4 mb-6">
//                   {cartItems.map(item => (
//                     <li key={item.id} className="bg-white p-4 rounded shadow flex gap-4 items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         {item.seller_products?.image_url && (
//                           <img src={item.seller_products.image_url} alt={item.seller_products.name} className="w-16 h-16 object-cover rounded" />
//                         )}
//                         <div>
//                           <h4 className="text-lg font-medium">{item.seller_products?.name}</h4>
//                           <p className="text-gray-600 text-sm">${item.seller_products?.price.toFixed(2)}</p>
//                           <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
//                         </div>
//                       </div>
//                       <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline">Remove</button>
//                     </li>
//                   ))}
//                 </ul>
//                 <div className="text-right font-semibold text-lg text-gray-800 mb-4">Total: ${getCartTotal().toFixed(2)}</div>
//                 <div className="text-right">
//                   <button onClick={handleCheckout} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded">Done</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;


// ✅ ProfilePage.tsx - Fixed JSX error on 'saved' tab

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChefHat, Settings, ShoppingCart, Package, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types';
import RecipeGrid from '../components/recipes/RecipeGrid';
import OrdersSection from '../components/profile/OrdersSection';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [cartItems, setCartItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'saved' | 'cart' | 'orders'>('saved');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
    fetchCartItems();
    fetchNotifications();
  }, [user, navigate]);

  const loadProfileData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileData) setProfile(profileData);

      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`recipe:recipe_id (id, title, description, image_url, cook_time, servings, difficulty, tags)`)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error loading favorites:', error.message);
        return;
      }

      const savedRecipes = (favorites || []).map((fav) => fav.recipe).filter(Boolean);
      setSavedRecipes(savedRecipes);

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    const { data } = await supabase
      .from('shopping_cart')
      .select('id, quantity, seller_products (id, name, price, image_url, seller_id)')
      .eq('user_id', user?.id);
    setCartItems(data || []);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setNotifications(data || []);
  };

  const removeFromCart = async (cartItemId: string) => {
    await supabase.from('shopping_cart').delete().eq('id', cartItemId);
    setCartItems(cartItems.filter((item) => item.id !== cartItemId));
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.seller_products?.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const { data: orderData, error: orderError } = await supabase.from('orders').insert([
          {
            user_id: user.id,
            seller_id: item.seller_products.seller_id,
            product_id: item.seller_products.id,
            quantity: item.quantity,
            status: 'pending',
          },
        ]).select();

        if (orderError) {
          console.error('Order error:', orderError.message);
          continue;
        }

        const orderId = orderData[0].id;

        const { error: notifError } = await supabase.from('notifications').insert([
          {
            recipient_id: item.seller_products.seller_id,
            order_id: orderId,
            message: `New order placed for ${item.seller_products.name}`,
          },
        ]);

        if (notifError) {
          console.error('Notification error:', notifError.message);
        }
      }

      await supabase.from('shopping_cart').delete().eq('user_id', user.id);
      setCartItems([]);
      alert('Order completed and seller notified!');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong.');
    }
  };

  if (loading) return <div className="text-center py-16">Loading profile...</div>;
  if (!profile) return <div className="text-center py-16">Profile not found</div>;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-16 h-16 rounded-full" />
                ) : (
                  <User className="w-8 h-8 text-orange-500" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome {profile.username}</h1>
                <p className="text-gray-600">{user?.email}</p>
                {profile?.role === 'chef' && (
                  <button onClick={() => navigate('/chef/dashboard')} className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                    🧑‍🍳 Go to Chef Dashboard
                  </button>
                )}
                {profile?.role === 'seller' && (
                  <button onClick={() => navigate('/seller/dashboard')} className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                    🛒 Go to Seller Dashboard
                  </button>
                )}
              </div>
            </div>
            <button onClick={() => navigate('/settings')} className="text-gray-600 hover:text-orange-500">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {profile?.role === 'seller' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No new notifications.</p>
            ) : (
              <ul className="list-disc ml-6 space-y-1">
                {notifications.map((n) => (
                  <li key={n.id}>{n.message} <span className="text-sm text-gray-400">({new Date(n.created_at).toLocaleString()})</span></li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex border-b border-gray-200 mb-8">
          <button onClick={() => setActiveTab('saved')} className={`py-4 px-6 font-medium ${activeTab === 'saved' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              <span>Saved Recipes</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`py-4 px-6 font-medium ${activeTab === 'orders' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span>My Orders</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('cart')} className={`py-4 px-6 font-medium ${activeTab === 'cart' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Shopping Cart</span>
            </div>
          </button>
        </div>

        {activeTab === 'saved' &&
          (savedRecipes.length > 0 ? (
            <RecipeGrid recipes={savedRecipes} />
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't saved any recipes yet.</p>
              <button onClick={() => navigate('/recipes')} className="text-orange-500 hover:text-orange-600 font-medium">Browse Recipes</button>
            </div>
          ))}

        {activeTab === 'orders' && <OrdersSection />}

        {activeTab === 'cart' && (
          <div>
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <i className="text-4xl">🛒</i>
                <p className="mt-4">Your cart is empty</p>
              </div>
            ) : (
              <div>
                <ul className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <li key={item.id} className="bg-white p-4 rounded shadow flex gap-4 items-center justify-between">
                      <div className="flex items-center gap-4">
                        {item.seller_products?.image_url && (
                          <img src={item.seller_products.image_url} alt={item.seller_products.name} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div>
                          <h4 className="text-lg font-medium">{item.seller_products?.name}</h4>
                          <p className="text-gray-600 text-sm">${item.seller_products?.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                    </li>
                  ))}
                </ul>
                <div className="text-right font-semibold text-lg text-gray-800 mb-4">Total: ${getCartTotal().toFixed(2)}</div>
                <div className="text-right">
                  <button onClick={handleCheckout} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded">Done</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
