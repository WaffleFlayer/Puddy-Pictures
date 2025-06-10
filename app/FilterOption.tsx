import React from 'react';

interface FilterOptionProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

export default function FilterOption({ checked, label, onChange }: FilterOptionProps) {
  return (
    <label className="filter-option flex items-center gap-2 text-[#eaf6fb] text-base cursor-pointer px-1 py-0.5 rounded hover:bg-[#23243a] transition" style={{ minHeight: '2rem', overflowWrap: 'anywhere', maxWidth: '100%' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-[#00fff7]"
        style={{ width: '1.5rem', height: '1.5rem', minWidth: '1.5rem', minHeight: '1.5rem', margin: 0, verticalAlign: 'middle' }}
      />
      <span style={{ fontSize: '1rem', lineHeight: '1.5rem', display: 'inline-block', minHeight: '1.5rem', wordBreak: 'break-word', maxWidth: '100%' }}>{label}</span>
    </label>
  );
}
