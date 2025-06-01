// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import toast from 'react-hot-toast';

// const SettingsPage = () => {
//   const { user } = useAuth();
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Load profile on mount
//   useEffect(() => {
//     const loadProfile = async () => {
//       if (!user) return;

//       const { data, error } = await supabase
//         .from('profiles')
//         .select('full_name')
//         .eq('id', user.id)
//         .single();

//       if (error) {
//         toast.error('Could not load profile');
//         return;
//       }

//       if (data?.full_name) {
//         const parts = data.full_name.split(' ');
//         setFirstName(parts[0] || '');
//         setLastName(parts[1] || '');
//       }

//       setEmail(user.email ?? '');
//     };

//     loadProfile();
//   }, [user]);

//   // Handle save
//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       // Update profile table (first + last name)
//       const fullName = `${firstName} ${lastName}`.trim();

//       const { error: updateProfileError } = await supabase
//         .from('profiles')
//         .update({ full_name: fullName })
//         .eq('id', user?.id);

//       if (updateProfileError) throw updateProfileError;

//       // Update email
//       if (email && email !== user?.email) {
//         const { error: emailError } = await supabase.auth.updateUser({
//           email,
//         });
//         if (emailError) throw emailError;
//       }

//       // Update password
//       if (newPassword && newPassword.length >= 6) {
//         const { error: passwordError } = await supabase.auth.updateUser({
//           password: newPassword,
//         });
//         if (passwordError) throw passwordError;
//       }

//       toast.success('Profile updated!');
//     } catch (error: any) {
//       toast.error(error.message || 'Update failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium">First Name</label>
//           <input
//             type="text"
//             value={firstName}
//             onChange={(e) => setFirstName(e.target.value)}
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Last Name</label>
//           <input
//             type="text"
//             value={lastName}
//             onChange={(e) => setLastName(e.target.value)}
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">New Password</label>
//           <input
//             type="password"
//             placeholder="Leave blank to keep current password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         <button
//           onClick={handleSave}
//           disabled={loading}
//           className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
//         >
//           {loading ? 'Saving...' : 'Save Changes'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SettingsPage;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error('Could not load profile');
        return;
      }

      if (data?.full_name) {
        const parts = data.full_name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts[1] || '');
      }

      setEmail(user.email ?? '');
    };

    loadProfile();
  }, [user]);

  // Email format check (basic)
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (updateProfileError) throw updateProfileError;

      // Email update with validation
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail && trimmedEmail !== user?.email) {
        if (!isValidEmail(trimmedEmail)) {
          throw new Error('Please enter a valid email address.');
        }

        const { error: emailError } = await supabase.auth.updateUser({
          email: trimmedEmail,
        });

        if (emailError) throw emailError;
      }

      // Update password if valid
      if (newPassword && newPassword.length >= 6) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
      }

      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            placeholder="Leave blank to keep current password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
