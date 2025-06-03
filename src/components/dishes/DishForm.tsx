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
  const [price, setPrice] = useState('');
  const [servings, setServings] = useState('');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [imagePath, setImagePath] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const user = await supabase.auth.getUser();
    const chef_id = user.data?.user?.id;

    const { error } = await supabase.from('dishes').insert([
      {
        title,
        description,
        price: parseFloat(price),
        servings: servings ? parseInt(servings) : null,
        time: time ? parseInt(time) : null,
        difficulty: difficulty || null,
        image_path: imagePath, // You paste the URL here
        chef_id,
        status: 'published',
      }
    ]);

    if (error) {
      console.error('Failed to add dish:', error);
      toast.error('Could not add dish.');
    } else {
      toast.success('Dish added!');
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        placeholder="Dish Title"
        className="w-full mb-3 p-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Dish Description"
        className="w-full mb-3 p-2 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        className="w-full mb-3 p-2 border rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Servings (optional)"
        className="w-full mb-3 p-2 border rounded"
        value={servings}
        onChange={(e) => setServings(e.target.value)}
      />
      <input
        type="number"
        placeholder="Time (minutes)"
        className="w-full mb-3 p-2 border rounded"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <input
        type="text"
        placeholder="Difficulty (e.g., Easy, Medium, Hard)"
        className="w-full mb-3 p-2 border rounded"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
      <input
        type="text"
        placeholder="Paste public image URL from Supabase"
        className="w-full mb-4 p-2 border rounded"
        value={imagePath}
        onChange={(e) => setImagePath(e.target.value)}
      />

      {imagePath && (
        <img
          src={imagePath}
          alt="Preview"
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}

      <div className="flex gap-2 justify-end">
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
