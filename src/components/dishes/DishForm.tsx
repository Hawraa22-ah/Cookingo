import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface DishFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const DishForm: React.FC<DishFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [servings, setServings] = useState<number>(1);
  const [time, setTime] = useState<number>(30);
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;
      const chefId = user?.id;

      // ✅ Get chef name from metadata or fallback to 'profiles'
      let chefName = user?.user_metadata?.full_name || '';

      if (!chefName && chefId) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', chefId)
          .single();

        if (profileError) {
          console.warn('Profile fallback failed:', profileError.message);
        }

        chefName = profileData?.full_name || 'Unknown Chef';
      }

      // ✅ Upload image to Supabase Storage if provided
      let imagePath = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `public/${Date.now()}-${imageFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('dish-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        imagePath = data.path;
      }

      // ✅ Insert new dish
      const { error } = await supabase.from('dishes').insert({
        chef_id: chefId,
        chef_name: chefName,
        title,
        description,
        price,
        servings,
        time,
        difficulty,
        image_path: imagePath,
        status: 'published',
      });

      if (error) throw error;

      toast.success('Dish created successfully');
      onSubmit();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create dish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Price ($)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Servings</label>
        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Time (minutes)</label>
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="text-gray-500">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          {loading ? 'Saving...' : 'Create Dish'}
        </button>
      </div>
    </form>
  );
};

export default DishForm;


