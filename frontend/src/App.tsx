import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import MyTasks from './pages/Employee/MyTasks';
import TaskDetails from './pages/Employee/TaskDetails';
import PasswordChange from './pages/Employee/PasswordChange';
import ManagerTasks from './pages/Manager/Tasks';
import TaskForm from './pages/Manager/TaskForm';
import UsersManagement from './pages/Admin/Users';
import TaskTypes from './pages/Admin/TaskTypes';
import StatusTypes from './pages/Admin/StatusTypes';
import SystemSettings from './pages/Admin/Settings';



export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/tasks/my" replace /> },
      { path: 'tasks/my', element: <MyTasks /> },
      { path: 'tasks/:taskId', element: <TaskDetails /> },
      { path: 'profile/password', element: <PasswordChange /> },
      
      // Manager +
      { path: 'tasks', element: <ManagerTasks /> },
      { path: 'tasks/new', element: <TaskForm /> },
      
      // Admin
      { path: 'admin/users', element: <UsersManagement /> },
      { path: 'admin/report-types', element: <TaskTypes /> },
      { path: 'admin/status-types', element: <StatusTypes /> },
      { path: 'admin/settings', element: <SystemSettings /> }
    ]
  }
]);
