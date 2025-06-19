// src/components/ChecklistWidget.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Item { id: number; label: string; is_done: boolean; }

export default function ChecklistWidget({ occasionId }: { occasionId: number }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from('occasion_checklists')
      .select('*')
      .eq('occasion_id', occasionId)
      .then(res => res.data && setItems(res.data));
  }, [occasionId]);

  const toggle = async (id: number, done: boolean) => {
    await supabase
      .from('occasion_checklists')
      .update({ is_done: !done })
      .eq('id', id);
    setItems(items.map(i => i.id === id ? { ...i, is_done: !done } : i));
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">Your Planning Checklist</h3>
      {items.map(i => (
        <label key={i.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={i.is_done}
            onChange={() => toggle(i.id, i.is_done)}
            className="cursor-pointer"
          />
          <span className={i.is_done ? 'line-through text-gray-500' : ''}>
            {i.label}
          </span>
        </label>
      ))}
    </div>
  );
}
