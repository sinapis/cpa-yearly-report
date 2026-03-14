import React from 'react';
import { useForm } from 'react-hook-form';
import { useChangePasswordMutation } from '../../store/api';
import { Key } from 'lucide-react';

export default function PasswordChange() {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [changePassword, { isLoading, isSuccess, isError, error }] = useChangePasswordMutation();

  const onSubmit = async (data: any) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }).unwrap();
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const newPassword = watch('newPassword');

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <Key className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800 drop-shadow-sm">שינוי סיסמה</h2>
        </div>
        
        <div className="p-6 sm:p-8">
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
              הסיסמה שונתה בהצלחה.
            </div>
          )}

          {isError && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
              {(error as any)?.data?.message || 'שגיאה בעת שינוי סיסמה.'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה נוכחית</label>
              <input
                type="password"
                {...register('currentPassword', { required: 'שדה חובה', minLength: { value: 8, message: 'מינימום 8 תווים' } })}
                className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message as string}</p>}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה חדשה</label>
              <input
                type="password"
                {...register('newPassword', { 
                  required: 'שדה חובה', 
                  minLength: { value: 8, message: 'מינימום 8 תווים' },
                  pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)/, message: 'חייב להכיל אות וספרה' }
                })}
                className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימות סיסמה חדשה</label>
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'שדה חובה',
                  validate: value => value === newPassword || 'הסיסמאות אינן תואמות'
                })}
                className="w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {isLoading ? 'שומר...' : 'שנה סיסמה'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
