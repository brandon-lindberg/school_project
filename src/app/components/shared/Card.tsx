import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`bg-neutral-50 rounded-md p-6 mb-6 ${className}`}>{children}</div>;
}
