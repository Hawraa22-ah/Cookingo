import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell as BellIcon } from 'lucide-react';

const SellerAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Fetch only announcements for sellers or all users
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .in('target_audience', ['all', 'seller']) // <--- filter here!
        .order('created_at', { ascending: false });
      if (!error && data) setAnnouncements(data);
    };
    fetchAnnouncements();
  }, []);

  return (
    <section className="mt-8">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <BellIcon className="w-5 h-5 text-orange-500 mr-2" />
        Announcements
      </h2>
      {announcements.length === 0 ? (
        <p className="text-gray-500">No announcements.</p>
      ) : (
        announcements.map(a => (
          <div key={a.id} className="mb-6 border-b pb-4">
            <h3 className="font-bold">{a.title}</h3>
            <div className="mt-1">{a.message}</div>
            <div className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()}</div>
            {a.link && (
              <a
                href={a.link}
                className="text-blue-600 underline text-xs mt-1 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                View More
              </a>
            )}
          </div>
        ))
      )}
    </section>
  );
};

export default SellerAnnouncements;
