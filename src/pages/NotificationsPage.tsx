// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Bell as BellIcon } from 'lucide-react'

// import { useAuth } from '../contexts/AuthContext'
// import { supabase } from '../lib/supabase'

// interface Notification {
//   id: string
//   message: string
//   is_read: boolean
//   created_at: string
//   order_id: string
//   seller_id: string
//   product_id: string | null
//   qty: number
//   type: string
// }

// const NotificationsPage: React.FC = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate()

//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [loading, setLoading] = useState(true)

//   const fetchNotifications = async () => {
//     setLoading(true)
//     const { data, error } = await supabase
//       .from<Notification>('notifications')
//       .select('*')
//       .eq('seller_id', user!.id)
//       .order('created_at', { ascending: false })

//     if (error) {
//       console.error('Error fetching notifications:', error)
//     } else {
//       setNotifications(data || [])
//     }

//     setLoading(false)
//   }

//   useEffect(() => {
//     if (!user) {
//       navigate('/login')
//       return
//     }

//     // 1) Initial load
//     fetchNotifications()

//     // 2) Subscribe to realtime INSERTs
//     const channel = supabase
//       .channel('notifications_realtime')
//       .on(
//         'postgres_changes',
//         {
//           schema: 'public',
//           table: 'notifications',
//           event: 'INSERT',
//           filter: `seller_id=eq.${user.id}`,
//         },
//         ({ new: n }) => {
//           setNotifications(prev => [n as Notification, ...prev])
//         }
//       )
//       .subscribe()

//     // 3) Cleanup on unmount
//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [user, navigate])

//   if (loading) {
//     return <div className="py-16 text-center">Loading notifications…</div>
//   }

//   return (
//     <div className="container mx-auto px-7 py-8 max-w-3xl">
//       <h1 className="text-2xl font-bold mb-6 flex items-center">
//         <BellIcon className="w-6 h-6 mr-2 text-orange-500" />
//         Notifications
//       </h1>

//       {notifications.length > 0 ? (
//         <ul>
//           {notifications.map(n => (
//             <li
//               key={n.id}
//               className="border-b last:border-none py-4 flex justify-between items-center"
//             >
//               <div>
//                 <div className="font-medium">{n.message}</div>
//                 <div className="text-sm text-gray-500 mt-1">
//                   Order ID: <span className="font-mono">{n.order_id}</span><br />
//                   Qty: {n.qty}
//                 </div>
//               </div>
//               <button
//                 onClick={() => navigate(`/seller/orders/${n.order_id}`)}
//                 className="text-orange-500 hover:underline text-sm"
//               >
//                 View Order
//               </button>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-gray-600">You have no notifications.</p>
//       )}
//     </div>
//   )
// }

// export default NotificationsPage
import React, { useEffect, useState }      from 'react';
import { useNavigate }                    from 'react-router-dom';
import { useAuth }                        from '../contexts/AuthContext';
import { getNotifications, markNotificationRead, markAllRead } from '../lib/supabase';
import { Bell }                           from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const nav      = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await getNotifications(user!.id);
    if (error) console.error(error);
    else setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetch(); }, [user]);

  const onClick = async (n: any) => {
    if (!n.is_read) {
      await markNotificationRead(n.id);
      setNotes(ns => ns.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
    nav(n.url); // deep-link to your order detail
  };

  return (
    <div className="container mx-auto px-7 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button
          onClick={() => markAllRead(user!.id).then(fetch)}
          className="text-sm text-gray-500 hover:underline"
        >
          Mark all read
        </button>
      </div>

      {loading
        ? <p>Loading…</p>
        : notes.length === 0
          ? <p className="text-gray-600">No new notifications.</p>
          : (
            <ul>
              {notes.map(n => (
                <li
                  key={n.id}
                  onClick={() => onClick(n)}
                  className={`p-4 mb-2 rounded-lg cursor-pointer ${
                    n.is_read ? 'bg-gray-100' : 'bg-white shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">{n.message}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )
      }
    </div>
  );
};

export default NotificationsPage;
