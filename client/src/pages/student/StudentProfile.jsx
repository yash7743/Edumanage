import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();

  const rows = [
    { label: 'Full Name', value: user?.name },
    { label: 'Email', value: user?.email },
    { label: 'Student ID', value: user?.studentId },
    { label: 'Semester', value: user?.semester },
    { label: 'Joined', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
      <div className="card divide-y divide-gray-100">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-3 text-sm">
            <span className="text-gray-500">{r.label}</span>
            <span className="font-medium text-gray-800">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentProfile;
