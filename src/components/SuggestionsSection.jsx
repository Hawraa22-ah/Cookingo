
// import React, { useState, useEffect } from 'react';
// import { supabase } from "../utils/supabaseclient";
// import { useAuth } from "../contexts/AuthContext";

// function SuggestionsSection() {
//   const [suggestions, setSuggestions] = useState([]);
//   const [newSuggestion, setNewSuggestion] = useState('');
//   const { user } = useAuth();

//   // Fetch suggestions from Supabase
//   const fetchSuggestions = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('suggestions')
//         .select('*')
//         .order('id', { ascending: false }); // newest first
//       if (error) throw error;
//       setSuggestions(data || []);
//     } catch (err) {
//       console.error('Failed to load suggestions', err);
//     }
//   };

//   useEffect(() => {
//     fetchSuggestions();
//     // eslint-disable-next-line
//   }, []);

//   // Get only the username part before '@' for saving
//   const getUsername = () => {
//     // Check for full_name or name first
//     if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
//     if (user?.user_metadata?.name) return user.user_metadata.name;
//     // If not found, extract username part from email
//     if (user?.email) {
//       return user.email.split('@')[0];
//     }
//     return "Anonymous";
//   };

//   // Submit a new suggestion to Supabase
//   const handleAdd = async () => {
//     const text = newSuggestion.trim();
//     if (!text) return;
//     try {
//       const { error } = await supabase.from('suggestions').insert([
//         {
//           title: text,
//           user_id: user?.id || null,
//           username: getUsername(),  // Will store just the username part
//         },
//       ]);
//       if (error) throw error;
//       setNewSuggestion('');
//       await fetchSuggestions();
//     } catch (err) {
//       console.error('handleAdd error:', err);
//       alert(`Could not submit suggestion: ${err.message}`);
//     }
//   };

//   return (
//     <div className="p-4 border rounded bg-white">
//       <h2 className="text-xl font-semibold mb-4">Suggest a New Meeting Topic</h2>

//       <div className="mb-6">
//         <textarea
//           className="w-full border rounded p-2"
//           rows={3}
//           placeholder="What topic would you like for the next meeting?"
//           value={newSuggestion}
//           onChange={e => setNewSuggestion(e.target.value)}
//         />
//         <button
//           className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           onClick={handleAdd}
//         >
//           Submit Suggestion
//         </button>
//       </div>

//       <ul className="space-y-3">
//         {suggestions.length > 0 ? (
//           suggestions.map(s => (
//             <li key={s.id} className="p-3 border rounded hover:shadow">
//               <p className="font-medium">{s.title}</p>
//               <p className="text-sm text-gray-500 mt-1">
//                 Suggested by {s.username || "Anonymous"}
//               </p>
//             </li>
//           ))
//         ) : (
//           <li className="text-gray-500">No suggestions yet. Be the first!</li>
//         )}
//       </ul>
//     </div>
//   );
// }

// export default SuggestionsSection;
import React, { useState, useEffect } from 'react';
import { supabase } from "../utils/supabaseclient";
import { useAuth } from "../contexts/AuthContext";

function SuggestionsSection() {
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const { user, role } = useAuth();  // <-- get role

  // Fetch suggestions from Supabase
  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('id', { ascending: false }); // newest first
      if (error) throw error;
      setSuggestions(data || []);
    } catch (err) {
      console.error('Failed to load suggestions', err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line
  }, []);

  // Get only the username part before '@' for saving
  const getUsername = () => {
    // Check for full_name or name first
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    // If not found, extract username part from email
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Anonymous";
  };

  // Submit a new suggestion to Supabase
  const handleAdd = async () => {
    const text = newSuggestion.trim();
    if (!text) return;
    try {
      const { error } = await supabase.from('suggestions').insert([
        {
          title: text,
          user_id: user?.id || null,
          username: getUsername(),  // Will store just the username part
        },
      ]);
      if (error) throw error;
      setNewSuggestion('');
      await fetchSuggestions();
    } catch (err) {
      console.error('handleAdd error:', err);
      alert(`Could not submit suggestion: ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-xl font-semibold mb-4">Suggest a New Meeting Topic</h2>

      {(!user || role === "guest") ? (
        <div className="mb-6 text-red-600">
          Please sign in to submit a suggestion.
        </div>
      ) : (
        <div className="mb-6">
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            placeholder="What topic would you like for the next meeting?"
            value={newSuggestion}
            onChange={e => setNewSuggestion(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAdd}
          >
            Submit Suggestion
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map(s => (
            <li key={s.id} className="p-3 border rounded hover:shadow">
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                Suggested by {s.username || "Anonymous"}
              </p>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No suggestions yet. Be the first!</li>
        )}
      </ul>
    </div>
  );
}

export default SuggestionsSection;
