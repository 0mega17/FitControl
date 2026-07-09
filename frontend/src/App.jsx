import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './modules/auth/pages/Login'
import Register from './modules/auth/pages/Register'
import Dashboard from './modules/dashboard/pages/Dashboard'
import Memberships from './modules/memberships/pages/Memberships'
import Profile from './modules/profile/pages/Profile'
import Routines from './modules/routines/pages/Routines'
import RoutineBuilder from './modules/routines/pages/RoutineBuilder'
import RoutineDetail from './modules/routines/pages/RoutineDetail'
import MyRoutine from './modules/routines/pages/MyRoutine'
import { useAuth } from './context/AuthContext'

function RoutinesWrapper() {
  const { user } = useAuth()
  if (user?.rol?.nombre === 'Cliente') return <MyRoutine />
  return <Routines />
}

import Progress from './modules/progress/pages/Progress'
import Attendance from './modules/attendance/pages/Attendance'
import Classes from './modules/classes/pages/Classes'
import Bookings from './modules/bookings/pages/Bookings'
import MyQR from './modules/profile/pages/MyQR'
import Notifications from './modules/notifications/pages/Notifications'
import Calendar from './modules/calendar/pages/Calendar'
import Reports from './modules/admin/pages/Reports'
import RoutineRequestForm from './modules/routines/pages/RoutineRequestForm'
import MyRequests from './modules/routines/pages/MyRequests'
import TrainerRequests from './modules/routines/pages/TrainerRequests'
import AdminUsers from './modules/admin/pages/AdminUsers'
import Exercises from './modules/exercises/pages/Exercises'
import ExerciseDetail from './modules/exercises/pages/ExerciseDetail'
import MyMembership from './modules/memberships/pages/MyMembership'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<ProtectedRoute roles={['Administrador']}><Dashboard /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={['Administrador']}><Reports /></ProtectedRoute>} />
          <Route path="memberships" element={<Memberships />} />
          <Route path="routines" element={<ProtectedRoute roles={['Administrador', 'Entrenador', 'Cliente']}><RoutinesWrapper /></ProtectedRoute>} />
          <Route path="routines/create" element={<ProtectedRoute roles={['Administrador', 'Entrenador']}><RoutineBuilder /></ProtectedRoute>} />
          <Route path="routines/:id" element={<ProtectedRoute roles={['Administrador', 'Entrenador']}><RoutineDetail /></ProtectedRoute>} />
          <Route path="my-routine" element={<ProtectedRoute roles={['Cliente']}><MyRoutine /></ProtectedRoute>} />
          <Route path="solicitar-rutina" element={<ProtectedRoute roles={['Cliente']}><RoutineRequestForm /></ProtectedRoute>} />
          <Route path="my-requests" element={<ProtectedRoute roles={['Cliente']}><MyRequests /></ProtectedRoute>} />
          <Route path="trainer-requests" element={<ProtectedRoute roles={['Administrador', 'Entrenador']}><TrainerRequests /></ProtectedRoute>} />
          <Route path="progress" element={<ProtectedRoute roles={['Cliente', 'Administrador', 'Entrenador']}><Progress /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute roles={['Administrador', 'Entrenador']}><Attendance /></ProtectedRoute>} />
          <Route path="classes" element={<ProtectedRoute roles={['Administrador', 'Entrenador', 'Cliente']}><Classes /></ProtectedRoute>} />
          <Route path="my-bookings" element={<ProtectedRoute roles={['Cliente']}><Bookings /></ProtectedRoute>} />
          <Route path="my-qr" element={<ProtectedRoute roles={['Cliente']}><MyQR /></ProtectedRoute>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="calendar" element={<ProtectedRoute roles={['Administrador', 'Entrenador']}><Calendar /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute roles={['Administrador']}><AdminUsers /></ProtectedRoute>} />
          <Route path="my-membership" element={<ProtectedRoute roles={['Cliente']}><MyMembership /></ProtectedRoute>} />
          <Route path="exercises" element={<ProtectedRoute roles={['Administrador', 'Entrenador', 'Cliente']}><Exercises /></ProtectedRoute>} />
          <Route path="exercises/:id" element={<ProtectedRoute roles={['Administrador', 'Entrenador', 'Cliente']}><ExerciseDetail /></ProtectedRoute>} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
