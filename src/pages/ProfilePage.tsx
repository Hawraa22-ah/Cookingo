import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Bell as BellIcon,
  User,
  ChefHat,
  Settings,
  ShoppingCart as ShoppingCartIcon,
  Package,
  Gift
} from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Recipe } from '../types'
import RecipeGrid from '../components/recipes/RecipeGrid'
// You will need to pass props to these components:
import OrdersSection from '../components/profile/OrdersSection'
import OccasionsOrdersSection from '../components/profile/OccasionsOrdersSection'
import AnnouncementsPage from './AnnouncementsPage'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [profile, setProfile] = useState<any>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [dishOrders, setDishOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    'saved' | 'occasions' | 'orders' | 'cart' | 'announcements'
  >('saved')

  // 1) load profile + saved
  const loadProfileData = useCallback(async () => {
    setLoading(true)
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle()
    if (p) setProfile(p)

    const { data: favs } = await supabase
      .from('favorite_recipes')
      .select('recipe:recipe_id (id, title, description, image_url, cook_time, servings, difficulty, tags)')
      .eq('user_id', user?.id)
    setSavedRecipes((favs || []).map(f => f.recipe).filter(Boolean) as Recipe[])

    setLoading(false)
  }, [user])

  // 2) load cart items
  const fetchCartItems = useCallback(async () => {
    const { data: cart } = await supabase
      .from('shopping_cart')
      .select('*')
      .eq('user_id', user?.id)
    if (!cart?.length) {
      setCartItems([])
      return
    }
    const ids = cart.map(c => c.product_id)
    let prods = []
    if (ids.length > 0) {
      const { data } = await supabase
        .from('seller_products')
        .select('*')
        .in('id', ids)
      prods = data || []
    }
    setCartItems(
      cart.map(item => ({
        ...item,
        seller_products: prods.find(p => p.id === item.product_id) || {},
      }))
    )
  }, [user])

  // 3) load orders (products)
  const fetchOrders = useCallback(async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    // Attach product info
    if (orders && orders.length) {
      const productIds = orders.map(o => o.product_id).filter(Boolean)
      let prods: any[] = []
      if (productIds.length > 0) {
        const { data } = await supabase
          .from('seller_products')
          .select('*')
          .in('id', productIds)
        prods = data || []
      }
      setOrders(
        orders.map(order => ({
          ...order,
          product: prods.find(p => p.id === order.product_id) || {},
        }))
      )
    } else {
      setOrders([])
    }
  }, [user])

  // 4) load daily dish orders
  const fetchDishOrders = useCallback(async () => {
    const { data: dishOrders } = await supabase
      .from('daily_dish_orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    // Attach dish info
    if (dishOrders && dishOrders.length) {
      const dishIds = dishOrders.map(o => o.dish_id).filter(Boolean)
      let dishes: any[] = []
      if (dishIds.length > 0) {
        const { data } = await supabase
          .from('dishes')
          .select('*')
          .in('id', dishIds)
        dishes = data || []
      }
      setDishOrders(
        dishOrders.map(order => ({
          ...order,
          dish: dishes.find(d => d.id === order.dish_id) || {},
        }))
      )
    } else {
      setDishOrders([])
    }
  }, [user])

  // 5) load seller notifications (for badge)
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      return
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setNotifications(data || [])
  }, [user])

  // initial
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadProfileData()
    fetchCartItems()
    fetchOrders()
    fetchDishOrders()
  }, [user, navigate, loadProfileData, fetchCartItems, fetchOrders, fetchDishOrders])

  // whenever profile changes, fetch notifications
  useEffect(() => {
    fetchNotifications()
  }, [profile, fetchNotifications])

  // switch to tab=cart via URL
  useEffect(() => {
    if (new URLSearchParams(location.search).get('tab') === 'cart') {
      setActiveTab('cart')
    }
  }, [location.search])

  const removeFromCart = async (id: string) => {
    await supabase.from('shopping_cart').delete().eq('id', id)
    fetchCartItems()
  }

  const getCartTotal = () =>
    cartItems.reduce((sum, i) => sum + (i.seller_products?.price || 0) * i.quantity, 0)

  // 6) checkout
  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: user!.id,
            seller_id: item.seller_products.seller_id,
            product_id: item.seller_products.id,
            quantity: item.quantity,
            status: 'pending',
          }])
          .select()
          .single()

        if (orderError || !orderData) {
          console.error('Order insert failed:', orderError)
          continue
        }

        await supabase.from('notifications').insert([{
          seller_id: item.seller_products.seller_id,
          order_id: orderData.id,
          message: `New order from ${profile.username} • ${item.quantity} × ${item.seller_products.name}`,
          is_read: false,
          type: 'order',
          product_id: item.seller_products.id,
          qty: item.quantity,
          created_at: new Date().toISOString(),
        }])
      }

      await supabase.from('shopping_cart').delete().eq('user_id', user!.id)
      fetchCartItems()
      fetchOrders()
      fetchNotifications()

      alert('Order placed! Sellers have been notified.')
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Something went wrong.')
    }
  }

  if (loading) return <div className="text-center py-16">Loading profile…</div>
  if (!profile) return <div className="text-center py-16">Profile not found</div>

  const tabs = [
    { key: 'saved',         label: 'Saved Recipes',   icon: ChefHat },
    { key: 'occasions',     label: 'Order Occasions', icon: Gift },
    { key: 'orders',        label: 'My Orders',       icon: Package },
    { key: 'cart',          label: 'Shopping Cart',   icon: ShoppingCartIcon },
    { key: 'announcements', label: 'Announcements',   icon: BellIcon },
  ]

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
            {(profile.role === 'seller' || profile.role === 'chef') && (
              <button onClick={() => navigate('/notifications')} className="relative text-gray-600 hover:text-orange-500">
                <BellIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {notifications.length}
                  </span>
                )}
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
        {activeTab === 'saved' && (
          savedRecipes.length ? (
            <RecipeGrid recipes={savedRecipes} />
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven’t saved any recipes yet.</p>
              <button onClick={() => navigate('/recipes')} className="text-orange-500 hover:text-orange-600">
                Browse Recipes
              </button>
            </div>
          )
        )}
        {activeTab === 'occasions' && <OccasionsOrdersSection />}
        {activeTab === 'orders' && (
          <OrdersSection orders={orders} dishOrders={dishOrders} />
        )}
        {activeTab === 'cart' && (
          <div className="bg-white rounded-xl shadow-md p-4">
            {cartItems.length > 0 ? (
              <>
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between mb-4">
                    <img src={item.seller_products.image_url} alt={item.seller_products.name} className="w-16 h-16 rounded" />
                    <div className="flex-1 px-4">
                      <h3 className="font-medium">{item.seller_products.name}</h3>
                      <p className="text-gray-500">{item.quantity} × ${item.unit_price?.toFixed(2) ?? '0.00'}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:underline">
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-6">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold">${getCartTotal().toFixed(2)}</span>
                </div>
                <button onClick={handleCheckout} className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">
                  Checkout
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Your cart is empty.</p>
                <button onClick={() => navigate('/products')} className="text-orange-500 hover:underline">
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}
        {activeTab === 'announcements' && <AnnouncementsPage />}
      </div>
    </div>
  )
}

export default ProfilePage
