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
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      let imagePath = '';

      // Upload image to Supabase Storage
      if (image) {
        const ext = image.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        imagePath = `dishes/${fileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from('dish-images')
          .upload(imagePath, image);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase
          .storage
          .from('dish-images')
          .getPublicUrl(imagePath);

        imageUrl = publicData.publicUrl;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const { error: insertError } = await supabase
        .from('dishes')
        .insert({
          title,
          description,
          price,
          image_url: imageUrl,
          image_path: imagePath,
          chef_id: user?.id,
          status: 'published',
        });

      if (insertError) throw insertError;

      toast.success('Dish created!');
      onSubmit();
    } catch (err: any) {
      console.error('Error creating dish:', err);
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
          onChange={handleFileChange}
        />
        {imagePreviewUrl && (
          <img
            src={imagePreviewUrl}
            alt="Preview"
            className="mt-3 h-40 w-auto rounded shadow"
          />
        )}
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
