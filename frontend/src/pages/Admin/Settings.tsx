import { useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../store/api';
import { Settings, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function SystemSettings() {
  const { data: settings, isLoading } = useGetSettingsQuery(undefined);
  const [updateSettings, { isLoading: isUpdating, isSuccess }] = useUpdateSettingsMutation();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateSettings({
        id: settings.id,
        defaultDueDays: parseInt(data.defaultDueDays),
        orangeWarningDays: parseInt(data.orangeWarningDays)
      }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div>טוען הגדרות...</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-800 drop-shadow-sm">הגדרות מערכת</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          {isSuccess && (
             <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
               ההגדרות נשמרו בהצלחה
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ימי יעד ברירת מחדל
            </label>
            <p className="text-xs text-gray-500 mb-2">בעת פתיחת משימה חדשה, תאריך היעד יקבע למספר ימים זה קדימה.</p>
            <input
              type="number"
              min={1}
              max={365}
              {...register('defaultDueDays')}
              className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ימי התרעה כתומה
            </label>
            <p className="text-xs text-gray-500 mb-2">מספר הימים לפני תאריך היעד שבו המשימה תיצבע בכתום כפול אזהרה.</p>
            <input
              type="number"
              min={1}
              max={30}
              {...register('orangeWarningDays')}
              className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'שומר...' : 'שמור הגדרות'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
