
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin } from 'lucide-react';

interface RawNotification {
  id: string;
  qty: number;
  message: string;
  created_at: string;
  is_read: boolean;
  product_id: string;
  address: string | null;    // ← new
  latitude: number | null;   // ← new
  longitude: number | null;  // ← new
}

interface EnrichedNotification extends RawNotification {
  product: {
    id: string;
    name: string;
    image_url: string | null;
    price: number;
  };
}



const SellerNotificationsSection: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<EnrichedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);

    // 1) fetch raw notifications + location
    const { data: raws, error: rawsErr } = await supabase
      .from<RawNotification>('seller_notifications')
      .select(`
        id,
        qty,
        message,
        created_at,
        is_read,
        product_id,
        address,
        latitude,
        longitude
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (rawsErr || !raws) {
      console.error(rawsErr);
      setNotifications([]);
      setLoading(false);
      return;
    }

    // 2) batch‐fetch products
    const ids = Array.from(new Set(raws.map(r => r.product_id)));
    const { data: prods, error: prodsErr } = await supabase
      .from('seller_products')
      .select('id, name, image_url, price')
      .in('id', ids);

    if (prodsErr || !prods) {
      console.error(prodsErr);
      setNotifications([]);
      setLoading(false);
      return;
    }

    // 3) merge
    setNotifications(
      raws.map(r => ({
        ...r,
        product: prods.find(p => p.id === r.product_id)!,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // mark read helpers (unchanged)…
  const markAsRead = async (id: string) => {
    await supabase.from('seller_notifications').update({ is_read: true }).eq('id', id);
    fetchNotifications();
  };
  const markOrderAsRead = async (orderIds: string[]) => {
    await supabase.from('seller_notifications').update({ is_read: true }).in('id', orderIds);
    fetchNotifications();
  };

  // group by minute
  const orders = useMemo(() => {
    const map: Record<string, EnrichedNotification[]> = {};
    notifications.forEach(n => {
      const key = new Date(n.created_at).toISOString().slice(0, 16);
      (map[key] ??= []).push(n);
    });
    return Object.values(map);
  }, [notifications]);

  if (loading) return <div>Loading…</div>;
  if (!orders.length) return <div>No notifications yet.</div>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {orders.map((items, idx) => {
        const ts    = new Date(items[0].created_at).toLocaleString();
        const total = items.reduce((sum, n) => sum + n.product.price * n.qty, 0);
        const orderIds = items.map(n => n.id);
        const allRead  = items.every(n => n.is_read);

        return (
          <li
            key={items[0].created_at}
            style={{
              background: '#fffbe7',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {/* ─── display user’s location ─── */}
            {items[0].address && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  color: '#555',
                }}
              >
                <MapPin style={{ width: 16, height: 16 }} />
                <span>{items[0].address}</span>
              </div>
            )}

            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Order {idx + 1}:
            </div>

            {/* per‐product */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map(n => (
                <li
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  {n.product.image_url && (
                    <img
                      src={n.product.image_url}
                      alt={n.product.name}
                      style={{
                        width: 24,
                        height: 24,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                  )}
                  <span>
                    {n.product.name} × {n.qty}
                  </span>
                  <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
                    ${(n.product.price * n.qty).toFixed(2)}
                  </span>
                  <button
                    onClick={() => markAsRead(n.id)}
                    disabled={n.is_read}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      background: n.is_read ? 'green' : 'blue',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: n.is_read ? 'default' : 'pointer',
                    }}
                  >
                    Done
                  </button>
                </li>
              ))}
            </ul>

            {/* total + mark delivered */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 12,
              }}
            >
              <div style={{ fontWeight: 'bold' }}>Total: ${total.toFixed(2)}</div>
              <button
                onClick={() => markOrderAsRead(orderIds)}
                disabled={allRead}
                style={{
                  padding: '6px 12px',
                  background: allRead ? 'green' : 'blue',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: allRead ? 'default' : 'pointer',
                }}
              >
                {allRead ? 'Delivered' : 'Mark is Delivered'}
              </button>
            </div>

            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {ts}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SellerNotificationsSection;
