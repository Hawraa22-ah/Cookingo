// import React, { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';

// // Static beneficiary categories
// const BENEFICIARIES = [
//   { id: 'street', label: 'Poor people on the street' },
//   { id: 'orphans', label: 'Orphans' },
//   { id: 'nursing', label: 'Nursing home' },
// ];

// // Type for Impact Updates entries
// type Update = {
//   id: number;
//   title: string;
//   description: string;
//   image_url: string;
//   created_at: string;
// };

// const Donation: React.FC = () => {
//   const { user } = useAuth();
//   const [selected, setSelected] = useState<string>('');
//   const [amount, setAmount] = useState<string>('');
//   const [message, setMessage] = useState<string>('');
//   const [success, setSuccess] = useState<string>('');
//   const [isChef, setIsChef] = useState<boolean>(false);
//   const [totals, setTotals] = useState<Record<string, number>>({});
//   const [donations, setDonations] = useState<any[]>([]);
//   const [updates, setUpdates] = useState<Update[]>([]);
//   const [page, setPage] = useState<number>(1);
//   const pageSize = 5;

//   // On mount: check chef role, load totals, history, and updates
//   useEffect(() => {
//     const init = async () => {
//       if (user?.id) {
//         // Check chef status
//         const { data: profile } = await supabase
//           .from('profiles')
//           .select('role')
//           .eq('id', user.id)
//           .single();
//         if (profile?.role === 'chef') {
//           setIsChef(true);
//           // Sum non-withdrawn donations
//           const { data: rows } = await supabase
//             .from('donations')
//             .select('beneficiary, amount')
//             .eq('is_withdrawn', false);
//           if (rows) {
//             const sums: Record<string, number> = {};
//             BENEFICIARIES.forEach(b => (sums[b.id] = 0));
//             rows.forEach(r => {
//               sums[r.beneficiary] += parseFloat(r.amount);
//             });
//             setTotals(sums);
//           }
//         }
//       }
//       // Fetch history & updates for all users (including guests)
//       await fetchHistory();
//       await fetchUpdates();
//     };
//     init();
//   }, [user]);

//   // Fetch paginated donation history (all donors)
//   const fetchHistory = async () => {
//     const { data } = await supabase
//       .from('donations')
//       .select('beneficiary, amount, message, donated_at')
//       .order('donated_at', { ascending: false })
//       .range((page - 1) * pageSize, page * pageSize - 1);
//     if (data) setDonations(data);
//   };

//   // Fetch latest impact updates
//   const fetchUpdates = async () => {
//     const { data } = await supabase
//       .from<Update>('impact_updates')
//       .select('*')
//       .order('created_at', { ascending: false })
//       .limit(5);
//     if (data) setUpdates(data);
//   };

//   // Re-fetch history when page changes
//   useEffect(() => {
//     fetchHistory();
//   }, [page]);

//   const handleDonate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) return alert('Please log in to donate.');
//     if (!selected) return alert('Please select a beneficiary.');
//     const amt = parseFloat(amount);
//     if (isNaN(amt) || amt <= 0) return alert('Enter a valid amount.');

//     const { error } = await supabase
//       .from('donations')
//       .insert([
//         { beneficiary: selected, donor_id: user.id, amount: amt, message, is_withdrawn: false },
//       ]);
//     if (error) {
//       alert('Error processing donation: ' + error.message);
//       return;
//     }

//     if (isChef) {
//       setTotals(prev => ({ ...prev, [selected]: (prev[selected] || 0) + amt }));
//     }

//     setSuccess(
//       `Thank you for donating $${amt.toFixed(2)} to ${
//         BENEFICIARIES.find(b => b.id === selected)!.label
//       }!`
//     );
//     setSelected('');
//     setAmount('');
//     setMessage('');
//     setPage(1);
//     fetchHistory();
//   };

//   const handleWithdraw = async (beneficiaryId: string) => {
//     const amt = totals[beneficiaryId] || 0;
//     await supabase
//       .from('donations')
//       .update({ is_withdrawn: true })
//       .eq('beneficiary', beneficiaryId)
//       .eq('is_withdrawn', false);

//     setTotals(prev => ({ ...prev, [beneficiaryId]: 0 }));
//     alert(
//       `Withdrawn $${amt.toFixed(2)} for ${
//         BENEFICIARIES.find(b => b.id === beneficiaryId)!.label
//       }`
//     );
//   };

//   return (
//     <div className="container mx-auto mt-24 px-4">
//       {/* Header */}
//       <h1 className="text-3xl font-bold mb-4">Welcome to the Donation Page</h1>
//       <p className="text-lg mb-6">Your support helps our chefs cook for those in need.</p>

//       {/* Form & Chef Dashboard */}
//       <div className="md:flex md:space-x-8">
//         {/* Donation Form */}
//         <form onSubmit={handleDonate} className="flex-1 bg-white p-6 rounded-lg shadow-md">
//           <label className="block mb-4">
//             <span className="block font-medium mb-1">Select Beneficiary:</span>
//             <select
//               value={selected}
//               onChange={e => setSelected(e.target.value)}
//               className="w-full p-2 border rounded"
//               required
//             >
//               <option value="">Choose the people you want to help</option>
//               {BENEFICIARIES.map(b => (
//                 <option key={b.id} value={b.id}>
//                   {b.label}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <label className="block mb-4">
//             <span className="block font-medium mb-1">Amount (USD):</span>
//             <input
//               type="number"
//               step="0.01"
//               min="0"
//               value={amount}
//               onChange={e => setAmount(e.target.value)}
//               className="w-full p-2 border rounded"
//               placeholder="Enter amount"
//               required
//             />
//           </label>

//           <label className="block mb-4">
//             <span className="block font-medium mb-1">Message (optional):</span>
//             <textarea
//               value={message}
//               onChange={e => setMessage(e.target.value)}
//               className="w-full p-2 border rounded"
//               placeholder="Your message"
//             />
//           </label>

//           <button
//             type="submit"
//             className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
//           >
//             Donate
//           </button>
//           {success && <p className="mt-4 text-green-600 text-center">{success}</p>}
//         </form>

//         {/* Chef Dashboard */}
//         {isChef && (
//           <div className="mt-8 md:mt-0 md:w-1/3 bg-white p-6 rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-4">Donated money</h2>
//             {BENEFICIARIES.map(b => (
//               <div key={b.id} className="mb-4">
//                 <p className="text-lg">
//                   {b.label}: <strong>${(totals[b.id] || 0).toFixed(2)}</strong>
//                 </p>
//                 <button
//                   onClick={() => handleWithdraw(b.id)}
//                   className="mt-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
//                 >
//                   Withdraw for {b.label}
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Donation History */}
//       <div className="mt-8">
//         <h2 className="text-2xl font-bold mb-4">Donation History</h2>
//         <table className="w-full border border-gray-200">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-2 border">Date</th>
//               <th className="p-2 border">Beneficiary</th>
//               <th className="p-2 border">Amount</th>
//               <th className="p-2 border">Message</th>
//             </tr>
//           </thead>
//           <tbody>
//             {donations.map((d, i) => (
//               <tr key={i} className="even:bg-gray-50">
//                 <td className="p-2 border">{new Date(d.donated_at).toLocaleDateString()}</td>
//                 <td className="p-2 border">
//                   {BENEFICIARIES.find(b => b.id === d.beneficiary)?.label}
//                 </td>
//                 <td className="p-2 border">${parseFloat(d.amount).toFixed(2)}</td>
//                 <td className="p-2 border">{d.message || '-'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <div className="flex justify-between mt-4">
//           <button
//             disabled={page === 1}
//             onClick={() => setPage(p => Math.max(p - 1, 1))}
//             className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <button
//             disabled={donations.length < pageSize}
//             onClick={() => setPage(p => p + 1)}
//             className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Impact Updates */}
//       <div className="mt-12">
//         <h2 className="text-2xl font-bold mb-4">Donations</h2>
//         <div className="overflow-x-auto flex space-x-4 py-2">
//           {updates.map(u => (
//             <div key={u.id} className="min-w-[200px] bg-white rounded-lg shadow-md">
//               {u.image_url && (
//                 <img
//                   src={u.image_url}
//                   alt={u.title}
//                   className="w-full h-32 object-cover rounded-t-lg"
//                 />
//               )}
//               <div className="p-3">
//                 <p className="font-semibold mb-1">{u.title}</p>
//                 <p className="text-sm mb-2">{u.description}</p>
//                 <p className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Donation;
// src/pages/Donation.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Static beneficiary categories
const BENEFICIARIES = [
  { id: 'street', label: 'Poor people on the street' },
  { id: 'orphans', label: 'Orphans' },
  { id: 'nursing', label: 'Nursing home' },
];

type Update = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
};

const pageSize = 5;

const Donation: React.FC = () => {
  const { user } = useAuth();

  // form state
  const [selected, setSelected]   = useState<string>('');
  const [amount, setAmount]       = useState<string>('');
  const [creditCard, setCreditCard] = useState<string>('');
  const [message, setMessage]     = useState<string>('');
  const [success, setSuccess]     = useState<string>('');

  // chef dashboard state
  const [isChef, setIsChef]       = useState<boolean>(false);
  const [totals, setTotals]       = useState<Record<string, number>>({});

  // history & updates
  const [donations, setDonations] = useState<any[]>([]);
  const [updates, setUpdates]     = useState<Update[]>([]);
  const [page, setPage]           = useState<number>(1);

  // initial data load
  useEffect(() => {
    const init = async () => {
      if (!user) return;

      // check if user is chef
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role === 'chef') {
        setIsChef(true);

        // sum non-withdrawn donations
        const { data: rows } = await supabase
          .from('donations')
          .select('beneficiary, amount')
          .eq('is_withdrawn', false);
        if (rows) {
          const sums: Record<string, number> = {};
          BENEFICIARIES.forEach(b => (sums[b.id] = 0));
          rows.forEach(r => {
            sums[r.beneficiary] += parseFloat(r.amount);
          });
          setTotals(sums);
        }
      }

      await fetchHistory();
      await fetchUpdates();
    };
    init();
    // eslint-disable-next-line
  }, [user]);

  // fetch donation history
  const fetchHistory = async () => {
    const { data } = await supabase
      .from('donations')
      .select('beneficiary, amount, message, donated_at')
      .order('donated_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (data) setDonations(data);
  };

  // fetch impact updates
  const fetchUpdates = async () => {
    const { data } = await supabase
      .from<Update>('impact_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setUpdates(data);
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [page]);

  // handle donation submit
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return alert('Please log in to donate.');
    }
    if (!selected) {
      return alert('Please select a beneficiary.');
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return alert('Enter a valid amount.');
    }
    if (!creditCard.trim()) {
      return alert('Please enter your credit-card number.');
    }

    const { error } = await supabase
      .from('donations')
      .insert([{
        beneficiary:  selected,
        donor_id:     user.id,
        amount:       amt,
        message,
        is_withdrawn: false,
        credit_card:  creditCard
      }]);

    if (error) {
      console.error(error);
      return alert('Error processing donation: ' + error.message);
    }

    if (isChef) {
      setTotals(prev => ({
        ...prev,
        [selected]: (prev[selected] || 0) + amt
      }));
    }

    setSuccess(
      `Thank you for donating $${amt.toFixed(2)} to ${
        BENEFICIARIES.find(b => b.id === selected)!.label
      }!`
    );
    setSelected('');
    setAmount('');
    setCreditCard('');
    setMessage('');
    setPage(1);
    fetchHistory();
  };

  // handle withdrawal by chef
  const handleWithdraw = async (beneficiaryId: string) => {
    if (!creditCard.trim()) {
      return alert('Please enter your credit-card number before withdrawing.');
    }
    const amt = totals[beneficiaryId] || 0;

    const { error } = await supabase
      .from('donations')
      .update({ is_withdrawn: true, chef_card: creditCard })
      .eq('beneficiary', beneficiaryId)
      .eq('is_withdrawn', false);

    if (error) {
      console.error(error);
      return alert('Withdrawal failed: ' + error.message);
    }

    setTotals(prev => ({ ...prev, [beneficiaryId]: 0 }));
    alert(
      `Withdrawn $${amt.toFixed(2)} for ${
        BENEFICIARIES.find(b => b.id === beneficiaryId)!.label
      } to card ${creditCard}`
    );
    setCreditCard('');
  };

  return (
    <div className="container mx-auto mt-24 px-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Donation Page</h1>
      <p className="text-lg mb-6">Your support helps our chefs cook for those in need.</p>

      <div className="md:flex md:space-x-8">
        {/* Donation Form */}
        <form onSubmit={handleDonate} className="flex-1 bg-white p-6 rounded-lg shadow-md">
          <label className="block mb-4">
            <span className="font-medium">Select Beneficiary:</span>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            >
              <option value="">Choose a beneficiary</option>
              {BENEFICIARIES.map(b => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <span className="font-medium">Amount (USD):</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="Enter amount"
              required
            />
          </label>

          <label className="block mb-4">
            <span className="font-medium">Credit-Card #:</span>
            <input
              type="text"
              value={creditCard}
              onChange={e => setCreditCard(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="1234-5678-9012-3456"
              required
            />
          </label>

          <label className="block mb-4">
            <span className="font-medium">Message (optional):</span>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="Your message"
            />
          </label>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            Donate
          </button>

          {success && <p className="mt-4 text-green-600 text-center">{success}</p>}
        </form>

        {/* Chef Dashboard */}
        {isChef && (
          <div className="mt-8 md:mt-0 md:w-1/3 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Donated Money</h2>
            <label className="block mb-6">
              <span className="font-medium">Your Credit-Card # (to withdraw):</span>
              <input
                type="text"
                value={creditCard}
                onChange={e => setCreditCard(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                placeholder="1234-5678-9012-3456"
              />
            </label>
            {BENEFICIARIES.map(b => (
              <div key={b.id} className="mb-6">
                <p className="text-lg">
                  {b.label}: <strong>${(totals[b.id] || 0).toFixed(2)}</strong>
                </p>
                <button
                  onClick={() => handleWithdraw(b.id)}
                  className="mt-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Withdraw for {b.label}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Donation History</h2>
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Beneficiary</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Message</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d, i) => (
              <tr key={i} className="even:bg-gray-50">
                <td className="p-2 border">{new Date(d.donated_at).toLocaleDateString()}</td>
                <td className="p-2 border">
                  {BENEFICIARIES.find(b => b.id === d.beneficiary)?.label}
                </td>
                <td className="p-2 border">${parseFloat(d.amount).toFixed(2)}</td>
                <td className="p-2 border">{d.message || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={donations.length < pageSize}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Impact Updates */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Helping Hands, Full Hearts </h2>
        <div className="overflow-x-auto flex space-x-4 py-2">
          {updates.map(u => (
            <div key={u.id} className="min-w-[200px] bg-white rounded-lg shadow-md">
              {u.image_url && (
                <img
                  src={u.image_url}
                  alt={u.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <div className="p-3">
                <p className="font-semibold mb-1">{u.title}</p>
                <p className="text-sm mb-2">{u.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Donation;
