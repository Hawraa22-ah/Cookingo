// // import React, { useState } from 'react';
// // import { supabase } from '../../lib/supabase';
// // import toast from 'react-hot-toast';

// // interface DishFormProps {
// //   onSubmit: () => void;
// //   onCancel: () => void;
// // }

// // const DishForm: React.FC<DishFormProps> = ({ onSubmit, onCancel }) => {
// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [price, setPrice] = useState<number>(0);
// //   const [imageFile, setImageFile] = useState<File | null>(null);
// //   const [servings, setServings] = useState<number>(1);
// //   const [time, setTime] = useState<number>(30);
// //   const [difficulty, setDifficulty] = useState('Medium');
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       const userRes = await supabase.auth.getUser();
// //       const user = userRes.data.user;
// //       const chefId = user?.id;

// //       // ✅ Get chef name from metadata or fallback to 'profiles'
// //       let chefName = user?.user_metadata?.full_name || '';

// //       if (!chefName && chefId) {
// //         const { data: profileData, error: profileError } = await supabase
// //           .from('profiles')
// //           .select('full_name')
// //           .eq('id', chefId)
// //           .single();

// //         if (profileError) {
// //           console.warn('Profile fallback failed:', profileError.message);
// //         }

// //         chefName = profileData?.full_name || 'Unknown Chef';
// //       }

// //       // ✅ Upload image to Supabase Storage if provided
// //       let imagePath = '';
// //       if (imageFile) {
// //         const fileExt = imageFile.name.split('.').pop();
// //         const fileName = `public/${Date.now()}-${imageFile.name}`;
// //         const { data, error: uploadError } = await supabase.storage
// //           .from('dish-images')
// //           .upload(fileName, imageFile);

// //         if (uploadError) throw uploadError;
// //         imagePath = data.path;
// //       }

// //       // ✅ Insert new dish
// //       const { error } = await supabase.from('dishes').insert({
// //         chef_id: chefId,
// //         chef_name: chefName,
// //         title,
// //         description,
// //         price,
// //         servings,
// //         time,
// //         difficulty,
// //         image_path: imagePath,
// //         status: 'published',
// //       });

// //       if (error) throw error;

// //       toast.success('Dish created successfully');
// //       onSubmit();
// //     } catch (err: any) {
// //       console.error(err);
// //       toast.error(err.message || 'Failed to create dish');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-4">
// //       <div>
// //         <label className="block font-medium">Title</label>
// //         <input
// //           type="text"
// //           value={title}
// //           onChange={(e) => setTitle(e.target.value)}
// //           required
// //           className="w-full border rounded px-3 py-2"
// //         />
// //       </div>

// //       <div>
// //         <label className="block font-medium">Description</label>
// //         <textarea
// //           value={description}
// //           onChange={(e) => setDescription(e.target.value)}
// //           required
// //           className="w-full border rounded px-3 py-2"
// //         />
// //       </div>

// //       <div>
// //         <label className="block font-medium">Price ($)</label>
// //         <input
// //           type="number"
// //           value={price}
// //           onChange={(e) => setPrice(parseFloat(e.target.value))}
// //           required
// //           className="w-full border rounded px-3 py-2"
// //         />
// //       </div>

// //       <div>
// //         <label className="block font-medium">Servings</label>
// //         <input
// //           type="number"
// //           value={servings}
// //           onChange={(e) => setServings(Number(e.target.value))}
// //           required
// //           className="w-full border rounded px-3 py-2"
// //         />
// //       </div>

// //       <div>
// //         <label className="block font-medium">Time (minutes)</label>
// //         <input
// //           type="number"
// //           value={time}
// //           onChange={(e) => setTime(Number(e.target.value))}
// //           required
// //           className="w-full border rounded px-3 py-2"
// //         />
// //       </div>

// //       <div>
// //         <label className="block font-medium">Difficulty</label>
// //         <select
// //           value={difficulty}
// //           onChange={(e) => setDifficulty(e.target.value)}
// //           className="w-full border rounded px-3 py-2"
// //         >
// //           <option value="Easy">Easy</option>
// //           <option value="Medium">Medium</option>
// //           <option value="Hard">Hard</option>
// //         </select>
// //       </div>

// //       <div>
// //         <label className="block font-medium">Image</label>
// //         <input
// //           type="file"
// //           accept="image/*"
// //           onChange={(e) => setImageFile(e.target.files?.[0] || null)}
// //           className="w-full border rounded px-3 py-2"
// //         />
// //       </div>

// //       <div className="flex justify-end space-x-4">
// //         <button type="button" onClick={onCancel} className="text-gray-500">
// //           Cancel
// //         </button>
// //         <button
// //           type="submit"
// //           disabled={loading}
// //           className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
// //         >
// //           {loading ? 'Saving...' : 'Create Dish'}
// //         </button>
// //       </div>
// //     </form>
// //   );
// // };

// // export default DishForm;


// import React, { useState } from 'react';
// import { supabase } from '../../lib/supabase';
// import toast from 'react-hot-toast';

// interface DishFormProps {
//   onSubmit: () => void;
//   onCancel: () => void;
// }

// const DishForm: React.FC<DishFormProps> = ({ onSubmit, onCancel }) => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [price, setPrice] = useState('');
//   const [servings, setServings] = useState('');
//   const [time, setTime] = useState('');
//   const [difficulty, setDifficulty] = useState('');
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!title || !description || !price) {
//       toast.error('Please fill in all required fields.');
//       return;
//     }

//     let imagePath = '';

//     if (imageFile) {
//       try {
//         setUploading(true);
//         const ext = imageFile.name.split('.').pop();
//         const fileName = `${Date.now()}.${ext}`;
//         const { data, error } = await supabase.storage
//           .from('dish-images')
//           .upload(fileName, imageFile);

//         if (error) throw error;

//         imagePath = data?.path || '';
//       } catch (err: any) {
//         console.error('Image upload failed:', err.message);
//         toast.error('Image upload failed.');
//         return;
//       } finally {
//         setUploading(false);
//       }
//     }

//     const user = await supabase.auth.getUser();
//     const chef_id = user.data?.user?.id;

//     const { error } = await supabase.from('dishes').insert([
//       {
//         title,
//         description,
//         price: parseFloat(price),
//         servings: servings ? parseInt(servings) : null,
//         time: time ? parseInt(time) : null,
//         difficulty: difficulty || null,
//         image_path: imagePath,
//         chef_id,
//         status: 'published', // default status
//       }
//     ]);

//     if (error) {
//       console.error('Failed to add dish:', error);
//       toast.error('Could not add dish.');
//     } else {
//       toast.success('Dish added!');
//       onSubmit();
//     }
//   };

//   return (
//     <form onSubmit={handleFormSubmit}>
//       <input
//         type="text"
//         placeholder="Dish Title"
//         className="w-full mb-3 p-2 border rounded"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         required
//       />
//       <textarea
//         placeholder="Dish Description"
//         className="w-full mb-3 p-2 border rounded"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         required
//       />
//       <input
//         type="number"
//         placeholder="Price"
//         className="w-full mb-3 p-2 border rounded"
//         value={price}
//         onChange={(e) => setPrice(e.target.value)}
//         required
//       />
//       <input
//         type="number"
//         placeholder="Servings (optional)"
//         className="w-full mb-3 p-2 border rounded"
//         value={servings}
//         onChange={(e) => setServings(e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Time (minutes)"
//         className="w-full mb-3 p-2 border rounded"
//         value={time}
//         onChange={(e) => setTime(e.target.value)}
//       />
//       <input
//         type="text"
//         placeholder="Difficulty (e.g., Easy, Medium, Hard)"
//         className="w-full mb-3 p-2 border rounded"
//         value={difficulty}
//         onChange={(e) => setDifficulty(e.target.value)}
//       />

//       <input
//         type="file"
//         accept="image/*"
//         className="mb-4"
//         onChange={(e) => setImageFile(e.target.files?.[0] || null)}
//       />

//       {imageFile && (
//         <img
//           src={URL.createObjectURL(imageFile)}
//           alt="Preview"
//           className="w-full h-48 object-cover rounded mb-4"
//         />
//       )}

//       <div className="flex gap-2 justify-end">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="bg-gray-400 text-white px-4 py-2 rounded"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
//           disabled={uploading}
//         >
//           {uploading ? 'Uploading...' : 'Add Dish'}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default DishForm;
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
