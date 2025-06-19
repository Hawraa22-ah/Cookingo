// src/components/CalendarAvailability.tsx
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../lib/supabase';

export default function CalendarAvailability({ occasionId, onSelect }: { occasionId: number; onSelect: (d: Date) => void }) {
  const [booked, setBooked] = useState<Date[]>([]);
  const [holds, setHolds] = useState<Date[]>([]);

  useEffect(() => {
    // fetch confirmed bookings (you’d have a bookings table similarly)
    supabase
      .from('bookings')
      .select('event_date')
      .eq('occasion_id', occasionId)
      .then(res => {
        const dates = res.data?.map(r => new Date(r.event_date)) || [];
        setBooked(dates);
      });
    // fetch holds
    supabase
      .from('date_holds')
      .select('expires_at, held_at')
      .eq('occasion_id', occasionId)
      .then(res => {
        const active = res.data
          ?.filter(r => new Date(r.expires_at) > new Date())
          .map(r => new Date(r.held_at));
        setHolds(active || []);
      });
  }, [occasionId]);

  return (
    <DatePicker
      inline
      minDate={new Date()}
      highlightDates={[
        { "react-datepicker__day--booked": booked },
        { "react-datepicker__day--held": holds }
      ]}
      dayClassName={date =>
        booked.some(d => d.toDateString() === date.toDateString())
          ? 'opacity-50 line-through cursor-not-allowed'
          : holds.some(d => d.toDateString() === date.toDateString())
            ? 'opacity-75 bg-yellow-200 cursor-not-allowed'
            : 'cursor-pointer'
      }
      onSelect={(d: Date) => onSelect(d)}
    />
  );
}
