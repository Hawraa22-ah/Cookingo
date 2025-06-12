import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-700">
        Welcome, Admin! You have full access to user and admin features.
      </p>
      {/* Add admin-specific content here */}
    </div>
  );
};

export default AdminDashboard;
