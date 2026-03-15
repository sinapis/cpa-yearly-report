import { useState } from 'react';
import { useGetReportTypesQuery, useCreateReportTypeMutation, useUpdateReportTypeMutation, useDeleteReportTypeMutation } from '../../store/api';
import { ClipboardList, Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function TaskTypes() {
  const { data: reports, isLoading } = useGetReportTypesQuery(undefined);
  const [createReport] = useCreateReportTypeMutation();
  const [updateReport] = useUpdateReportTypeMutation();
  const [deleteReport] = useDeleteReportTypeMutation();
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const { register, handleSubmit, reset } = useForm();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setTimeout(() => reset(item), 0);
  };

  const handleDelete = async (id: number) => {
    if (confirm('האם אתה בטוח שברצונך למחוק סוג משימה זה?')) {
      try { await deleteReport(id).unwrap(); } catch(e) { console.error(e); }
    }
  };

  const clearEdit = () => {
    setEditingItem(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await updateReport({ id: editingItem.id, ...data }).unwrap();
      } else {
        await createReport(data).unwrap();
      }
      clearEdit();
    } catch (e) {
      console.error(e);
      alert('שגיאה בשמירה');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm flex items-center gap-3">
          <ClipboardList className="text-primary-600 w-6 h-6" />
          סוגי משימות
        </h2>
        <button 
          onClick={clearEdit} 
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4"/> הוסף סוג משימה
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">שם</th>
                <th className="px-4 py-3 font-semibold">תיאור</th>
                <th className="px-4 py-3 font-semibold text-center">פעיל</th>
                <th className="px-4 py-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">טוען...</td></tr>
              ) : (
                reports?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.description || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.active ? 'כן' : 'לא'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleEdit(r)} className="text-primary-600 hover:text-primary-800 p-1">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 p-1 relative z-10 cursor-pointer pointer-events-auto">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
          <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            {editingItem ? <Edit2 className="w-4 h-4 text-primary-500" /> : <Plus className="w-4 h-4 text-primary-500" />}
            {editingItem ? 'עריכת סוג משימה' : 'סוג משימה חדש'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
              <input {...register('name', { required: true })} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור (אופציונלי)</label>
              <textarea {...register('description')} rows={3} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('active')} className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
              <label className="text-sm text-gray-700">פעיל במערכת</label>
            </div>
            <button type="submit" className="w-full bg-primary-600 text-white font-medium text-sm py-2 rounded-lg hover:bg-primary-700 transition">
              {editingItem ? 'שמור שינויים' : 'הוסף'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
