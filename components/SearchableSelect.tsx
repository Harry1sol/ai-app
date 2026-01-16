
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { TaxonomyItem } from '../types';

interface SearchableSelectProps {
  label: string;
  icon: React.ReactNode;
  options: TaxonomyItem[];
  value: string;
  onChange: (value: string, label: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  icon,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Select..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = options.find(opt => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
        setSearch(''); // Reset search on close
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2 group relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
        {icon}
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between transition-all font-medium outline-none
          ${disabled 
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-white hover:border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
          }
          ${isOpen ? 'ring-1 ring-blue-500 border-blue-500 bg-white' : ''}
        `}
      >
        <span className={!selectedItem ? "text-slate-400" : ""}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-blue-500/50"
                placeholder="Search..."
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id, opt.label);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors
                    ${value === opt.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}
                  `}
                >
                  {opt.label}
                  {value === opt.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 text-center italic">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
