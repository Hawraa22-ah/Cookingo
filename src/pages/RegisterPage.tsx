import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';



const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'chef'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const { error: signUpError } = await signUp(email, password, role);
      
      if (signUpError) {
        if (signUpError.message.includes('User already registered') || 
            signUpError.message.includes('user_already_exists')) {
          throw new Error('This email is already registered. Please log in or use a different email.');
        }
        throw signUpError;
      }

      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2">
            <ChefHat size={32} className="text-orange-500" />
            <span className="text-3xl font-bold font-serif text-gray-800">Cookingo</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                role === 'user'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <User className={`w-8 h-8 mx-auto mb-2 ${
                role === 'user' ? 'text-orange-500' : 'text-gray-400'
              }`} />
              <div className={`font-medium ${
                role === 'user' ? 'text-orange-500' : 'text-gray-500'
              }`}>
                Regular User
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Browse and save recipes
              </p>
            </button>

            <button
  type="button"
  onClick={() => setRole('seller')}
  className={`p-4 rounded-lg border-2 transition-colors ${
    role === 'seller'
      ? 'border-orange-500 bg-orange-50'
      : 'border-gray-200 hover:border-orange-200'
  }`}
>
  <ShoppingCart className={`w-8 h-8 mx-auto mb-2 ${
    role === 'seller' ? 'text-orange-500' : 'text-gray-400'
  }`} />
  <div className={`font-medium ${
    role === 'seller' ? 'text-orange-500' : 'text-gray-500'
  }`}>
    Seller
  </div>
  <p className="text-sm text-gray-500 mt-1">
    Sell products and manage sales
  </p>
</button>
            

            <button
              type="button"
              onClick={() => setRole('chef')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                role === 'chef'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <ChefHat className={`w-8 h-8 mx-auto mb-2 ${
                role === 'chef' ? 'text-orange-500' : 'text-gray-400'
              }`} />
              <div className={`font-medium ${
                role === 'chef' ? 'text-orange-500' : 'text-gray-500'
              }`}>
                Chef
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Create and share recipes
              </p>
            </button>
          </div>
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;