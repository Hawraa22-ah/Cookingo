// import React, { useEffect, useState } from 'react';
// import { useAuth }  from '../../contexts/AuthContext';
// import { supabase } from '../../lib/supabase';

// interface Request {
//   id: number;
//   occasion: string;
//   occasion_id?: string;      // if you have it
//   food_type: string;
//   event_date: string;
//   quantity: number;
//   location: string;
//   created_at: string;
// }

// export default function OccasionsOrdersSection() {
//   const { user } = useAuth();
//   const [orders, setOrders] = useState<Request[]>([]);

//   // 1) Fetch existing requests
//   useEffect(() => {
//     if (!user) return;
//     supabase
//       .from<Request>('custom_requests')
//       .select('*')
//       .eq('user_id', user.id)
//       .order('created_at', { ascending: false })
//       .then(({ data }) => data && setOrders(data));
//   }, [user]);

//   // 2) Subscribe to new requests *and* push chef notifications
//   useEffect(() => {
//     if (!user) return;

//     const chan = supabase
//       .channel(`occs_req_user_${user.id}`)
//       .on(
//         'postgres_changes',
//         {
//           schema: 'public',
//           table:  'custom_requests',
//           event:  'INSERT',
//           filter: `user_id=eq.${user.id}`
//         },
//         async ({ new: row }) => {
//           const newReq = row as Request;
//           // add to local state
//           setOrders(o => [newReq, ...o]);

//           // look up the chef on the occasion (impact_updates)
//           const q = supabase
//             .from('impact_updates')
//             .select('chef_id, title')
//             // prefer occasion_id if you stored it
//           if ((newReq as any).occasion_id) {
//             q.eq('id', (newReq as any).occasion_id);
//           } else {
//             q.eq('title', newReq.occasion);
//           }
//           const { data: occ, error: occErr } = await q.single();
//           if (occ) {
//             // now push a notification
//             const { error: notifErr } = await supabase
//               .from('notifications')
//               .insert([{
//                 seller_id:  occ.chef_id,
//                 order_id:   newReq.id,
//                 product_id: (newReq as any).occasion_id || newReq.id,
//                 qty:        newReq.quantity,
//                 type:       'occasion',
//                 message:    `New occasion order: ${newReq.quantity}× ${occ.title}`
//               }]);
//             if (notifErr) console.error('Notif insert error:', notifErr);
//           } else {
//             console.error('Occasion lookup error:', occErr);
//           }
//         }
//       )
//       .subscribe();

//     return () => supabase.removeChannel(chan);
//   }, [user]);

//   if (!orders.length) {
//     return <div className="text-center py-12">No occasion requests yet.</div>;
//   }

//   return (
//     <div className="space-y-4">
//       {orders.map(o => (
//         <div key={o.id} className="border rounded-lg p-4 bg-white">
//           <div className="flex justify-between text-sm text-gray-500 mb-2">
//             <span>{new Date(o.created_at).toLocaleString()}</span>
//             <span>{o.occasion}</span>
//           </div>
//           <div className="grid grid-cols-2 gap-4 text-gray-700">
//             <div><strong>Food:</strong> {o.food_type}</div>
//             <div><strong>Date:</strong> {new Date(o.event_date).toDateString()}</div>
//             <div><strong>Qty:</strong> {o.quantity}</div>
//             <div><strong>Location:</strong> {o.location}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { useAuth }  from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Request {
  id: number;
  occasion: string;
  occasion_id?: string;      // if your requests table stores it
  food_type: string;
  event_date: string;
  quantity: number;
  location: string;
  created_at: string;
}

export default function OccasionsOrdersSection() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Request[]>([]);

  // 1) Fetch existing requests on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from<Request>('custom_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data);
      });
  }, [user]);

  // 2) Subscribe to new requests AND push chef notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`occs_req_user_${user.id}`)
      .on(
        'postgres_changes',
        {
          schema: 'public',
          table:  'custom_requests',
          event:  'INSERT',
          filter: `user_id=eq.${user.id}`
        },
        async ({ new: row }) => {
          const newReq = row as Request;

          // add to local UI
          setOrders(o => [newReq, ...o]);

          // lookup the chef for this occasion
          let occQuery = supabase
            .from('impact_updates')
            .select('chef_id, title')
            .single();

          if ((newReq as any).occasion_id) {
            occQuery = occQuery.eq('id', (newReq as any).occasion_id);
          } else {
            occQuery = occQuery.eq('title', newReq.occasion);
          }

          const { data: occ, error: occErr } = await occQuery;
          if (occErr || !occ) {
            console.error('Failed to lookup occasion chef:', occErr);
            return;
          }

          // insert a notification for the chef
          const { error: notifErr } = await supabase
            .from('notifications')
            .insert([{
              seller_id:  occ.chef_id,
              order_id:   newReq.id,
              product_id: (newReq as any).occasion_id || newReq.id,
              qty:        newReq.quantity,
              type:       'occasion',
              message:    `New occasion order: ${newReq.quantity}× ${occ.title}`
            }]);

          if (notifErr) {
            console.error('Failed to insert notification:', notifErr);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!orders.length) {
    return <div className="text-center py-12">No occasion requests yet.</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{new Date(o.created_at).toLocaleString()}</span>
            <span>{o.occasion}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div><strong>Food:</strong> {o.food_type}</div>
            <div><strong>Date:</strong> {new Date(o.event_date).toDateString()}</div>
            <div><strong>Qty:</strong> {o.quantity}</div>
            <div><strong>Location:</strong> {o.location}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
