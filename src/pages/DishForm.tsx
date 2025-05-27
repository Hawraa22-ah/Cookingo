// src/components/dishes/DishForm.tsx
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
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      // Upload image
      if (image) {
        const fileExt = image.name.split('.').pop();
        const filePath = `dishes/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('public') // adjust this if your bucket is named differently
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('public').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const { error } = await supabase.from('dishes').insert({
        title,
        description,
        price,
        image_url: imageUrl,
        chef_id: user?.id,
        status: 'published',
      });

      if (error) throw error;

      toast.success('Dish created!');
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
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium">Price ($)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          required
        />
      </div>

      <div>
        <label className="block font-medium">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
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
