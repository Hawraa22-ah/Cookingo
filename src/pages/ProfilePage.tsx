// import React, { useEffect, useState, useCallback } from 'react'
// import { useNavigate, useLocation } from 'react-router-dom'
// import {
//   Bell as BellIcon,
//   Megaphone as AnnounceIcon,
//   User,
//   ChefHat,
//   Settings,
//   ShoppingCart as ShoppingCartIcon,
//   Package,
//   Gift
// } from 'lucide-react'

// import { useAuth } from '../contexts/AuthContext'
// import { supabase } from '../lib/supabase'
// import { Recipe } from '../types'
// import RecipeGrid from '../components/recipes/RecipeGrid'
// import OrdersSection from '../components/profile/OrdersSection'
// import OccasionsOrdersSection from '../components/profile/OccasionsOrdersSection'
// import AnnouncementsPage from './AnnouncementsPage'
// import ChefOccasionRequestsSection from '../components/profile/ChefOccasionRequestsSection'
// import SellerNotificationsSection from '../components/profile/SellerNotificationsSection'
// import CartSection from '../components/cart/CartSection'

// const ProfilePage: React.FC = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()

//   const [profile, setProfile]             = useState<any>(null)
//   const [savedRecipes, setSavedRecipes]   = useState<Recipe[]>([])
//   const [cartItems, setCartItems]         = useState<any[]>([])
//   const [notifications, setNotifications] = useState<any[]>([])
//   const [loading, setLoading]             = useState(true)
//   const [activeTab, setActiveTab] = useState<
//     'saved' | 'occasions' | 'orders' | 'cart' | 'announcements' | 'notifications'
//   >('saved')

//   // 1) load profile + saved
//   const loadProfileData = useCallback(async () => {
//     setLoading(true)
//     const { data: p } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', user?.id)
//       .maybeSingle()
//     if (p) setProfile(p)

//     const { data: favs } = await supabase
//       .from('favorite_recipes')
//       .select('recipe:recipe_id (id, title, description, image_url, cook_time, servings, difficulty, tags, chef:profiles!fk_chef (id, username))')
//       .eq('user_id', user?.id)
//     setSavedRecipes((favs || []).map(f => f.recipe).filter(Boolean) as Recipe[])

//     setLoading(false)
//   }, [user])

//   // 2) load cart items
//   const fetchCartItems = async () => {
//     const { data: cart } = await supabase
//       .from('shopping_cart')
//       .select('*')
//       .eq('user_id', user?.id)
//     if (!cart?.length) {
//       setCartItems([])
//       return
//     }
//     const ids = cart.map(c => c.product_id)
//     const { data: prods } = await supabase
//       .from('seller_products')
//       .select('*')
//       .in('id', ids)

//     setCartItems(
//       cart.map(item => ({
//         ...item,
//         seller_products: prods?.find(p => p.id === item.product_id),
//       }))
//     )
//   }

//   // 3) load chef notifications (for badge)
//   const fetchNotifications = async () => {
//     if (!user || profile?.role !== 'chef') {
//       setNotifications([])
//       return
//     }
//     const { data, error } = await supabase
//       .from('notifications')
//       .select('*')
//       .eq('chef_id', user.id)
//       .order('created_at', { ascending: false })
//     if (error) console.error(error)
//     else setNotifications(data || [])
//   }

//   // initial
//   useEffect(() => {
//     if (!user) {
//       navigate('/login')
//       return
//     }
//     loadProfileData()
//     fetchCartItems()
//   }, [user, navigate, loadProfileData])

//   // whenever profile changes, fetch notifications
//   useEffect(() => {
//     fetchNotifications()
//   }, [profile])

//   // switch to tab=cart via URL
//   useEffect(() => {
//     if (new URLSearchParams(location.search).get('tab') === 'cart') {
//       setActiveTab('cart')
//     }
//   }, [location.search])

//   const removeFromCart = async (id: string) => {
//     await supabase.from('shopping_cart').delete().eq('id', id)
//     setCartItems(prev => prev.filter(i => i.id !== id))
//   }

//   const getCartTotal = () =>
//     cartItems.reduce((sum, i) => sum + (i.seller_products?.price || 0) * i.quantity, 0)

//   // 4) checkout
//   const handleCheckout = async () => {
//     try {
//       for (const item of cartItems) {
//         // Insert order
//         const { data: orderData, error: orderError } = await supabase
//           .from('orders')
//           .insert([{
//             user_id: user!.id,
//             seller_id: item.seller_products.seller_id,
//             product_id: item.seller_products.id,
//             quantity: item.quantity,
//             status: 'pending',
//           }])
//           .select()
//           .single();

//         if (orderError || !orderData) {
//           console.error('Order insert failed:', orderError)
//           continue
//         }

//         // Insert seller notification
//         const { data: notifData, error: notifError } = await supabase.from('seller_notifications').insert([{
//           seller_id: item.seller_products.seller_id,
//           order_id: orderData.id,
//           buyer_id: user!.id,
//           product_ids: [item.seller_products.id],
//           message: `New order from ${profile.username} • ${item.quantity} × ${item.seller_products.name}`,
//           is_read: false,
//           created_at: new Date().toISOString(),
//         }]);
//         if (notifError) {
//           console.error('Seller notification insert error:', notifError);
//         } else {
//           console.log('Inserted seller notification:', notifData);
//         }
//       }

//       await supabase.from('shopping_cart').delete().eq('user_id', user!.id)
//       setCartItems([])

//       await fetchNotifications()

//       alert('Order placed! Sellers have been notified.')
//     } catch (err) {
//       console.error('Checkout error:', err)
//       alert('Something went wrong.')
//     }
//   }

//   if (loading) return <div className="text-center py-16">Loading profile…</div>
//   if (!profile) return <div className="text-center py-16">Profile not found</div>

//   const tabs = [
//     { key: 'saved',         label: 'Saved Recipes',   icon: ChefHat },
//     { key: 'occasions',     label: 'Order Occasions', icon: Gift },
//     { key: 'orders',        label: 'My Orders',       icon: Package },
//     { key: 'cart',          label: 'Shopping Cart',   icon: ShoppingCartIcon },
//     { key: 'announcements', label: 'Announcements',   icon: AnnounceIcon },
//     ...(profile.role === 'chef' || profile.role === 'seller'
//       ? [{ key: 'notifications', label: 'Notifications', icon: BellIcon }]
//       : []),
//   ]

//   return (
//     <div className="container mx-auto px-7 py-15">
//       <div className="max-w-6xl mx-auto">

//         {/* PROFILE HEADER */}
//         <div className="bg-white rounded-xl shadow-md p-8 mb-8 flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
//               {profile.avatar_url
//                 ? <img src={profile.avatar_url} alt={profile.username} className="w-16 h-16 rounded-full" />
//                 : <User className="w-8 h-8 text-orange-500" />}
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">Welcome {profile.username}</h1>
//               <p className="text-gray-600">{user!.email}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {profile.role === 'admin' && (
//               <button onClick={() => navigate('/admin/dashboard')} className="bg-orange-500 text-white px-4 py-2 rounded">
//                 Admin Dashboard
//               </button>
//             )}
//             {profile.role === 'chef' && (
//               <button onClick={() => navigate('/chef/dashboard')} className="bg-orange-500 text-white px-4 py-2 rounded">
//                 Chef Dashboard
//               </button>
//             )}
//             {profile.role === 'seller' && (
//               <button onClick={() => navigate('/seller/dashboard')} className="bg-orange-500 text-white px-4 py-2 rounded">
//                 Seller Dashboard
//               </button>
//             )}
//             <button onClick={() => navigate('/settings')} className="text-gray-600 hover:text-orange-500">
//               <Settings className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         {/* TABS */}
//         <div className="flex border-b border-gray-200 mb-8 flex-wrap">
//           {tabs.map(t => (
//             <button
//               key={t.key}
//               onClick={() => setActiveTab(t.key as any)}
//               className={`py-4 px-6 flex items-center gap-2 font-medium whitespace-nowrap ${
//                 activeTab === t.key
//                   ? 'text-orange-500 border-b-2 border-orange-500'
//                   : 'text-gray-600 hover:text-orange-500'
//               }`}
//             >
//               <t.icon className="w-5 h-5" /> {t.label}
//             </button>
//           ))}
//         </div>

//         {/* CONTENT PANELS */}
//         {activeTab === 'saved'          && (savedRecipes.length
//           ? <RecipeGrid recipes={savedRecipes} />
//           : <div className="text-center py-12 bg-white rounded-xl shadow-md">
//               <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600 mb-4">You haven’t saved any recipes yet.</p>
//               <button onClick={() => navigate('/recipes')} className="text-orange-500 hover:text-orange-600">
//                 Browse Recipes
//               </button>
//             </div>
//         )}
//         {activeTab === 'occasions'      && <OccasionsOrdersSection />}
//         {activeTab === 'orders'         && <OrdersSection />}
//         {activeTab === 'cart'           && <CartSection />}
//         {activeTab === 'announcements'  && <AnnouncementsPage />}
//         {activeTab === 'notifications'  && (
//           profile.role === 'chef'
//             ? <ChefOccasionRequestsSection />
//             : <SellerNotificationsSection />
//         )}

//       </div>
//     </div>
//   )
// }

// export default ProfilePage
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell as BellIcon,
  Megaphone as AnnounceIcon,
  User,
  ChefHat,
  Settings,
  ShoppingCart as ShoppingCartIcon,
  Package,
  Gift
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types';
import RecipeGrid from '../components/recipes/RecipeGrid';
import OrdersSection from '../components/profile/OrdersSection';
import OccasionsOrdersSection from '../components/profile/OccasionsOrdersSection';
import AnnouncementsPage from './AnnouncementsPage';
import ChefOccasionRequestsSection from '../components/profile/ChefOccasionRequestsSection';
import SellerNotificationsSection from '../components/profile/SellerNotificationsSection';
import CartSection from '../components/cart/CartSection';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile]             = useState<any>(null);
  const [savedRecipes, setSavedRecipes]   = useState<Recipe[]>([]);
  const [cartItems, setCartItems]         = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab] = useState<
    'saved' | 'occasions' | 'orders' | 'cart' | 'announcements' | 'notifications'
  >('saved');

  // 1) load profile + saved
  const loadProfileData = useCallback(async () => {
    setLoading(true);
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();
    if (p) setProfile(p);

    const { data: favs } = await supabase
      .from('favorite_recipes')
      .select('recipe:recipe_id (id, title, description, image_url, cook_time, servings, difficulty, tags, chef:profiles!fk_chef (id, username))')
      .eq('user_id', user?.id);
    setSavedRecipes((favs || []).map(f => f.recipe).filter(Boolean) as Recipe[]);

    setLoading(false);
  }, [user]);

  // 2) load cart items
  const fetchCartItems = async () => {
    const { data: cart } = await supabase
      .from('shopping_cart')
      .select('*')
      .eq('user_id', user?.id);
    if (!cart?.length) {
      setCartItems([]);
      return;
    }
    const ids = cart.map(c => c.product_id);
    const { data: prods } = await supabase
      .from('seller_products')
      .select('*')
      .in('id', ids);

    setCartItems(
      cart.map(item => ({
        ...item,
        seller_products: prods?.find(p => p.id === item.product_id),
      }))
    );
  };

  // 3) load chef notifications (for the bell badge)
  const fetchNotifications = async () => {
    if (!user || profile?.role !== 'chef') {
      setNotifications([]);
      return;
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('chef_id', user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('chef fetchNotifications:', error);
    else setNotifications(data || []);
  };

  // initial
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
    fetchCartItems();
  }, [user, navigate, loadProfileData]);

  // refetch chef notifications when profile loads
  useEffect(() => {
    fetchNotifications();
  }, [profile]);

  // switch to tab=cart via URL
  useEffect(() => {
    if (new URLSearchParams(location.search).get('tab') === 'cart') {
      setActiveTab('cart');
    }
  }, [location.search]);

  const getCartTotal = () =>
    cartItems.reduce((sum, i) => sum + (i.seller_products?.price || 0) * i.quantity, 0);

  if (loading) return <div className="text-center py-16">Loading profile…</div>;
  if (!profile) return <div className="text-center py-16">Profile not found</div>;

  const tabs = [
    { key: 'saved',         label: 'Saved Recipes',   icon: ChefHat },
    { key: 'occasions',     label: 'Order Occasions', icon: Gift },
    { key: 'orders',        label: 'My Orders',       icon: Package },
    { key: 'cart',          label: 'Shopping Cart',   icon: ShoppingCartIcon },
    { key: 'announcements', label: 'Announcements',   icon: AnnounceIcon },
    ...(profile.role === 'chef' || profile.role === 'seller'
      ? [{ key: 'notifications', label: 'Notifications', icon: BellIcon }]
      : []),
  ];

  return (
    <div className="container mx-auto px-7 py-15">
      <div className="max-w-6xl mx-auto">

        {/* PROFILE HEADER */}  
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.username} className="w-16 h-16 rounded-full" />
                : <User className="w-8 h-8 text-orange-500" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome {profile.username}</h1>
              <p className="text-gray-600">{user!.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile.role === 'admin' && (
              <button onClick={() => navigate('/admin/dashboard')} className="bg-orange-500 text-white px-4 py-2 rounded">
                Admin Dashboard
              </button>
            )}
            {profile.role === 'chef' && (
              <button onClick={() => navigate('/chef/dashboard')} className="bg-orange-500 text-white px-4 py-2 rounded">
                Chef Dashboard
              </button>
            )}
            {profile.role === 'seller' && (
              <button onClick={() => navigate('/seller/dashboard')} className="bg-orange-500 text-white px-4 py-2 rounded">
                Seller Dashboard
              </button>
            )}
            <button onClick={() => navigate('/settings')} className="text-gray-600 hover:text-orange-500">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-8 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`py-4 px-6 flex items-center gap-2 font-medium whitespace-nowrap ${
                activeTab === t.key
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              <t.icon className="w-5 h-5" /> {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT PANELS */}
        {activeTab === 'saved'         && (savedRecipes.length
          ? <RecipeGrid recipes={savedRecipes} />
          : <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven’t saved any recipes yet.</p>
              <button onClick={() => navigate('/recipes')} className="text-orange-500 hover:text-orange-600">
                Browse Recipes
              </button>
            </div>
        )}
        {activeTab === 'occasions'     && <OccasionsOrdersSection />}
        {activeTab === 'orders'        && <OrdersSection />}
        {activeTab === 'cart'          && <CartSection />}
        {activeTab === 'announcements' && <AnnouncementsPage />}
        {activeTab === 'notifications' && (
          profile.role === 'chef'
            ? <ChefOccasionRequestsSection />
            : <SellerNotificationsSection />
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
