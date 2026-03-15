import { useState } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation } from '../../store/api';
import { Users, Plus, Edit2, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function UsersManagement() {
  const [filters, setFilters] = useState({ search: '', role: '', active: 'true' });
  
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.role) query.append('role', filters.role);
  if (filters.active !== 'all') query.append('active', filters.active);
  
  const { data: users, isLoading } = useGetUsersQuery(query.toString());
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const { register, handleSubmit, reset } = useForm();

  const handleEdit = (user: any) => {
    setEditingUser(user);
    // React hook form reset with default values requires a tick, doing it simply:
    setTimeout(() => reset(user), 0);
  };

  const clearEdit = () => {
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id, ...data }).unwrap();
      } else {
        await createUser(data).unwrap();
      }
      clearEdit();
    } catch (e) {
      console.error(e);
      alert('שגיאה בשמירת משתמש');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm flex items-center gap-3">
          <Users className="text-primary-600 w-6 h-6" />
          ניהול משתמשים
        </h2>
        <button 
          onClick={clearEdit} 
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4"/> משתמש חדש
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Users List & Filters */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 grid grid-cols-3 gap-3">
            <input 
              placeholder="חיפוש לפי שם/מייל..." 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              className="border-gray-300 rounded-md text-sm"
            />
            <select 
              value={filters.role}
              onChange={e => setFilters({...filters, role: e.target.value})}
              className="border-gray-300 rounded-md text-sm"
            >
              <option value="">כל התפקידים</option>
              <option value="employee">עובד</option>
              <option value="manager">מנהל</option>
              <option value="admin">מנהל מערכת</option>
            </select>
            <select 
              value={filters.active}
              onChange={e => setFilters({...filters, active: e.target.value})}
              className="border-gray-300 rounded-md text-sm"
            >
              <option value="all">הכל (פעיל ולא פעיל)</option>
              <option value="true">פעילים בלבד</option>
              <option value="false">לא פעילים</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">שם מלא</th>
                  <th className="px-4 py-3 font-semibold">אימייל</th>
                  <th className="px-4 py-3 font-semibold">תפקיד</th>
                  <th className="px-4 py-3 font-semibold">סטטוס</th>
                  <th className="px-4 py-3 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">טוען...</td></tr>
                ) : (
                  users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.role === 'admin' ? 'מנהל מערכת' : u.role === 'manager' ? 'מנהל' : 'עובד'}
                      </td>
                      <td className="px-4 py-3">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-200">
                            <Check className="w-3 h-3"/> פעיל
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-red-200">
                            <X className="w-3 h-3"/> חסום
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleEdit(u)} className="text-primary-600 hover:text-primary-800 p-1">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Form */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 sticky top-24">
          <h3 className="font-bold text-gray-800 border-b pb-2">
            {editingUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">שם פרטי</label>
              <input {...register('firstName', { required: true })} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">שם משפחה</label>
              <input {...register('lastName', { required: true })} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">אימייל</label>
              <input type="email" {...register('email', { required: true })} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">תפקיד</label>
              <select {...register('role')} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500">
                <option value="employee">עובד</option>
                <option value="manager">מנהל</option>
                <option value="admin">מנהל מערכת</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                סיסמה {editingUser && '(השאר ריק כדי לא לשנות)'}
              </label>
              <input type="password" {...register('password')} className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <input type="checkbox" {...register('active')} className="rounded text-primary-600 focus:ring-primary-500" />
              <label className="text-sm text-gray-700">פעיל</label>
            </div>
            
            <div className="pt-2">
              <button type="submit" className="w-full bg-primary-600 text-white font-medium text-sm py-2 rounded-lg hover:bg-primary-700 transition">
                {editingUser ? 'שמור שינויים' : 'צור משתמש'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
