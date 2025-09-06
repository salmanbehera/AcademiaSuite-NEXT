'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export type MoreActionsMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

export type MoreActionsButtonProps = {
  items: MoreActionsMenuItem[];
  buttonLabel?: string;
  className?: string;
};

export const MoreActionsButton: React.FC<MoreActionsButtonProps> = ({ items, buttonLabel = 'More Actions', className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      <button
        type="button"
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-150"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical className="h-3.5 w-3.5 mr-1" />
        {buttonLabel}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-10">
          <div className="py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className="flex items-center w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
