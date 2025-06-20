import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface FinishOrderNotification {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  product_image?: string | null;
  created_at: string;
  is_read?: boolean; // optional, in case you don't have it yet
}

const SellerNotificationsSection: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<FinishOrderNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('finish_order')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (notifId: string) => {
    await supabase.from('finish_order').update({ is_read: true }).eq('id', notifId);
    fetchNotifications();
  };

  return (
    <div>
      <h2>Seller Notifications</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {notifications.map(notif => (
            <li
              key={notif.id}
              style={{
                background: notif.is_read ? '#f9f9f9' : '#fffbe7',
                marginBottom: 8,
                padding: 10,
                borderRadius: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {notif.product_image && (
                  <img src={notif.product_image} alt={notif.product_name} style={{ width: 32, height: 32, borderRadius: 4 }} />
                )}
                <span>
                  <strong>{notif.product_name}</strong> × {notif.quantity} — ${notif.unit_price.toFixed(2)}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {new Date(notif.created_at).toLocaleString()}
              </div>
              {notif.is_read === false && (
                <button onClick={() => markAsRead(notif.id)}>Mark as read</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SellerNotificationsSection;
