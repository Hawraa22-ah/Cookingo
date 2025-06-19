// src/components/CountdownTimer.tsx
import React, { useEffect, useState } from 'react';

interface Props { eventDate: string; /* ISO Date */ }

export default function CountdownTimer({ eventDate }: Props) {
  const target = new Date(eventDate).getTime();
  const [diff, setDiff] = useState(target - Date.now());

  useEffect(() => {
    const iv = setInterval(() => setDiff(target - Date.now()), 1000);
    return () => clearInterval(iv);
  }, [target]);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  if (diff <= 0) return <span>🎉 Today’s the day!</span>;

  return (
    <div className="flex space-x-2 font-mono text-lg">
      <span>{days}d</span>
      <span>{hours}h</span>
      <span>{mins}m</span>
      <span>{secs}s</span>
      <span>left</span>
    </div>
  );
}
