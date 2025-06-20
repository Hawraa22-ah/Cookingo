// // src/components/profile/ChefOccasionRequestsSection.tsx
// import React, { useEffect, useState } from 'react'
// import { supabase }        from '../../lib/supabase'
// import { useAuth }         from '../../contexts/AuthContext'

// type OccRequest = {
//   id: number
//   type: 'occasion'
//   user_id: string
//   occasion: string
//   food_type: string
//   event_date: string
//   quantity: number
//   location: string
//   status: 'pending' | 'in_progress' | 'delivered'
//   created_at: string
// }

// type DishOrder = {
//   id: number
//   type: 'dish'
//   dish_id: number
//   dish_name: string
//   quantity: number
//   delivery_date: string
//   location: string
  
//   status: 'pending' | 'in_progress' | 'delivered'
// }

// type NotificationItem = OccRequest | DishOrder

// export default function ChefOccasionRequestsSection() {
//   const { user } = useAuth()
//   const [items, setItems] = useState<NotificationItem[]>([])

//   // helper to update status in correct table
//   const updateStatus = async (item: NotificationItem, nextStatus: NotificationItem['status']) => {
//     const table = item.type === 'occasion'
//       ? 'custom_requests'
//       : 'daily_dish_orders'
//     const { error } = await supabase
//       .from(table)
//       .update({ status: nextStatus })
//       .eq('id', item.id)
//     if (error) {
//       alert('Failed to update status')
//       console.error(error)
//     } else {
//       setItems(curr =>
//         curr.map(x =>
//           x.type === item.type && x.id === item.id
//             ? { ...x, status: nextStatus }
//             : x
//         )
//       )
//     }
//   }

//   useEffect(() => {
//     if (!user) return

//     // 1) load occasion requests
//     const occQ = supabase
//       .from<OccRequest>('custom_requests')
//       .select('*')
//       .order('created_at', { ascending: false })

//     // 2) load daily dish orders for this chef
//     const dishQ = supabase
//       .from('daily_dish_orders')
//       .select(`
//         id,
//         dish_id,
//         quantity,
//         delivery_date,
//         location,
//         status,
//         dish: dishes(id, name, chef_id)
//       `)
//       .eq('dish.chef_id', user.id)

//     Promise.all([occQ, dishQ]).then(([{ data: occs }, { data: orders }]) => {
//       const occItems: OccRequest[] = (occs || []).map(o => ({
//         ...o,
//         type: 'occasion'
//       }))

//       const dishItems: DishOrder[] = (orders || [])
//         .filter(o => o.dish)
//         .map(o => ({
//           id:             o.id,
//           type:           'dish',
//           dish_id:        o.dish_id,
//           dish_name:      o.dish.name,
//           quantity:       o.quantity,
//           delivery_date:  o.delivery_date,
//           location:       o.location,
//           status:         o.status as DishOrder['status']
//         }))

//       const merged = [...occItems, ...dishItems].sort((a, b) => {
//         const aTime = a.type === 'occasion'
//           ? new Date(a.created_at).getTime()
//           : new Date(a.delivery_date).getTime()
//         const bTime = b.type === 'occasion'
//           ? new Date(b.created_at).getTime()
//           : new Date(b.delivery_date).getTime()
//         return bTime - aTime
//       })

//       setItems(merged)
//     })
//   }, [user])

//   if (!items.length) {
//     return <div className="text-center py-12 text-gray-600">No notifications yet.</div>
//   }

//   return (
//     <div className="space-y-4">
//       {items.map(item => (
//         <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4 bg-white">
//           {/* Header line */}
//           <div className="flex justify-between text-sm text-gray-500 mb-2">
//             <span>
//               {item.type === 'occasion'
//                 ? new Date(item.created_at).toLocaleString()
//                 : new Date(item.delivery_date).toLocaleString()
//               }
//             </span>
//             <span className="capitalize">
//               {item.type === 'occasion'
//                 ? item.occasion
//                 : 'Dish Order'
//               }
//             </span>
//           </div>

//           {/* Details grid */}
//           <div className="grid grid-cols-2 gap-4 text-gray-700 mb-4">
//             {item.type === 'occasion' ? (
//               <>
//                 <div><strong>Food:</strong> {item.food_type}</div>
//                 <div><strong>Date:</strong> {new Date(item.event_date).toLocaleDateString()}</div>
//                 <div><strong>Qty:</strong> {item.quantity}</div>
//                 <div><strong>Location:</strong> {item.location}</div>
//               </>
//             ) : (
//               <>
//                 <div><strong>Dish:</strong> {item.dish_name}</div>
//                 <div><strong>Delivery:</strong> {new Date(item.delivery_date).toLocaleDateString()}</div>
//                 <div><strong>Qty:</strong> {item.quantity}</div>
//                 <div><strong>Location:</strong> {item.location}</div>
//               </>
//             )}
//           </div>

//           {/* Status & action buttons */}
//           <div className="flex items-center space-x-2">
//             <span className={`px-2 py-1 rounded text-sm ${
//               item.status === 'pending'     ? 'bg-yellow-100 text-yellow-800' :
//               item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
//               item.status === 'delivered'   ? 'bg-green-100 text-green-800' :
//               ''
//             }`}>
//               {item.status.replace('_',' ')}
//             </span>

//             {item.status === 'pending' && (
//               <button
//                 onClick={() => updateStatus(item, 'in_progress')}
//                 className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
//               >
//                 Start
//               </button>
//             )}
//             {item.status === 'in_progress' && (
//               <button
//                 onClick={() => updateStatus(item, 'delivered')}
//                 className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
//               >
//                 Mark Delivered
//               </button>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

type OccRequest = {
  id: number
  type: 'occasion'
  user_id: string
  occasion: string
  food_type: string
  event_date: string
  quantity: number
  location: string  // stored as "lat,lng" or address text
  status: 'pending' | 'in_progress' | 'delivered'
  created_at: string
}

type DishOrder = {
  id: number
  type: 'dish'
  dish_id: number
  dish_name: string
  quantity: number
  delivery_date: string
  latitude: number | null
  longitude: number | null
  status: 'pending' | 'in_progress' | 'delivered'
}

type NotificationItem = OccRequest | DishOrder

// Helper: convert "lat,lng" string to link, or fallback to text
function renderLocationLink(location: string) {
  // Check if location matches lat,lng pattern
  const match = location.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/)
  if (match) {
    const lat = match[1]
    const lng = match[3]
    return (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {lat}, {lng}
      </a>
    )
  }
  // fallback to plain text
  return location || "N/A"
}

export default function ChefOccasionRequestsSection() {
  const { user } = useAuth()
  const [items, setItems] = useState<NotificationItem[]>([])

  // helper to update status in correct table
  const updateStatus = async (item: NotificationItem, nextStatus: NotificationItem['status']) => {
    const table = item.type === 'occasion'
      ? 'custom_requests'
      : 'daily_dish_orders'
    const { error } = await supabase
      .from(table)
      .update({ status: nextStatus })
      .eq('id', item.id)
    if (error) {
      alert('Failed to update status')
      console.error(error)
    } else {
      setItems(curr =>
        curr.map(x =>
          x.type === item.type && x.id === item.id
            ? { ...x, status: nextStatus }
            : x
        )
      )
    }
  }

  useEffect(() => {
    if (!user) return

    // 1) load occasion requests
    const occQ = supabase
      .from<OccRequest>('custom_requests')
      .select('*')
      .order('created_at', { ascending: false })

    // 2) load daily dish orders for this chef
    const dishQ = supabase
      .from('daily_dish_orders')
      .select(`
        id,
        dish_id,
        quantity,
        delivery_date,
        latitude,
        longitude,
        status,
        dish: dishes(id, name, chef_id)
      `)
      .eq('dish.chef_id', user.id)

    Promise.all([occQ, dishQ]).then(([{ data: occs }, { data: orders }]) => {
      const occItems: OccRequest[] = (occs || []).map(o => ({
        ...o,
        type: 'occasion'
      }))

      const dishItems: DishOrder[] = (orders || [])
        .filter(o => o.dish)
        .map(o => ({
          id:             o.id,
          type:           'dish',
          dish_id:        o.dish_id,
          dish_name:      o.dish.name,
          quantity:       o.quantity,
          delivery_date:  o.delivery_date,
          latitude:       o.latitude,
          longitude:      o.longitude,
          status:         o.status as DishOrder['status']
        }))

      const merged = [...occItems, ...dishItems].sort((a, b) => {
        const aTime = a.type === 'occasion'
          ? new Date(a.created_at).getTime()
          : new Date(a.delivery_date).getTime()
        const bTime = b.type === 'occasion'
          ? new Date(b.created_at).getTime()
          : new Date(b.delivery_date).getTime()
        return bTime - aTime
      })

      setItems(merged)
    })
  }, [user])

  if (!items.length) {
    return <div className="text-center py-12 text-gray-600">No notifications yet.</div>
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4 bg-white">
          {/* Header line */}
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              {item.type === 'occasion'
                ? new Date(item.created_at).toLocaleString()
                : new Date(item.delivery_date).toLocaleString()
              }
            </span>
            <span className="capitalize">
              {item.type === 'occasion'
                ? item.occasion
                : 'Dish Order'
              }
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 text-gray-700 mb-4">
            {item.type === 'occasion' ? (
              <>
                <div><strong>Food:</strong> {item.food_type}</div>
                <div><strong>Date:</strong> {new Date(item.event_date).toLocaleDateString()}</div>
                <div><strong>Qty:</strong> {item.quantity}</div>
                <div>
                  <strong>Location:</strong> {renderLocationLink(item.location)}
                </div>
              </>
            ) : (
              <>
                <div><strong>Dish:</strong> {item.dish_name}</div>
                <div><strong>Delivery:</strong> {new Date(item.delivery_date).toLocaleDateString()}</div>
                <div><strong>Qty:</strong> {item.quantity}</div>
                <div>
                  <strong>Location:</strong>{' '}
                  {item.latitude && item.longitude
                    ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {item.latitude}, {item.longitude}
                        </a>
                      )
                    : 'N/A'}
                </div>
              </>
            )}
          </div>

          {/* Status & action buttons */}
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-sm ${
              item.status === 'pending'     ? 'bg-yellow-100 text-yellow-800' :
              item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              item.status === 'delivered'   ? 'bg-green-100 text-green-800' :
              ''
            }`}>
              {item.status.replace('_',' ')}
            </span>

            {item.status === 'pending' && (
              <button
                onClick={() => updateStatus(item, 'in_progress')}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Start
              </button>
            )}
            {item.status === 'in_progress' && (
              <button
                onClick={() => updateStatus(item, 'delivered')}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
