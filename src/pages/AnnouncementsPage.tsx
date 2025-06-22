// import React, { useEffect, useState } from 'react';
// import {
//   Bell as BellIcon,
//   Edit2 as EditIcon,
//   Trash2 as DeleteIcon,
//   Check as SaveIcon,
//   X as CancelIcon
// } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';

// interface Announcement {
//   id: string;
//   title: string;
//   message: string;
//   link?: string | null;
//   created_at: string;
//   target_audience?: string | null;
// }

// interface Profile {
//   id: string;
//   username: string;
//   role: 'admin' | 'chef' | 'seller' | 'user';
// }

// const AnnouncementsPage: React.FC = () => {
//   const { user } = useAuth();
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
//   const [loading, setLoading] = useState(true);

//   // --- Edit form state ---
//   const [editingId, setEditingId]     = useState<string | null>(null);
//   const [editTitle, setEditTitle]     = useState('');
//   const [editMessage, setEditMessage] = useState('');
//   const [editLink, setEditLink]       = useState('');
//   const [savingEdit, setSavingEdit]   = useState(false);

//   // 1) Load the current user's profile row so we know their role
//   useEffect(() => {
//     if (!user) return;
//     supabase
//       .from<Profile>('profiles')
//       .select('id, username, role')
//       .eq('id', user.id)
//       .single()
//       .then(({ data, error }) => {
//         if (error) console.error('Profile load error:', error.message);
//         else setProfile(data);
//       });
//   }, [user]);

//   // 2) Fetch only announcements for the user's role (or all)
//   useEffect(() => {
//     if (!user || !profile?.role) return;
//     setLoading(true);
//     supabase
//       .from<Announcement>('announcements')
//       .select('*')
//       .in('target_audience', ['all', profile.role])
//       .order('created_at', { ascending: false })
//       .then(({ data, error }) => {
//         if (error) console.error('Fetch error:', error.message);
//         else if (data) setAnnouncements(data);
//       })
//       .finally(() => setLoading(false));
//   }, [user, profile?.role]);

//   // 3) Subscribe to real-time changes (only for relevant announcements)
//   useEffect(() => {
//     if (!user || !profile?.role) return;
//     const rolesToSee = ['all', profile.role];
//     const chan = supabase
//       .channel('announcements_changes')
//       .on(
//         'postgres_changes',
//         { schema: 'public', table: 'announcements', event: '*' },
//         payload => {
//           const a = payload.new as Announcement;
//           // Only apply if this user's role should see this
//           if (rolesToSee.includes(a.target_audience ?? 'all')) {
//             setAnnouncements(prev =>
//               payload.eventType === 'DELETE'
//                 ? prev.filter(x => x.id !== a.id)
//                 : [a, ...prev.filter(x => x.id !== a.id)]
//             );
//           } else {
//             // If deleted or updated to a different audience, remove from list
//             setAnnouncements(prev =>
//               prev.filter(x => x.id !== a.id)
//             );
//           }
//         }
//       )
//       .subscribe();
//     return () => supabase.removeChannel(chan);
//   }, [user, profile?.role]);

//   // --- Handlers for edit/delete ---
//   const startEdit = (a: Announcement) => {
//     setEditingId(a.id);
//     setEditTitle(a.title);
//     setEditMessage(a.message);
//     setEditLink(a.link || '');
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//   };

//   const saveEdit = async () => {
//     if (!editingId) return;
//     setSavingEdit(true);
//     const { error } = await supabase
//       .from('announcements')
//       .update({ title: editTitle, message: editMessage, link: editLink || null })
//       .eq('id', editingId);
//     setSavingEdit(false);
//     if (error) return alert('Failed to save changes.');
//     setEditingId(null);
//   };

//   const deleteAnn = async (id: string) => {
//     if (!window.confirm('Delete this announcement?')) return;
//     const { error } = await supabase
//       .from('announcements')
//       .delete()
//       .eq('id', id);
//     if (error) alert('Failed to delete.');
//   };

//   // --- Render ---
//   if (loading) {
//     return <div className="text-center py-16">Loading announcements…</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
//         <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
//           <BellIcon className="w-6 h-6 text-orange-500 mr-2" /> Announcements
//         </h1>

//         {announcements.length ? (
//           announcements.map(a => (
//             <div key={a.id} className="border-t border-gray-200 pt-4 space-y-2">

//               {editingId === a.id ? (
//                 // --- Edit Mode ---
//                 <>
//                   <input
//                     type="text"
//                     value={editTitle}
//                     onChange={e => setEditTitle(e.target.value)}
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                   <textarea
//                     value={editMessage}
//                     onChange={e => setEditMessage(e.target.value)}
//                     className="w-full border px-3 py-2 rounded"
//                     rows={3}
//                   />
//                   <input
//                     type="url"
//                     value={editLink}
//                     onChange={e => setEditLink(e.target.value)}
//                     className="w-full border px-3 py-2 rounded"
//                     placeholder="Link (optional)"
//                   />
//                   <div className="flex gap-2">
//                     <button
//                       onClick={saveEdit}
//                       disabled={savingEdit}
//                       className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
//                     >
//                       <SaveIcon className="w-4 h-4" /> Save
//                     </button>
//                     <button
//                       onClick={cancelEdit}
//                       className="inline-flex items-center gap-1 bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
//                     >
//                       <CancelIcon className="w-4 h-4" /> Cancel
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 // --- Read Mode ---
//                 <>
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h2 className="text-lg font-medium text-gray-800">{a.title}</h2>
//                       <p className="text-gray-600 mt-1">{a.message}</p>
//                       {a.link && (
//                         <a
//                           href={a.link}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-orange-500 hover:underline text-sm font-medium mt-1 block"
//                         >
//                           View
//                         </a>
//                       )}
//                     </div>
//                     {/* show only to admins */}
//                     {profile?.role === 'admin' && (
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => startEdit(a)}
//                           className="text-blue-500 hover:text-blue-700"
//                           title="Edit"
//                         >
//                           <EditIcon className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => deleteAnn(a.id)}
//                           className="text-red-500 hover:text-red-700"
//                           title="Delete"
//                         >
//                           <DeleteIcon className="w-5 h-5" />
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                   <p className="text-gray-400 text-sm">
//                     {new Date(a.created_at).toLocaleString()}
//                   </p>
//                 </>
//               )}

//             </div>
//           ))
//         ) : (
//           <p className="text-gray-600">No announcements at this time.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AnnouncementsPage;
import React, { useEffect, useState } from 'react';
import {
  Bell as BellIcon,
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  Check as SaveIcon,
  X as CancelIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  created_at: string;
  target_audience?: string | null;
}

interface Profile {
  id: string;
  username: string;
  role: 'admin' | 'chef' | 'seller' | 'user';
}

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Edit form state ---
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editTitle, setEditTitle]     = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editLink, setEditLink]       = useState('');
  const [savingEdit, setSavingEdit]   = useState(false);

  // 1) Load the current user's profile row so we know their role
  useEffect(() => {
    if (!user) return;
    supabase
      .from<Profile>('profiles')
      .select('id, username, role')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Profile load error:', error.message);
        else setProfile(data);
      });
  }, [user]);

  // 2) Fetch announcements based on role
  useEffect(() => {
    if (!user || !profile?.role) return;
    setLoading(true);
    const fetch = profile.role === 'admin'
      ? supabase
          .from<Announcement>('announcements')
          .select('*')
          .order('created_at', { ascending: false })
      : supabase
          .from<Announcement>('announcements')
          .select('*')
          .in('target_audience', ['all', profile.role])
          .order('created_at', { ascending: false });

    fetch.then(({ data, error }) => {
      if (error) console.error('Fetch error:', error.message);
      else if (data) setAnnouncements(data);
    }).finally(() => setLoading(false));
  }, [user, profile?.role]);

  // 3) Subscribe to real-time changes (admin sees all, others filtered)
  useEffect(() => {
    if (!user || !profile?.role) return;
    const rolesToSee = profile.role === 'admin'
      ? null
      : ['all', profile.role];

    const chan = supabase
      .channel('announcements_changes')
      .on(
        'postgres_changes',
        { schema: 'public', table: 'announcements', event: '*' },
        payload => {
          const a = payload.new as Announcement;
          if (
            profile.role === 'admin' ||
            rolesToSee?.includes(a.target_audience ?? 'all')
          ) {
            setAnnouncements(prev =>
              payload.eventType === 'DELETE'
                ? prev.filter(x => x.id !== a.id)
                : [a, ...prev.filter(x => x.id !== a.id)]
            );
          } else {
            setAnnouncements(prev =>
              prev.filter(x => x.id !== a.id)
            );
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(chan);
  }, [user, profile?.role]);

  // --- Handlers for edit/delete ---
  const startEdit = (a: Announcement) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditMessage(a.message);
    setEditLink(a.link || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    const { error } = await supabase
      .from('announcements')
      .update({ title: editTitle, message: editMessage, link: editLink || null })
      .eq('id', editingId);
    setSavingEdit(false);
    if (error) return alert('Failed to save changes.');
    setEditingId(null);
  };

  // const deleteAnn = async (id: string) => {
  //   if (!window.confirm('Delete this announcement?')) return;
  //   const { error } = await supabase
  //     .from('announcements')
  //     .delete()
  //     .eq('id', id);
  //   if (error) alert('Failed to delete.');
  // };
const deleteAnn = async (id: string) => {
  if (!window.confirm('Delete this announcement?')) return;
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
  if (error) {
    alert('Failed to delete.');
  } else {
    // Remove from state so UI updates instantly
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }
};

  // --- Render ---
  if (loading) {
    return <div className="text-center py-16">Loading announcements…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          <BellIcon className="w-6 h-6 text-orange-500 mr-2" /> Announcements
        </h1>

        {announcements.length ? (
          announcements.map(a => (
            <div key={a.id} className="border-t border-gray-200 pt-4 space-y-2">

              {editingId === a.id ? (
                // --- Edit Mode ---
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                  <textarea
                    value={editMessage}
                    onChange={e => setEditMessage(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    rows={3}
                  />
                  <input
                    type="url"
                    value={editLink}
                    onChange={e => setEditLink(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Link (optional)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={savingEdit}
                      className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      <SaveIcon className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      <CancelIcon className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                // --- Read Mode ---
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">{a.title}</h2>
                      <p className="text-gray-600 mt-1">{a.message}</p>
                      {a.link && (
                        <a
                          href={a.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:underline text-sm font-medium mt-1 block"
                        >
                          View
                        </a>
                      )}
                    </div>
                    {/* show only to admins */}
                    {profile?.role === 'admin' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(a)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteAnn(a.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </>
              )}

            </div>
          ))
        ) : (
          <p className="text-gray-600">No announcements at this time.</p>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
