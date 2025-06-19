// import React, { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';

// interface Occasion {
//   id: number;
//   slug: string;
//   name: string;
//   image_url: string;
//   event_date: string;
//   options: string[];
// }

// // Static details for legacy occasions
// const OCCASION_DETAILS: Record<string, { title: string; dishes: string[] }> = {
//   birthday: {
//     title: '🎂 Birthdays',
//     dishes: [
//       'Birthday cakes (slices)',
//       'Assorted juices (fruit punch, mango, strawberry)',
//       'Jelly cups (mixed-fruit)',
//     ],
//   },
//   wedding: {
//     title: '💍 Weddings',
//     dishes: [
//       'Miniature candies and chocolates',
//       'Petit fours (bite-sized pastries)',
//     ],
//   },
//   ashura: {
//     title: '🌙 Ashura',
//     dishes: ['Mansaf rice', 'Harissa stew'],
//   },
// };

// export default function OccasionsPage() {
//   const { user } = useAuth();
//   const [occasions, setOccasions] = useState<Occasion[]>([]);
//   const [role, setRole] = useState<string>('');
//   const [form, setForm] = useState({
//     occasion: 'birthday',
//     foodType: '',
//     date: '',
//     quantity: 1,
//     location: '',
//   });

//   // 1) fetch current user role & 2) fetch DB occasions
//   useEffect(() => {
//     if (user) {
//       supabase
//         .from('profiles')
//         .select('role')
//         .eq('id', user.id)
//         .single()
//         .then(({ data }) => {
//           if (data?.role) setRole(data.role.toLowerCase());
//         });
//     }
//     supabase
//       .from('occasions')
//       .select('id, slug, name, image_url, event_date, options')
//       .then(({ data, error }) => {
//         if (!error && data) setOccasions(data);
//       });
//   }, [user]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm((f) => ({
//       ...f,
//       [name]: name === 'quantity' ? Number(value) : value,
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!user) return;
//     const { occasion, foodType, date, quantity, location } = form;
//     if (!foodType || !date || !location || quantity < 1) return;
//     const { error } = await supabase.from('custom_requests').insert([
//       {
//         user_id: user.id,
//         occasion,
//         food_type: foodType,
//         event_date: date,
//         quantity,
//         location,
//       },
//     ]);
//     if (error) {
//       alert('Failed to submit request');
//       console.error(error);
//     } else {
//       alert(
//         `Request submitted: ${quantity} x ${foodType} for ${occasion}`
//       );
//       setForm({ occasion, foodType: '', date: '', quantity: 1, location: '' });
//     }
//   };

//   const handleDeleteOccasion = async (id: number) => {
//     if (!confirm('Delete this occasion?')) return;
//     const { error } = await supabase
//       .from('occasions')
//       .delete()
//       .eq('id', id);
//     if (error) {
//       alert('Failed to delete occasion');
//       console.error(error);
//     } else {
//       setOccasions((o) => o.filter((x) => x.id !== id));
//     }
//   };

//   const handleEditOccasion = async (occ: Occasion) => {
//     const newName = prompt('New name', occ.name);
//     if (!newName) return;
//     const newOpts = prompt(
//       'New options (comma-separated)',
//       occ.options.join(', ')
//     );
//     if (newOpts == null) return;
//     const optionsArray = newOpts.split(',').map((s) => s.trim());
//     const { error } = await supabase
//       .from('occasions')
//       .update({ name: newName, options: optionsArray })
//       .eq('id', occ.id);
//     if (error) {
//       alert('Failed to update occasion');
//       console.error(error);
//     } else {
//       setOccasions((o) =>
//         o.map((x) =>
//           x.id === occ.id ? { ...x, name: newName, options: optionsArray } : x
//         )
//       );
//     }
//   };

//   return (
//     <div className="px-6 py-8 max-w-6xl mx-auto">
//       <h1 className="text-3xl font-bold mb-8">Occasions & Special Menus</h1>

//       <div className="flex flex-col md:flex-row md:space-x-12">
//         {/* Static legacy sections */}
//         <div className="md:w-1/2 space-y-12">
//           {Object.entries(OCCASION_DETAILS).map(([slug, info]) => (
//             <section key={slug} className="border rounded-lg p-6">
//               <h2 className="text-2xl font-semibold mb-4">{info.title}</h2>
//               <ul className="list-disc list-inside ml-4 space-y-2">
//                 {info.dishes.map((dish) => (
//                   <li key={dish}>{dish}</li>
//                 ))}
//               </ul>
//             </section>
//           ))}

//           {/* Dynamically‐added occasions */}
//           {occasions
//             .filter((o) => !(o.slug in OCCASION_DETAILS))
//             .map((o) => (
//               <section key={o.id} className="border rounded-lg p-6">
//                 <h2 className="text-2xl font-semibold mb-4">{o.name}</h2>
//                 <ul className="list-disc list-inside ml-4 space-y-2">
//                   {o.options.map((opt) => (
//                     <li key={opt}>{opt}</li>
//                   ))}
//                 </ul>
//                 {/* Admin controls */}
//                 {role === 'admin' && (
//                   <div className="mt-4 space-x-2">
//                     <button
//                       onClick={() => handleEditOccasion(o)}
//                       className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteOccasion(o.id)}
//                       className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 )}
//               </section>
//             ))}
//         </div>

//         {/* Custom Request Form */}
//         <div className="md:w-1/2 mt-12 md:mt-0">
//           <section className="border rounded-lg p-6 bg-gray-50">
//             <h2 className="text-2xl font-semibold mb-6">
//               Place a Custom Request
//             </h2>
//             <div className="grid grid-cols-1 gap-6">
//               <label className="flex flex-col">
//                 Occasion
//                 <select
//                   name="occasion"
//                   value={form.occasion}
//                   onChange={handleChange}
//                   className="mt-2 border rounded px-3 py-2"
//                 >
//                   {occasions.map((o) => (
//                     <option key={o.slug} value={o.slug}>
//                       {OCCASION_DETAILS[o.slug]?.title || o.name}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label className="flex flex-col">
//                 Type of Food
//                 <select
//                   name="foodType"
//                   value={form.foodType}
//                   onChange={handleChange}
//                   className="mt-2 border rounded px-3 py-2"
//                 >
//                   <option value="">Select food</option>
//                   {(
//                     OCCASION_DETAILS[form.occasion]?.dishes ||
//                     occasions.find((x) => x.slug === form.occasion)
//                       ?.options ||
//                     []
//                   ).map((dish) => (
//                     <option key={dish} value={dish}>
//                       {dish}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label className="flex flex-col">
//                 Day
//                 <input
//                   type="date"
//                   name="date"
//                   value={form.date}
//                   onChange={handleChange}
//                   className="mt-2 border rounded px-3 py-2"
//                 />
//               </label>

//               <label className="flex flex-col">
//                 Quantity
//                 <input
//                   type="number"
//                   name="quantity"
//                   min={1}
//                   value={form.quantity}
//                   onChange={handleChange}
//                   className="mt-2 border rounded px-3 py-2"
//                 />
//               </label>

//               <label className="flex flex-col">
//                 Location
//                 <input
//                   type="text"
//                   name="location"
//                   value={form.location}
//                   onChange={handleChange}
//                   placeholder="Event address"
//                   className="mt-2 border rounded px-3 py-2"
//                 />
//               </label>

//               <button
//                 onClick={handleSubmit}
//                 className="mt-6 w-full px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Submit Request
//               </button>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Occasion {
  id: number;
  slug: string;
  name: string;
  image_url: string;
  event_date: string;
  options: string[];
}

// Static details for legacy occasions
const OCCASION_DETAILS: Record<string, { title: string; dishes: string[] }> = {
  birthday: {
    title: '🎂 Birthdays',
    dishes: [
      'Birthday cakes (slices)',
      'Assorted juices (fruit punch, mango, strawberry)',
      'Jelly cups (mixed-fruit)',
    ],
  },
  wedding: {
    title: '💍 Weddings',
    dishes: [
      'Miniature candies and chocolates',
      'Petit fours (bite-sized pastries)',
    ],
  },
  ashura: {
    title: '🌙 Ashura',
    dishes: ['Mansaf rice', 'Harissa stew'],
  },
};

export default function OccasionsPage() {
  const { user } = useAuth();
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [role, setRole] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    occasion: 'birthday',
    foodType: '',
    date: '',
    quantity: 1,
    location: '',
  });

  // 1) fetch current user role & 2) fetch DB occasions
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.role) setRole(data.role.toLowerCase());
        });
    }
    supabase
      .from('occasions')
      .select('id, slug, name, image_url, event_date, options')
      .then(({ data, error }) => {
        if (!error && data) setOccasions(data);
      });
  }, [user]);

  // 2) get GPS coords when user clicks "Use current location"
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setForm(f => ({
          ...f,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Unable to retrieve your location.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    const { occasion, foodType, date, quantity, location } = form;
    if (!foodType || !date || !location || quantity < 1) {
      alert('Please fill out all fields.');
      return;
    }
    const { error } = await supabase.from('custom_requests').insert([{
      user_id:    user.id,
      occasion,
      food_type:  foodType,
      event_date: date,
      quantity,
      location,   // either manual or GPS coords
    }]);
    if (error) {
      console.error(error);
      alert('Failed to submit request');
    } else {
      alert(`Request submitted: ${quantity} x ${foodType} for ${occasion}`);
      setForm({ occasion, foodType: '', date: '', quantity: 1, location: '' });
      setCoords(null);
    }
  };

  const handleDeleteOccasion = async (id: number) => {
    if (!confirm('Delete this occasion?')) return;
    const { error } = await supabase
      .from('occasions')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(error);
      alert('Failed to delete occasion');
    } else {
      setOccasions(o => o.filter(x => x.id !== id));
    }
  };

  const handleEditOccasion = async (occ: Occasion) => {
    const newName = prompt('New name', occ.name);
    if (!newName) return;
    const newOpts = prompt('New options (comma-separated)', occ.options.join(', '));
    if (newOpts == null) return;
    const optionsArray = newOpts.split(',').map(s => s.trim());
    const { error } = await supabase
      .from('occasions')
      .update({ name: newName, options: optionsArray })
      .eq('id', occ.id);
    if (error) {
      console.error(error);
      alert('Failed to update occasion');
    } else {
      setOccasions(o =>
        o.map(x =>
          x.id === occ.id ? { ...x, name: newName, options: optionsArray } : x
        )
      );
    }
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Occasions & Special Menus</h1>

      <div className="flex flex-col md:flex-row md:space-x-12">
        {/* Static legacy sections */}
        <div className="md:w-1/2 space-y-12">
          {Object.entries(OCCASION_DETAILS).map(([slug, info]) => (
            <section key={slug} className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">{info.title}</h2>
              <ul className="list-disc list-inside ml-4 space-y-2">
                {info.dishes.map(dish => (
                  <li key={dish}>{dish}</li>
                ))}
              </ul>
            </section>
          ))}

          {/* Dynamically‐added occasions */}
          {occasions
            .filter(o => !(o.slug in OCCASION_DETAILS))
            .map(o => (
              <section key={o.id} className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">{o.name}</h2>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  {o.options.map(opt => (
                    <li key={opt}>{opt}</li>
                  ))}
                </ul>
                {role === 'admin' && (
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => handleEditOccasion(o)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOccasion(o.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </section>
            ))}
        </div>

        {/* Custom Request Form */}
        <div className="md:w-1/2 mt-12 md:mt-0">
          <section className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-6">Place a Custom Request</h2>
            <div className="grid grid-cols-1 gap-6">
              <label className="flex flex-col">
                Occasion
                <select
                  name="occasion"
                  value={form.occasion}
                  onChange={handleChange}
                  className="mt-2 border rounded px-3 py-2"
                >
                  {occasions.map(o => (
                    <option key={o.slug} value={o.slug}>
                      {OCCASION_DETAILS[o.slug]?.title || o.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                Type of Food
                <select
                  name="foodType"
                  value={form.foodType}
                  onChange={handleChange}
                  className="mt-2 border rounded px-3 py-2"
                >
                  <option value="">Select food</option>
                  {(
                    OCCASION_DETAILS[form.occasion]?.dishes ||
                    occasions.find(x => x.slug === form.occasion)?.options ||
                    []
                  ).map(dish => (
                    <option key={dish} value={dish}>
                      {dish}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                Day
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="mt-2 border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                Quantity
                <input
                  type="number"
                  name="quantity"
                  min={1}
                  value={form.quantity}
                  onChange={handleChange}
                  className="mt-2 border rounded px-3 py-2"
                />
              </label>

              <label className="flex flex-col">
                Location
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter address or use GPS"
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <button
                    onClick={useCurrentLocation}
                    type="button"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Use GPS
                  </button>
                </div>
                {coords && (
                  <p className="mt-1 text-sm text-gray-600">
                    Current: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
              </label>

              <button
                onClick={handleSubmit}
                className="mt-6 w-full px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
