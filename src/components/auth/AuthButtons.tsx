import React from 'react';
import { LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthButtons: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          to="/profile"
          className="flex items-center text-gray-700 hover:text-orange-500 transition-colors"
        >
          <User className="w-5 h-5 mr-1" />
          <span>{user.email?.split('@')[0]}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center text-gray-700 hover:text-orange-500 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-1" />
          <span>Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/login"
        className="flex items-center text-gray-700 hover:text-orange-500 transition-colors"
      >
        <LogIn className="w-5 h-5 mr-1" />
        <span>Login</span>
      </Link>
      <Link
        to="/register"
        className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
      >
        <UserPlus className="w-5 h-5 mr-1" />
        <span>Register</span>
      </Link>
    </div>
  );
};

export default AuthButtons;