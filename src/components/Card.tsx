import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, icon, children, className = 'mb-4' }: CardProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {title && (
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          {icon}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
