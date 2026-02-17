
import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, suffix, prefix, icon }) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline">
        {prefix && <span className="text-slate-400 text-sm font-medium mr-1">{prefix}</span>}
        <span className="text-2xl font-bold text-slate-800 font-mono">
          {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
        </span>
        {suffix && <span className="text-slate-500 text-xs font-medium ml-1">{suffix}</span>}
      </div>
    </div>
  );
};

export default KPICard;
