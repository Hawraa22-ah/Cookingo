import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell as BellIcon } from 'lucide-react';

const ChefAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .in('target_audience', ['all', 'chef']) // Only for chefs or all
        .order('created_at', { ascending: false });
      if (!error && data) setAnnouncements(data);
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="flex items-center text-2xl font-bold mb-6">
        <BellIcon className="w-6 h-6 text-orange-500 mr-2" />
        Announcements
      </h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : announcements.length === 0 ? (
        <p className="text-gray-500">No announcements for chefs.</p>
      ) : (
        announcements.map(a => (
          <div key={a.id} className="mb-6 border-b pb-4">
            <h2 className="font-semibold text-lg">{a.title}</h2>
            <div className="mt-1 text-gray-800">{a.message}</div>
            {a.link && (
              <a
                href={a.link}
                className="text-blue-600 underline text-xs mt-2 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                View More
              </a>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {new Date(a.created_at).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChefAnnouncements;
