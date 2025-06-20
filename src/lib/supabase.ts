import { createClient } from '@supabase/supabase-js'

// Vite exposes env vars on import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Fetch notifications for a given chef */
export async function getNotificationsForChef(chefId: string) {
  return supabase
    .from('notifications')
    .select('*')
    .eq('chef_id', chefId)
    .order('created_at', { ascending: false })
}

/** Mark all chef notifications read */
export function markAllReadForChef(chefId: string) {
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('chef_id', chefId)
    .eq('is_read', false)
}

/** Mark a single notification read */
export function markNotificationRead(notificationId: number) {
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
}
