// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import toast from 'react-hot-toast';

// const SettingsPage = () => {
//   const { user } = useAuth();
//   const [fullName, setFullName] = useState('');
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const loadProfile = async () => {
//       if (!user) return;

//       const { data, error } = await supabase
//         .from('profiles')
//         .select('full_name, username')
//         .eq('id', user.id)
//         .single();

//       if (error) {
//         toast.error('Could not load profile');
//         return;
//       }

//       if (data) {
//         setFullName(data.full_name || '');
//         setUsername(data.username || '');
//       }

//       setEmail(user.email ?? '');
//     };

//     loadProfile();
//   }, [user]);

//   const isValidEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email.toLowerCase());
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       // Validate full name
//       if (!fullName.trim()) {
//         throw new Error('Full name is required.');
//       }

//       // Validate username and check for uniqueness
//       const trimmedUsername = username.trim().toLowerCase();
//       if (!trimmedUsername) {
//         throw new Error('Username is required.');
//       }

//       // Check if username is already taken by someone else
//       const { data: existing, error: usernameError } = await supabase
//         .from('profiles')
//         .select('id')
//         .eq('username', trimmedUsername)
//         .neq('id', user?.id)
//         .maybeSingle();

//       if (usernameError) throw usernameError;
//       if (existing) {
//         throw new Error('This username is already taken.');
//       }

//       // Update profile
//       const { error: profileUpdateError } = await supabase
//         .from('profiles')
//         .update({ full_name: fullName.trim(), username: trimmedUsername })
//         .eq('id', user?.id);

//       if (profileUpdateError) throw profileUpdateError;

//       // Update email if changed
//       const trimmedEmail = email.trim().toLowerCase();
//       if (trimmedEmail && trimmedEmail !== user?.email) {
//         if (!isValidEmail(trimmedEmail)) {
//           throw new Error('Please enter a valid email address.');
//         }

//         const { error: emailError } = await supabase.auth.updateUser({
//           email: trimmedEmail,
//         });

//         if (emailError) throw emailError;
//       }

//       // Update password if provided
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
//           <label className="block text-sm font-medium">Full Name</label>
//           <input
//             type="text"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Username</label>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value.trim())}
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
import React, { useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error('Could not load profile');
        return;
      }

      if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setAvatarBase64(data.avatar_url || null);
      }

      setEmail(user.email ?? '');
    };

    loadProfile();
  }, [user]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
  };

  // handle file select and convert to base64
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images < 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate full name
      if (!fullName.trim()) {
        throw new Error('Full name is required.');
      }

      // Validate username and check for uniqueness
      const trimmedUsername = username.trim().toLowerCase();
      if (!trimmedUsername) {
        throw new Error('Username is required.');
      }

      // Check if username is already taken by someone else
      const { data: existing, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmedUsername)
        .neq('id', user?.id)
        .maybeSingle();

      if (usernameError) throw usernameError;
      if (existing) {
        throw new Error('This username is already taken.');
      }

      // Update profile (with base64 image)
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: trimmedUsername,
          avatar_url: avatarBase64,
        })
        .eq('id', user?.id);

      if (profileUpdateError) throw profileUpdateError;

      // Update email if changed
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

      // Update password if provided
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

        {/* Avatar Section */}
        <div>
          <label className="block text-sm font-medium">Profile Picture</label>
          <div className="flex items-center gap-4 mt-1">
            {avatarBase64 ? (
              <img
                src={avatarBase64}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl">👤</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
