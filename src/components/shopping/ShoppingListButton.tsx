import React, { useState } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DailyDishOrder } from '../../types';
import toast from 'react-hot-toast';

interface ShoppingListButtonProps {
  order: DailyDishOrder;
}

const ShoppingListButton: React.FC<ShoppingListButtonProps> = ({ order }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createShoppingList = async () => {
    if (!user) {
      toast.error('Please log in to create a shopping list');
      return;
    }

    setLoading(true);
    try {
      // Create a new shopping list
      const { data: list, error: listError } = await supabase
        .from('shopping_lists')
        .insert([{
          user_id: user.id,
          name: `Order #${order.id.slice(0, 8)} - ${order.dish?.title}`
        }])
        .select()
        .single();

      if (listError) throw listError;

      // Add items to the shopping list
      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .insert([{
          list_id: list.id,
          ingredient: order.dish?.title || 'Unknown Dish',
          amount: order.quantity.toString(),
          unit: 'servings'
        }]);

      if (itemsError) throw itemsError;

      toast.success('Shopping list created successfully');
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast.error('Failed to create shopping list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={createShoppingList}
      disabled={loading}
      className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <ShoppingBag className="animate-pulse" />
      ) : (
        <>
          <ShoppingBag />
          <Plus className="w-4 h-4" />
        </>
      )}
      <span>Add to Shopping List</span>
    </button>
  );
};

export default ShoppingListButton;