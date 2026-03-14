import { useState } from 'react';
import { useGetTasksQuery } from '../../store/api';
import FilterPanel from '../../components/Layout/FilterPanel';
import TaskTable from '../../components/Tables/TaskTable';
import { Filter } from 'lucide-react';
import { parseISO } from 'date-fns';

export default function MyTasks() {
  const [filters, setFilters] = useState({
    status: [] as number[],
    reportType: [] as number[],
    startDate: null as string | null,
    endDate: null as string | null,
    search: '',
  });

  const clearFilters = () => {
    setFilters({
      status: [],
      reportType: [],
      startDate: null,
      endDate: null,
      search: '',
    });
  };

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // RTK Query hooks
  const queryParams = new URLSearchParams();
  queryParams.append('my', 'true');
  if (filters.status.length) queryParams.append('status', filters.status.join(','));
  if (filters.reportType.length) queryParams.append('reportType', filters.reportType.join(','));
  if (filters.search) queryParams.append('search', filters.search);
  // Optional: Add exact due date filtering in backend, currently not strictly filtering by exactly due date in backend but string matches.
  
  const { data: tasks, isLoading } = useGetTasksQuery(queryParams.toString());

  // Filter out due date locally if backend doesn't support exact date filtering yet
  const filteredTasks = tasks?.filter((t: any) => {
    if (filters.startDate) {
      const taskDate = parseISO(t.dueDate);
      const start = new Date(filters.startDate);
      if (taskDate < start) return false;
    }
    if (filters.endDate) {
      const taskDate = parseISO(t.dueDate);
      const end = new Date(filters.endDate);
      if (taskDate > end) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full items-start">
      {/* Mobile filter toggle */}
      <button 
        className="md:hidden w-full bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center text-gray-700 shadow-sm"
        onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
      >
        <span className="font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" />
          סינון ▼
        </span>
      </button>

      {/* Filter Sidebar */}
      <div className={`w-full md:w-64 flex-shrink-0 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Main Table Area */}
      <div className="w-full flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm">המשימות שלי</h2>
            <button 
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-3 py-1.5 rounded-lg transition"
            >
              נקה סינון
            </button>
          </div>
          <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-200">
            {filteredTasks?.length || 0} משימות
          </span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <TaskTable tasks={filteredTasks || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
