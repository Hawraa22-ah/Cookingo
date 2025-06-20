
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
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

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          seller_products :product_id(
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
        {
          event: '*',
          schema: 'public',
          table: 'shopping_cart',
          filter: `user_id=eq.${user.id}`,
        },
        loadCart
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadCart]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) return toast.error('You must be logged in!');

    try {
      const { data: existingItem } = await supabase
        .from('shopping_cart')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from('shopping_cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('shopping_cart').insert([
          {
            user_id: user.id,
            product_id: productId,
            quantity,
          },
        ]);

        if (error) throw error;
      }

      toast.success('Added to cart!');
      loadCart();
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Failed to add to cart.');
    }
  };

  const updateQuantity = async (cartId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .update({ quantity: newQty })
        .eq('id', cartId);
      if (error) throw error;
      setItems(prev =>
        prev.map(item => (item.id === cartId ? { ...item, quantity: newQty } : item))
      );
    } catch {
      toast.error('Couldn’t update quantity');
    }
  };

  const removeItem = async (cartId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartId);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== cartId));
      toast.success('Removed from cart');
    } catch {
      toast.error('Couldn’t remove item');
    }
  };

  const getTotal = () =>
    items.reduce((sum, i) => sum + i.seller_products.price * i.quantity, 0);

  // -- CHANGED: Now also inserts into finish_order table!
  const handleCheckout = async () => {
    if (!items.length) return;
    setProcessing(true);
    try {
      for (const i of items) {
        // 1. Insert order as usual
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert([
            {
              user_id: user!.id,
              seller_id: i.seller_products.seller_id,
              product_id: i.seller_products.id,
              quantity: i.quantity,
              status: 'pending',
            },
          ])
          .select()
          .single();

        if (orderErr || !orderData) continue;

        // 2. Insert notification as before
        await supabase.from('notifications').insert([
          {
            seller_id: i.seller_products.seller_id,
            order_id: orderData.id,
            message: `New order: ${i.quantity}× ${i.seller_products.name}`,
            is_read: false,
            type: 'order',
            product_id: i.seller_products.id,
            qty: i.quantity,
            created_at: new Date().toISOString(),
          },
        ]);

        // 3. Insert cart item into finish_order table
        await supabase.from('finish_order').insert([
          {
            user_id: user!.id,
            seller_id: i.seller_products.seller_id,
            product_id: i.seller_products.id,
            quantity: i.quantity,
            unit_price: i.seller_products.price,
            product_name: i.seller_products.name,
            product_image: i.seller_products.image_url,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // 4. Delete cart items
      const { error: clearCartError } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user!.id);

      if (clearCartError) throw clearCartError;

      await loadCart();

      toast.success('Order placed! Sellers have been notified.');
    } catch (err) {
      console.error('Checkout failed:', err);
      toast.error('Checkout failed');
    } finally {
      setProcessing(false);
    }
  };


  return (
    <div className="space-y-6">
      {loading ? (
        <div>Loading cart…</div>
      ) : !items.length ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <button
            onClick={() => window.location.assign('/products')}
            className="text-orange-500 hover:underline"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {items.map((item) => (
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
