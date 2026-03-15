import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../store/api';
import { setCredentials } from '../store/authSlice';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials({ user: response.user, token: response.jwt }));
      navigate('/tasks/my');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 drop-shadow-sm">
            מערכת ניהול דוחות שנתיים
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            התחבר לחשבונך כדי להמשיך
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל / שם משתמש</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('identifier', { required: 'שדה חובה' })}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="name@company.com"
                />
              </div>
              {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password', { required: 'שדה חובה', minLength: { value: 8, message: 'מינימום 8 תווים' } })}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="mr-2 block text-sm text-gray-900">
                זכור אותי
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                שכחת סיסמה?
              </a>
            </div>
          </div>

          {error && (
            <div className="text-red-600 bg-red-50 text-sm p-3 rounded-md text-center">
              שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב.
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
