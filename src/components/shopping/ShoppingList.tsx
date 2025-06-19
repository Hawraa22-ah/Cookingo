
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ShoppingList as ShoppingListType, ShoppingListItem } from '../../types';
import toast from 'react-hot-toast';

interface ShoppingListProps {
  listId: string;
  onDelete?: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ listId, onDelete }) => {
  const [list, setList] = useState<ShoppingListType | null>(null);
  const [newItem, setNewItem] = useState({ ingredient: '', amount: '', unit: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShoppingList();
    // eslint-disable-next-line
  }, [listId]);

  const loadShoppingList = async () => {
    setLoading(true);
    try {
      const { data: listData, error: listError } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          items:shopping_list_items(*)
        `)
        .eq('id', listId)
        .single();

      if (listError) throw listError;
      setList(listData);
    } catch (error) {
      console.error('Error loading shopping list:', error);
      toast.error('Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.ingredient.trim()) return;

    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([{ list_id: listId, ...newItem }])
        .select()
        .single();

      if (error) throw error;

      setList(prev => prev ? { ...prev, items: [...(prev.items || []), data] } : null);
      setNewItem({ ingredient: '', amount: '', unit: '' });
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const toggleItem = async (itemId: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ checked })
        .eq('id', itemId);

      if (error) throw error;

      setList(prev => prev ? {
        ...prev,
        items: prev.items?.map(item =>
          item.id === itemId ? { ...item, checked } : item
        )
      } : null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setList(prev => prev ? {
        ...prev,
        items: prev.items?.filter(item => item.id !== itemId)
      } : null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const deleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      toast.success('Shopping list deleted');
      onDelete?.();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  if (loading) return <div>Loading shopping list...</div>;
  if (!list) return <div>Shopping list not found</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{list.name}</h3>
        <button
          onClick={deleteList}
          className="text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <form onSubmit={addItem} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add item"
            value={newItem.ingredient}
            onChange={(e) => setNewItem(prev => ({ ...prev, ingredient: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Amount"
            value={newItem.amount}
            onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Unit"
            value={newItem.unit}
            onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {list.items?.map((item: ShoppingListItem) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleItem(item.id, !item.checked)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.checked
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300'
                }`}
              >
                {item.checked && <Check size={14} />}
              </button>
              <span className={item.checked ? 'line-through text-gray-500' : ''}>
                {item.ingredient}
                {item.amount && item.unit && (
                  <span className="text-gray-500 ml-2">
                    ({item.amount} {item.unit})
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </li>
        ))}
      </ul>

      {(!list.items || list.items.length === 0) && (
        <p className="text-center text-gray-500 py-4">
          No items in this list yet
        </p>
      )}
    </div>
  );
};

export default ShoppingList;
