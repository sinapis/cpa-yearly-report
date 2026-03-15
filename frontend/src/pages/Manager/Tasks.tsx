import { useState, useMemo } from 'react';
import { useGetTasksQuery, useGetUsersQuery } from '../../store/api';
import FilterPanel from '../../components/Layout/FilterPanel';
import TaskTable from '../../components/Tables/TaskTable';
import { Filter, Plus, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import clsx from 'clsx';

export default function ManagerTasks() {
  const [filters, setFilters] = useState({
    status: [] as number[],
    reportType: [] as number[],
    startDate: null as string | null,
    endDate: null as string | null,
    search: '',
    assignee: [] as number[],
    risk: 'all', // all, red, orange, green
    groupBy: 'none' // none, assignee, reportType
  });

  const clearFilters = () => {
    setFilters({
      status: [],
      reportType: [],
      startDate: null,
      endDate: null,
      search: '',
      assignee: [],
      risk: 'all',
      groupBy: 'none'
    });
  };

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // RTK Query hooks
  const queryParams = new URLSearchParams();
  if (filters.status.length) queryParams.append('status', filters.status.join(','));
  if (filters.reportType.length) queryParams.append('reportType', filters.reportType.join(','));
  if (filters.assignee.length) queryParams.append('assignee', filters.assignee.join(','));
  if (filters.search) queryParams.append('search', filters.search);
  
  const { data: tasks, isLoading } = useGetTasksQuery(queryParams.toString());
  const { data: users } = useGetUsersQuery('?active=true'); // Fetch all active users for filtering

  const processedTasks = useMemo(() => {
    if (!tasks) return [];
    let filtered = tasks;

    // Local Date & Risk Filters
    if (filters.startDate || filters.endDate || filters.risk !== 'all') {
      filtered = filtered.filter((t: any) => {
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
        
        if (filters.risk !== 'all') {
          const isCompleted = t.status.name.includes('הושלם') || t.status.name.includes('בוטל');
          if (isCompleted) return false;

          const diff = differenceInDays(parseISO(t.dueDate), new Date());
          if (filters.risk === 'red' && diff >= 0) return false;
          if (filters.risk === 'orange' && (diff < 0 || diff > 7)) return false;
          if (filters.risk === 'green' && diff <= 7) return false;
        }
        return true;
      });
    }

    return filtered;
  }, [tasks, filters]);

  // Derived summaries
  const summaries = useMemo(() => {
    let open = 0, red = 0, orange = 0;
    tasks?.forEach((t: any) => {
      const isCompleted = t.status.name.includes('הושלם') || t.status.name.includes('בוטל');
      if (!isCompleted) {
        open++;
        const diff = differenceInDays(parseISO(t.dueDate), new Date());
        if (diff < 0) red++;
        else if (diff <= 7) orange++;
      }
    });
    return { open, red, orange };
  }, [tasks]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full items-start">
      {/* Mobile filter toggle */}
      <button 
        className="md:hidden w-full bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center text-gray-700 shadow-sm"
        onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
      >
        <span className="font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" /> סינון ▼
        </span>
      </button>

      {/* Filter Sidebar */}
      <div className={`w-full md:w-64 flex-shrink-0 space-y-4 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
        
        {/* Manager Specific Filters Panel Add-on */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">סינון מורחב (מנהל)</h3>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">אחראי לביצוע</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {users?.map((u: any) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-primary-600 focus:ring-primary-500"
                    checked={filters.assignee.includes(u.id as never)}
                    onChange={() => {
                      const updated = filters.assignee.includes(u.id as never)
                        ? filters.assignee.filter(id => id !== u.id)
                        : [...filters.assignee, u.id as never];
                      setFilters({ ...filters, assignee: updated });
                    }}
                  />
                  <span className="text-sm text-gray-600">{u.firstName} {u.lastName}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">סיכון איחור</label>
            <select 
              value={filters.risk} 
              onChange={e => setFilters({...filters, risk: e.target.value})}
              className="w-full border-gray-300 rounded-md sm:text-sm"
            >
              <option value="all">הכל</option>
              <option value="red">באיחור (אדום)</option>
              <option value="orange">קרוב ליעד (כתום)</option>
              <option value="green">תקין (ירוק)</option>
            </select>
          </div>
        </div>

        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Main Area */}
      <div className="w-full flex-1 flex flex-col gap-4">
        
        {/* Header & Actions & Summary Cards */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm flex items-center gap-3">
            <LayoutGrid className="text-primary-600 w-6 h-6" />
            משימות משרד
          </h2>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-3 py-2 rounded-lg transition"
            >
              נקה הכל
            </button>
            <Link 
              to="/tasks/new" 
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4" />
              משימה חדשה
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setFilters({ ...filters, risk: 'all', status: [] })}
            className={clsx(
              "border text-center shadow-sm p-4 rounded-xl flex flex-col items-center justify-center transition hover:scale-105",
              filters.risk === 'all' && filters.status.length === 0 ? "bg-primary-100 border-primary-300 ring-2 ring-primary-500" : "bg-white border-gray-100"
            )}
          >
            <span className="text-3xl font-bold text-primary-600">{summaries.open}</span>
            <span className="text-sm text-gray-500 font-medium">פתוחות</span>
          </button>
          <button 
            onClick={() => setFilters({ ...filters, risk: 'red' })}
            className={clsx(
              "border text-center shadow-sm p-4 rounded-xl flex flex-col items-center justify-center transition hover:scale-105",
              filters.risk === 'red' ? "bg-red-200 border-red-400 ring-2 ring-red-500" : "bg-red-50 border-red-100"
            )}
          >
            <span className="text-3xl font-bold text-red-600">{summaries.red}</span>
            <span className="text-sm text-red-700 font-medium">באיחור</span>
          </button>
          <button 
            onClick={() => setFilters({ ...filters, risk: 'orange' })}
            className={clsx(
              "border text-center shadow-sm p-4 rounded-xl flex flex-col items-center justify-center transition hover:scale-105",
              filters.risk === 'orange' ? "bg-orange-200 border-orange-400 ring-2 ring-orange-500" : "bg-orange-50 border-orange-100"
            )}
          >
            <span className="text-3xl font-bold text-orange-600">{summaries.orange}</span>
            <span className="text-sm text-orange-700 font-medium">קרוב ליעד (7 ימים)</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-2">
          <TaskTable tasks={processedTasks} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
