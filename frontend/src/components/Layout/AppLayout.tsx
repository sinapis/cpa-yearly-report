import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { hideToast } from '../../store/uiSlice';
import { LogOut, User as UserIcon, Settings, Menu, Bell, CheckSquare, Search, CheckCircle, ClipboardList, Activity, Users } from 'lucide-react';
import clsx from 'clsx';

export default function AppLayout() {
  const auth = useSelector((state: RootState) => state.auth);
  const ui = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (ui.toastMessage) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [ui.toastMessage, dispatch]);

  if (!auth.token || !auth.user) {
    return <Navigate to="/login" replace />;
  }

  const role = auth.user.role;

  const navItems = [
    { label: 'המשימות שלי', path: '/tasks/my', icon: <CheckSquare className="w-5 h-5" /> },
    ...(role !== 'employee' ? [
      { label: 'משימות (מנהל)', path: '/tasks', icon: <Search className="w-5 h-5" /> }
    ] : []),
    ...(role === 'admin' ? [
      { label: 'ניהול עובדים', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
      { label: 'סוגי משימות', path: '/admin/report-types', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'סטטוסים', path: '/admin/status-types', icon: <Activity className="w-5 h-5" /> },
      { label: 'הגדרות מערכת', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> }
    ] : [])
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900" dir="rtl">
      {/* Top Navbar */}
      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Desktop Nav */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg shadow-sm flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="font-bold text-xl text-primary-600 hidden sm:block">דוחות.CPA</span>
              </div>
              
              <nav className="hidden md:flex space-x-reverse space-x-2">
                {navItems.map(item => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        'px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors',
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side: Notifications & User Profile */}
            <div className="flex items-center space-x-reverse space-x-4">
              <button className="text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 border rounded-full hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold border border-primary-200">
                    {auth.user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 pr-1 pl-2">
                    {auth.user.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      to="/profile/password"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      הפרופיל שלי
                    </Link>
                    <button
                      onClick={() => dispatch(logout())}
                      className="w-full text-right flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      התנתק
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden pr-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        <Outlet />
      </main>

      {/* Global Toast */}
      {ui.toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={clsx(
            "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white font-medium",
            ui.toastType === 'success' ? "bg-green-600" : ui.toastType === 'error' ? "bg-red-600" : "bg-gray-800"
          )}>
            {ui.toastType === 'success' && <CheckCircle className="w-5 h-5"/>}
            {ui.toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
