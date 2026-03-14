import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateTaskMutation, useGetReportTypesQuery, useGetStatusTypesQuery, useGetUsersQuery } from '../../store/api';
import { Plus } from 'lucide-react';

export default function TaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: users } = useGetUsersQuery('?active=true');
  const { data: reportTypes } = useGetReportTypesQuery(undefined);
  const { data: statusTypes } = useGetStatusTypesQuery(undefined);

  const defaultStatus = statusTypes?.find((s: any) => s.isDefault)?.id || statusTypes?.[0]?.id;
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const onSubmit = async (data: any) => {
    try {
      await createTask({ ...data, statusId: data.statusId || defaultStatus }).unwrap();
      navigate('/tasks');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-800 drop-shadow-sm">יצירת משימה חדשה</h2>
          </div>
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            &larr; חזור
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אחראי לביצוע</label>
              <select
                {...register('assigneeId', { required: 'שדה חובה' })}
                className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">בחר עובד...</option>
                {users?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
              {errors.assigneeId && <p className="text-red-500 text-xs mt-1">{errors.assigneeId.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג דו"ח</label>
              <select
                {...register('reportTypeId', { required: 'שדה חובה' })}
                className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">בחר סוג דו"ח...</option>
                {reportTypes?.filter((r: any) => r.active).map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.reportTypeId && <p className="text-red-500 text-xs mt-1">{errors.reportTypeId.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
              <input
                type="date"
                defaultValue={defaultDueDate}
                {...register('dueDate', { required: 'שדה חובה' })}
                className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס התחלתי</label>
              <select
                {...register('statusId')}
                defaultValue={defaultStatus}
                className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {statusTypes?.filter((s: any) => s.active).map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">הערה ראשונית (אופציונלי)</label>
            <textarea
              {...register('comment')}
              rows={4}
              maxLength={2000}
              placeholder="פרטים נוספים לגבי המשימה..."
              className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-primary-600 border border-transparent text-white font-medium text-sm rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {isLoading ? 'יוצר משימה...' : 'צור משימה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
