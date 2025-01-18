import React from 'react';

interface BulletListProps {
  items: string[];
  columns?: 1 | 2;
  className?: string;
  emptyMessage?: string;
}

export function BulletList({ items, columns = 1, className = '', emptyMessage }: BulletListProps) {
  if (items.length === 0 && emptyMessage) {
    return <p className="text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul
      className={`${columns === 2 ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-3'} gap-4 ${className}`}
    >
      {items.map((item, index) => (
        <li key={index} className="flex items-start space-x-2">
          <span className="text-green-500">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
