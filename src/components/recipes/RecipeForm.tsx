import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Recipe } from '../../types';
import toast from 'react-hot-toast';

interface RecipeFormProps {
  initialData?: Partial<Recipe>;
  onSubmit?: (recipe: Recipe) => void;
  onCancel?: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    video_url: initialData?.video_url || '', 
    cook_time: initialData?.cook_time || 30,
    servings: initialData?.servings || 4,
    ingredients: initialData?.ingredients || [{ name: '', amount: '', unit: '' }],
    instructions: initialData?.instructions || [{ step: 1, text: '' }],
    tags: initialData?.tags || [],
    status: initialData?.status || 'published',
    calories_level: initialData?.calories_level || '',
    meal_time: initialData?.meal_time || '',
    type: initialData?.type || '',
    rich_in: initialData?.rich_in || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const recipeData = {
        ...formData,
        chef_id: user.id,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('recipes')
        .upsert([
          initialData?.id ? { id: initialData.id, ...recipeData } : recipeData
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success(initialData?.id ? 'Recipe updated successfully' : 'Recipe created successfully');

      if (onSubmit) onSubmit(data);
      navigate('/recipes');
    } catch (error: any) {
      console.error('Error saving recipe:', error.message || error);
      toast.error(error.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: prev.instructions.length + 1, text: '' }]
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }))
    }));
  };

  const updateInstruction = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, text } : inst
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Basic Information</h2>

        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />

        <input
              type="url"
              placeholder="Video URL from Supabase"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full border px-3 py-2 rounded"
        />

        <input
          type="url"
          placeholder="Image URL"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="number"
          placeholder="Cook Time (minutes)"
          value={formData.cook_time}
          onChange={(e) => setFormData({ ...formData, cook_time: Number(e.target.value) })}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Servings"
          value={formData.servings}
          onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {/* Filter Fields */}
        <select
          value={formData.calories_level}
          onChange={(e) => setFormData({ ...formData, calories_level: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Calories</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          value={formData.meal_time}
          onChange={(e) => setFormData({ ...formData, meal_time: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Meal Time</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
        </select>

        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Type</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Chicken">Chicken/Meat</option>
          <option value="Fish">Fish</option>
        </select>

        <select
          value={formData.rich_in}
          onChange={(e) => setFormData({ ...formData, rich_in: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Rich in Vitamin</option>
          <option value="Vitamin A">Vitamin A</option>
          <option value="Vitamin C">Vitamin C</option>
          <option value="Vitamin B12">Vitamin B12</option>
        </select>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Ingredients</h2>
          <button type="button" onClick={addIngredient} className="text-orange-500 hover:text-orange-700">
            <Plus />
          </button>
        </div>

        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              value={ingredient.name}
              placeholder="Name"
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
            />
            <input
              value={ingredient.amount}
              placeholder="Amount"
              onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
              className="w-24 border px-2 py-1 rounded"
            />
            <input
              value={ingredient.unit}
              placeholder="Unit"
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
              className="w-24 border px-2 py-1 rounded"
            />
            <button type="button" onClick={() => removeIngredient(index)} className="text-red-500">
              <Minus />
            </button>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Instructions</h2>
          <button type="button" onClick={addInstruction} className="text-orange-500 hover:text-orange-700">
            <Plus />
          </button>
        </div>

        {formData.instructions.map((instruction, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-6 pt-2">{instruction.step}.</div>
            <textarea
              value={instruction.text}
              onChange={(e) => updateInstruction(index, e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
            />
            <button type="button" onClick={() => removeInstruction(index)} className="text-red-500">
              <Minus />
            </button>
          </div>
        ))}
      </div>

      {/* Tags & Status
      {/* <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={formData.tags.join(', ')}
        onChange={(e) =>
          setFormData({
            ...formData,
            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
          })
        }
        className="w-full border px-3 py-2 rounded"
      /> */} 

      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded text-gray-700">
            <X className="inline w-4 h-4 mr-1" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          <Save className="inline w-4 h-4 mr-1" />
          {loading ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
