import { useGetStatusTypesQuery, useGetReportTypesQuery } from '../../store/api';
import { Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { he } from 'date-fns/locale/he';
import { registerLocale } from "react-datepicker";
registerLocale('he', he);

interface FilterPanelProps {
  filters: {
    status: number[];
    reportType: number[];
    startDate: string | null;
    endDate: string | null;
    search: string;
    [key: string]: any;
  };
  setFilters: (filters: any) => void;
}

export default function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  const { data: statusTypes } = useGetStatusTypesQuery(undefined);
  const { data: reportTypes } = useGetReportTypesQuery(undefined);

  const toggleMultiSelect = (field: 'status' | 'reportType', id: number) => {
    const current = filters[field];
    const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    setFilters({ ...filters, [field]: updated });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-6">
      <h3 className="font-semibold text-gray-800 border-b pb-2">סינון משימות</h3>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">חיפוש טקסט</label>
        <div className="relative">
          <input
            type="text"
            className="w-full border-gray-300 rounded-md pr-10 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="חפש משימות..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">סטטוס משימה</label>
        <div className="space-y-2">
          {statusTypes?.map((s: any) => (
            <label key={s.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-primary-600 focus:ring-primary-500"
                checked={filters.status.includes(s.id)}
                onChange={() => toggleMultiSelect('status', s.id)}
              />
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">סוג דו"ח</label>
        <div className="space-y-2">
          {reportTypes?.map((r: any) => (
            <label key={r.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-primary-600 focus:ring-primary-500"
                checked={filters.reportType.includes(r.id)}
                onChange={() => toggleMultiSelect('reportType', r.id)}
              />
              <span className="text-sm text-gray-600 text-truncate">{r.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">טווח תאריכי יעד</label>
        <div className="relative">
          <DatePicker
            selectsRange={true}
            startDate={filters.startDate ? new Date(filters.startDate) : null}
            endDate={filters.endDate ? new Date(filters.endDate) : null}
            onChange={(update: [Date | null, Date | null]) => {
              const [start, end] = update;
              setFilters({ 
                ...filters, 
                startDate: start ? start.toISOString() : null, 
                endDate: end ? end.toISOString() : null 
              });
            }}
            isClearable={true}
            locale="he"
            dateFormat="dd/MM/yyyy"
            placeholderText="בחר טווח תאריכים"
            className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm pl-8"
          />
        </div>
      </div>


    </div>
  );
}
