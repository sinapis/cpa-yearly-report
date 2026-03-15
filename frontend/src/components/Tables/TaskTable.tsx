import { Link } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import clsx from 'clsx';
import { Edit } from 'lucide-react';

interface TaskTableProps {
  tasks: any[];
  isLoading: boolean;
}

export default function TaskTable({ tasks, isLoading }: TaskTableProps) {

  const getRowRiskStyles = (task: any) => {
    // Exclude completed or cancelled. We assume if the name contains these words, it's done.
    const isCompleted = task.status.name.includes('הושלם') || task.status.name.includes('בוטל');
    if (isCompleted) return '';

    const today = new Date();
    const due = parseISO(task.dueDate);
    const diff = differenceInDays(due, today);

    if (diff < 0) {
      return 'bg-risk-red text-white hover:bg-red-600'; // Red bg + text
    } else if (diff <= 7) {
      return 'bg-risk-orange text-white hover:bg-orange-600'; // Orange bg + text
    }
    return 'hover:bg-gray-50'; // Default
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">טוען נתונים...</div>;
  }

  if (!tasks?.length) {
    return <div className="p-8 text-center text-gray-500 font-medium">לא נמצאו משימות העונות על דרישות הסינון.</div>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-right text-sm">
        <thead className="bg-gray-50 text-gray-700 uppercase tracking-wide border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 font-semibold">סוג דו"ח</th>
            <th className="px-4 py-3 font-semibold">סטטוס</th>
            <th className="px-4 py-3 font-semibold">תאריך יעד</th>
            <th className="px-4 py-3 font-semibold">אחראי</th>
            <th className="px-4 py-3 font-semibold w-1/3">הערה אחרונה</th>
            <th className="px-4 py-3 font-semibold cursor-pointer">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {tasks.map((task) => {
            const rowClass = getRowRiskStyles(task);
            const isCritical = rowClass.includes('bg-risk');
            const latestComment = task.comments?.[0]?.content || '';
            const truncated = latestComment.length > 80 ? latestComment.substring(0, 80) + '...' : latestComment;
            
            return (
              <tr key={task.id} className={clsx('transition-colors', rowClass)}>
                <td className="px-4 py-4 whitespace-nowrap font-medium">
                  {task.reportType.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span 
                    className={clsx("px-2.5 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 shadow-sm border", isCritical ? 'text-gray-900 border-gray-300' : '')}
                    style={!isCritical ? { backgroundColor: task.status.color + '20', color: task.status.color, borderColor: task.status.color + '40' } : {}}
                  >
                    {task.status.name}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-medium">
                  {format(parseISO(task.dueDate), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {task.assignee.firstName} {task.assignee.lastName}
                </td>
                <td className="px-4 py-4 truncate max-w-[200px]" title={latestComment}>
                  {truncated || <span className="text-gray-400 opacity-60">אין הערות</span>}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link 
                    to={`/tasks/${task.id}`} 
                    className={clsx("inline-flex items-center gap-1 font-medium transition-colors", isCritical ? 'text-white hover:text-gray-200' : 'text-primary-600 hover:text-primary-800')}
                  >
                    <Edit className="w-4 h-4" />
                    צפה / ערוך
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
