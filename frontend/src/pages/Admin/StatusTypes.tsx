import { useState } from 'react';
import { useGetStatusTypesQuery, useCreateStatusTypeMutation, useUpdateStatusTypeMutation, useDeleteStatusTypeMutation } from '../../store/api';
import { Activity, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function StatusTypes() {
  const { data: statuses, isLoading } = useGetStatusTypesQuery(undefined);
  const [createStatus] = useCreateStatusTypeMutation();
  const [updateStatus] = useUpdateStatusTypeMutation();
  const [deleteStatus] = useDeleteStatusTypeMutation();
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const { register, handleSubmit, reset, watch } = useForm();
  
  const colorVal = watch('color') || '#007BFF';

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setTimeout(() => reset(item), 0);
  };

  const handleDelete = async (id: number) => {
    if (confirm('האם אתה בטוח שברצונך למחוק סטטוס זה?')) {
      try { await deleteStatus(id).unwrap(); } catch(e) { console.error(e); }
    }
  };

  const clearEdit = () => {
    setEditingItem(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await updateStatus({ id: editingItem.id, ...data }).unwrap();
      } else {
        await createStatus(data).unwrap();
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
          <Activity className="text-primary-600 w-6 h-6" />
          סוגי סטטוסים
        </h2>
        <button 
          onClick={clearEdit} 
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4"/> הוסף סטטוס
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">שם סטטוס</th>
                <th className="px-4 py-3 font-semibold">תצוגה מקדימה</th>
                <th className="px-4 py-3 font-semibold text-center">ברירת מחדל</th>
                <th className="px-4 py-3 font-semibold text-center">פעיל</th>
                <th className="px-4 py-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">טוען...</td></tr>
              ) : (
                statuses?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: s.color + '20', color: s.color, borderColor: s.color + '40' }}>
                        {s.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-primary-600">
                      {s.isDefault && <CheckCircle2 className="w-5 h-5 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.active ? 'כן' : 'לא'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleEdit(s)} className="text-primary-600 hover:text-primary-800 p-1">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1">
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
          <h3 className="font-bold text-gray-800 border-b pb-2">
            {editingItem ? 'עריכת סטטוס' : 'סטטוס חדש'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
              <input {...register('name', { required: true })} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">צבע (Hex)</label>
              <div className="flex gap-2">
                <input type="color" {...register('color', { required: true })} className="w-10 h-10 border-gray-300 rounded-md" />
                <input type="text" value={colorVal} readOnly className="w-full text-sm font-mono border-gray-300 bg-gray-50 rounded-md" />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('active')} className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                <span className="text-sm text-gray-700">פעיל במערכת</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isDefault')} className="rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 text-wrap">ברירת מחדל (יוגדר אוטומטית למשימות חדשות)</span>
              </label>
            </div>
            
            <button type="submit" className="w-full mt-2 bg-primary-600 text-white font-medium text-sm py-2 rounded-lg hover:bg-primary-700 transition">
              {editingItem ? 'שמור שינויים' : 'הוסף סטטוס'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
