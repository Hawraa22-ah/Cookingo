// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ChefHat, User, ShoppingCart, Mail, Lock } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';

// const RegisterPage: React.FC = () => {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [role, setRole] = useState<'user' | 'chef' | 'seller'>('user');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { signUp } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       return;
//     }

//     setLoading(true);

//     try {
//       const fullName = `${firstName} ${lastName}`.trim();

//       const { error: signUpError } = await signUp(email, password, role, fullName);

//       if (signUpError) {
//         if (signUpError.message.includes('user_already_exists')) {
//           throw new Error('This email is already registered.');
//         }
//         throw signUpError;
//       }

//       navigate('/');
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('Failed to create an account.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="bg-cover bg-center min-h-screen"
//       style={{
//         backgroundImage:
//           "url('https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
//       }}
//     >
//       <div className="min-h-screen flex items-center justify-center bg-white/80 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-6">
//           <div className="text-center">
//             <Link to="/" className="flex items-center justify-center space-x-2">
//               <ChefHat size={32} className="text-orange-500" />
//               <span className="text-3xl font-bold font-serif text-gray-900">Cookingo</span>
//             </Link>
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
//             <p className="mt-2 text-sm text-gray-800">
//               Or{' '}
//               <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">
//                 sign in to your account
//               </Link>
//             </p>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
//               {error}
//             </div>
//           )}

//           {/* Role Selection */}
//           <div className="flex flex-wrap justify-center gap-4">
//             {[
//               {
//                 roleType: 'user',
//                 icon: <User className="w-8 h-8 mb-2" />,
//                 label: 'Regular User',
//                 description: 'Browse and save recipes',
//               },
//               {
//                 roleType: 'seller',
//                 icon: <ShoppingCart className="w-8 h-8 mb-2" />,
//                 label: 'Seller',
//                 description: 'Sell products and manage sales',
//               },
//               {
//                 roleType: 'chef',
//                 icon: <ChefHat className="w-8 h-8 mb-2" />,
//                 label: 'Chef',
//                 description: 'Create and share recipes',
//               },
//             ].map(({ roleType, icon, label, description }) => (
//               <button
//                 key={roleType}
//                 type="button"
//                 onClick={() => setRole(roleType as 'user' | 'chef' | 'seller')}
//                 className={`w-[110px] sm:w-[150px] p-4 rounded-lg border-2 transition-colors text-black ${
//                   role === roleType
//                     ? 'border-orange-500 bg-orange-50'
//                     : 'border-gray-200 hover:border-orange-200'
//                 }`}
//               >
//                 <div className="flex flex-col items-center text-center">
//                   {icon}
//                   <div className={`font-semibold ${role === roleType ? 'text-orange-500' : 'text-gray-900'}`}>
//                     {label}
//                   </div>
//                   <p className="text-xs text-gray-800">{description}</p>
//                 </div>
//               </button>
//             ))}
//           </div>

//           {/* Form Fields */}
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div>
//               <label className="block text-sm font-medium text-gray-900">First Name</label>
//               <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
//                 <User className="w-5 h-5 text-gray-400 mr-2" />
//                 <input
//                   type="text"
//                   required
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   className="w-full focus:outline-none"
//                   placeholder="Enter your first name"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-900">Last Name</label>
//               <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
//                 <User className="w-5 h-5 text-gray-400 mr-2" />
//                 <input
//                   type="text"
//                   required
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   className="w-full focus:outline-none"
//                   placeholder="Enter your last name"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-900">Email</label>
//               <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
//                 <Mail className="w-5 h-5 text-gray-400 mr-2" />
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full focus:outline-none"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-900">Password</label>
//               <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
//                 <Lock className="w-5 h-5 text-gray-400 mr-2" />
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full focus:outline-none"
//                   placeholder="Enter your password"
//                 />
//               </div>
//               <p className="mt-1 text-sm text-gray-800">Must be at least 6 characters long</p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-900">Confirm Password</label>
//               <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
//                 <Lock className="w-5 h-5 text-gray-400 mr-2" />
//                 <input
//                   type="password"
//                   required
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full focus:outline-none"
//                   placeholder="Confirm your password"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
//             >
//               {loading ? 'Creating account...' : 'Create account'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, User, ShoppingCart, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'chef' | 'seller'>('user');
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
      const fullName = `${firstName} ${lastName}`.trim();
      const { error: signUpError } = await signUp(email, password, role, fullName);

      if (signUpError) {
        if (signUpError.message.includes('user_already_exists')) {
          throw new Error('This email is already registered.');
        }
        throw signUpError;
      }

      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create an account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
      }}
    >
      <div className="min-h-screen flex items-center justify-center bg-white/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <ChefHat size={32} className="text-orange-500" />
              <span className="text-3xl font-bold font-serif text-gray-900">Cookingo</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-800">
              Or{' '}
              <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">
                sign in to your account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              {
                roleType: 'user',
                icon: <User className="w-6 h-6 mb-1" />,
                label: 'Regular User',
                description: 'Browse and save recipes',
              },
              {
                roleType: 'seller',
                icon: <ShoppingCart className="w-6 h-6 mb-1" />,
                label: 'Seller',
                description: 'Sell products and manage sales',
              },
              {
                roleType: 'chef',
                icon: <ChefHat className="w-6 h-6 mb-1" />,
                label: 'Chef',
                description: 'Create and share recipes',
              },
            ].map(({ roleType, icon, label, description }) => (
              <button
                key={roleType}
                type="button"
                onClick={() => setRole(roleType as 'user' | 'chef' | 'seller')}
                className={`w-[100px] sm:w-[130px] p-3 rounded-lg border-2 transition-colors text-black ${
                  role === roleType
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  {icon}
                  <div className={`text-sm font-semibold ${role === roleType ? 'text-orange-500' : 'text-gray-900'}`}>
                    {label}
                  </div>
                  <p className="text-[11px] text-gray-700">{description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-900">First Name</label>
              <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Enter your first name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Last Name</label>
              <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Password</label>
              <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
                <Lock className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>
              <p className="mt-1 text-sm text-gray-800">Must be at least 6 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Confirm Password</label>
              <div className="mt-1 flex items-center border rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500">
                <Lock className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full focus:outline-none"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

