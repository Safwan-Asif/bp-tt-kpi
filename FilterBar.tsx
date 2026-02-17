
import React from 'react';
import { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  options: {
    months: string[];
    weeks: string[];
    teams: string[];
    routes: string[];
    salesmen: string[];
    categories: string[];
  };
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, options }) => {
  const handleChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const selectClasses = "block w-full bg-white border border-slate-200 text-slate-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-amber-500 text-sm transition-colors cursor-pointer shadow-sm";
  const labelClasses = "block uppercase tracking-wide text-slate-500 text-[10px] font-bold mb-1";

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center gap-4 sticky top-0 z-50">
      <div className="w-full sm:w-auto min-w-[120px]">
        <label className={labelClasses}>Month</label>
        <select 
          className={selectClasses} 
          value={filters.month} 
          onChange={(e) => handleChange('month', e.target.value)}
        >
          <option value="All">All Months</option>
          {options.months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="w-full sm:w-auto min-w-[150px]">
        <label className={labelClasses}>Team</label>
        <select 
          className={selectClasses} 
          value={filters.team} 
          onChange={(e) => handleChange('team', e.target.value)}
        >
          <option value="All">All Teams</option>
          {options.teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="w-full sm:w-auto min-w-[120px]">
        <label className={labelClasses}>Route No</label>
        <select 
          className={selectClasses} 
          value={filters.routeNo} 
          onChange={(e) => handleChange('routeNo', e.target.value)}
        >
          <option value="All">All Routes</option>
          {options.routes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="w-full sm:w-auto min-w-[180px]">
        <label className={labelClasses}>Salesman Name</label>
        <select 
          className={selectClasses} 
          value={filters.salesman} 
          onChange={(e) => handleChange('salesman', e.target.value)}
        >
          <option value="All">All Salesmen</option>
          {options.salesmen.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="w-full sm:w-auto min-w-[120px]">
        <label className={labelClasses}>Category</label>
        <select 
          className={selectClasses} 
          value={filters.category} 
          onChange={(e) => handleChange('category', e.target.value)}
        >
          {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
