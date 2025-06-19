// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL!,
//   import.meta.env.VITE_SUPABASE_ANON_KEY!

  
// );

// export { supabase };

// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

// ── Notification helpers ──────────────────────────────────────────────────────

/**
 * Fetch all notifications for a given seller, newest first.
 */
export async function getNotifications(seller_id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('seller_id', seller_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data!
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  return data!
}

/**
 * Mark all notifications for a seller as read.
 */
export async function markAllRead(seller_id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('seller_id', seller_id)
  if (error) throw error
  return data!
}

// ── (Optional) Other domain helpers ───────────────────────────────────────────
// You could also move your cart-to-order logic here, e.g. createOrder, etc.

export { supabase }
