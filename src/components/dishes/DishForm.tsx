import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface DishFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const DishForm: React.FC<DishFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [servings, setServings] = useState('');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('You must be logged in to add a dish.');
      return;
    }

    const { error } = await supabase.from('dishes').insert([
      {
        name,
        description,
        price: parseFloat(price),
        servings: servings ? parseInt(servings) : null,
        time: time ? parseInt(time) : null,
        difficulty: difficulty || null,
        image_url: imageUrl,
        chef_id: user.id,
        created_at: new Date().toISOString(),
        status: 'published'
      }
    ]);

    if (error) {
      console.error('Insert Error:', error);
      toast.error('Could not add dish.');
    } else {
      toast.success('Dish added!');
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Dish Name"
        className="w-full p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        className="w-full p-2 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Price"
        className="w-full p-2 border rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Servings"
        className="w-full p-2 border rounded"
        value={servings}
        onChange={(e) => setServings(e.target.value)}
      />

      <input
        type="number"
        placeholder="Time (minutes)"
        className="w-full p-2 border rounded"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <input
        type="text"
        placeholder="Difficulty (Easy, Medium, Hard)"
        className="w-full p-2 border rounded"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      />

      <label className="block text-sm font-medium text-gray-700">Image URL</label>
      <input
        type="text"
        placeholder="Paste image URL"
        className="w-full p-2 border rounded"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-48 object-cover rounded"
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Add Dish
        </button>
      </div>
    </form>
  );
};

export default DishForm;
