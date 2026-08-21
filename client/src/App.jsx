import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import Subjects from './pages/student/Subjects';
import SubjectDetail from './pages/student/SubjectDetail';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentLabManuals from './pages/student/StudentLabManuals';
import StudentSubmissions from './pages/student/StudentSubmissions';
import StudentProfile from './pages/student/StudentProfile';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageChapters from './pages/admin/ManageChapters';
import ManageAssignments from './pages/admin/ManageAssignments';
import ManageLabManuals from './pages/admin/ManageLabManuals';
import ManageSubmissions from './pages/admin/ManageSubmissions';
import ManageAdmins from './pages/admin/ManageAdmins';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Single unified admin login — used by Super Admin, Content Admin & Faculty Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Student area */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="lab-manuals" element={<StudentLabManuals />} />
          <Route path="submissions" element={<StudentSubmissions />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* Admin area — one login, three sub-roles gated per-page below */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          <Route element={<ProtectedRoute allowedRoles={['admin']} allowedAdminRoles={['super_admin', 'faculty_admin', 'content_admin']} />}>
            <Route path="students" element={<ManageStudents />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} allowedAdminRoles={['super_admin', 'content_admin']} />}>
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="chapters" element={<ManageChapters />} />
            <Route path="lab-manuals" element={<ManageLabManuals />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} allowedAdminRoles={['super_admin', 'content_admin', 'faculty_admin']} />}>
            <Route path="assignments" element={<ManageAssignments />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} allowedAdminRoles={['super_admin', 'faculty_admin']} />}>
            <Route path="submissions" element={<ManageSubmissions />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} allowedAdminRoles={['super_admin']} />}>
            <Route path="admins" element={<ManageAdmins />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;