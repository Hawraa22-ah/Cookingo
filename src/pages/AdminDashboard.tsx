import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Bell as BellIcon } from 'lucide-react';

const HIGH_PRICE_LIMIT = 100;
// orange, green, light-brown (tan)
const COLORS = ['#f97316', '#10b981', '#D2B48C'];

interface Recipe {
  id: number;
  title: string;
  avg_rating: number;
  meal_time: string | null;
  calories_level: string | null;
}

interface SellerProduct {
  id: number;
  name: string;
  price: number;
  seller_id: string;
}

const AdminDashboard: React.FC = () => {
  // Stats state
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalChefs, setTotalChefs] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalOccasions, setTotalOccasions] = useState(0);

  // Data lists
  const [lowRatedRecipes, setLowRatedRecipes] = useState<Recipe[]>([]);
  const [highPriceProducts, setHighPriceProducts] = useState<SellerProduct[]>([]);
  const [donationBeneficiaryStats, setDonationBeneficiaryStats] = useState<any[]>([]);
  const [occasionTypes, setOccasionTypes] = useState<any[]>([]);

  // Announcement form state
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newLink, setNewLink] = useState('');
  const [adding, setAdding] = useState(false);

  // map raw beneficiary codes to friendly labels
  const BENEFICIARY_LABELS: Record<string, string> = {
    street: 'Poor people on the street',
    orphans: 'Orphans',
    nursing: 'Nursing home',
  };

  useEffect(() => {
    // 1) Role counts
    (async () => {
      const { data, error } = await supabase.from('profiles').select('role');
      if (error) return console.error(error.message);
      let u = 0, c = 0, s = 0, a = 0;
      data!.forEach(r => {
        const role = r.role?.toLowerCase().trim();
        if (role === 'user') u++;
        else if (role === 'chef') c++;
        else if (role === 'seller') s++;
        else if (role === 'admin') a++;
      });
      setTotalUsers(u);
      setTotalChefs(c);
      setTotalSellers(s);
      setTotalAdmins(a);
    })();

    // 2) Low-rated recipes
    (async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, avg_rating, meal_time, calories_level')
        .lte('avg_rating', 2.5);
      if (!error && data) setLowRatedRecipes(data as Recipe[]);
    })();

    // 3) High-price products
    (async () => {
      const { data, error } = await supabase
        .from('seller_products')
        .select('id, name, price, seller_id')
        .gt('price', HIGH_PRICE_LIMIT);
      if (!error && data) setHighPriceProducts(data as SellerProduct[]);
    })();

    // 4) Donations: total + group by beneficiary
    (async () => {
      const { data, count, error } = await supabase
        .from('donations')
        .select('beneficiary', { count: 'exact' });
      if (!error && data) {
        setTotalDonations(count ?? 0);
        const tally: Record<string, number> = {};
        data.forEach(d => {
          if (!d.beneficiary) return;
          tally[d.beneficiary] = (tally[d.beneficiary] || 0) + 1;
        });
        setDonationBeneficiaryStats(
          Object.entries(tally).map(([code, val]) => ({
            name: BENEFICIARY_LABELS[code] || code,
            value: val
          }))
        );
      }
    })();

    // 5) Occasions by Type
    (async () => {
      const { data, count, error } = await supabase
        .from('custom_requests')
        .select('occasion', { count: 'exact' });
      if (!error && data) {
        setTotalOccasions(count ?? 0);
        const tally: Record<string, number> = {};
        data.forEach(r => {
          if (!r.occasion) return;
          tally[r.occasion] = (tally[r.occasion] || 0) + 1;
        });
        setOccasionTypes(
          Object.entries(tally).map(([type, val]) => ({ name: type, value: val }))
        );
      }
    })();
  }, []);

  // Delete helpers
  const deleteRecipe = async (id: number, title: string) => {
    if (!window.confirm(`Delete recipe “${title}”?`)) return;
    try {
      await supabase.from('recipe_ratings').delete().eq('recipe_id', id);
      await supabase.from('comments').delete().eq('recipe_id', id);
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
      setLowRatedRecipes(r => r.filter(x => x.id !== id));
    } catch {
      alert('Failed to delete recipe.');
    }
  };

  const deleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Delete product “${name}”?`)) return;
    try {
      const { error } = await supabase.from('seller_products').delete().eq('id', id);
      if (error) throw error;
      setHighPriceProducts(p => p.filter(x => x.id !== id));
    } catch {
      alert('Failed to delete product.');
    }
  };

  // 6) Add Announcement handler
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      return alert('Title and message are required.');
    }
    setAdding(true);
    const { error } = await supabase
      .from('announcements')
      .insert([{
        title:   newTitle,
        message: newMessage,
        link:    newLink || null
      }]);
    setAdding(false);
    if (error) {
      console.error(error);
      return alert('Failed to add announcement.');
    }
    alert('Announcement added!');
    setNewTitle('');
    setNewMessage('');
    setNewLink('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white bg-orange-500 px-4 py-2 rounded-md">
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[ 
          { label: 'Total Users',     val: totalUsers,     color: 'text-blue-600' },
          { label: 'Total Chefs',     val: totalChefs,     color: 'text-purple-600' },
          { label: 'Total Sellers',   val: totalSellers,   color: 'text-green-600' },
          { label: 'Total Admins',    val: totalAdmins,    color: 'text-red-600' },
          { label: 'Total Donations', val: totalDonations, color: 'text-orange-600' },
          { label: 'Total Requests',  val: totalOccasions, color: 'text-pink-600' },
        ].map(c => (
          <div key={c.label} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500">{c.label}</h2>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Donations by Beneficiary */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Donations by Beneficiary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={donationBeneficiaryStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name}: ${(percent! * 100).toFixed(0)}%`
                }
              >
                {donationBeneficiaryStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occasions by Type */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Occasions by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={occasionTypes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Legend />
              <Bar dataKey="value">
                {occasionTypes.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add New Occasion */}
      <section className="mt-12 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Occasion</h3>
        <form
          onSubmit={async e => {
            e.preventDefault();
            const f = e.target as HTMLFormElement;
            const t = f.occasion_type  as HTMLInputElement;
            const o = f.occasion_options as HTMLInputElement;
            const occasionType = t.value.trim();
            const optionsArray = o.value.trim().split(',').map(s => s.trim());
            const slug = occasionType
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]/g, '');
            if (!occasionType || optionsArray.length === 0) {
              return alert('Please fill in all fields');
            }
            const { error } = await supabase.from('occasions').insert([{
              type: occasionType,
              name: occasionType,
              slug,
              options: optionsArray
            }]);
            if (error) {
              console.error(error);
              return alert('Failed to add occasion');
            }
            alert('Occasion added!');
            window.location.reload();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Occasion Title
            </label>
            <input
              name="occasion_type"
              type="text"
              className="mt-1 w-full border px-4 py-2 rounded"
              placeholder="e.g. Birthdays"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Options (comma-separated)
            </label>
            <input
              name="occasion_options"
              type="text"
              className="mt-1 w-full border px-4 py-2 rounded"
              placeholder="e.g. Cake, Juice, Jelly"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Add Occasion
          </button>
        </form>
      </section>

      {/* Add New Announcement */}
      <section className="mt-12 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BellIcon className="w-5 h-5 text-orange-500 mr-2" />
          Add New Announcement
        </h3>
        <form onSubmit={handleAddAnnouncement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="mt-1 w-full border px-4 py-2 rounded"
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="mt-1 w-full border px-4 py-2 rounded"
              rows={3}
              placeholder="What’s the announcement?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Link (optional)
            </label>
            <input
              type="url"
              value={newLink}
              onChange={e => setNewLink(e.target.value)}
              className="mt-1 w-full border px-4 py-2 rounded"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {adding ? 'Adding…' : 'Add Announcement'}
          </button>
        </form>
      </section>

      {/* Low-rated Recipes */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recipes ≤ 2.5 rating</h2>
        {lowRatedRecipes.length === 0 ? (
          <p className="text-gray-500">None found 🎉</p>
        ) : (
          <ul className="space-y-3">
            {lowRatedRecipes.map(r => (
              <li key={r.id} className="flex justify-between bg-white shadow p-4 rounded-lg">
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-gray-500">Rating: {r.avg_rating}</p>
                </div>
                <button
                  onClick={() => deleteRecipe(r.id, r.title)}
                  className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* High Price Products */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Seller Products ${HIGH_PRICE_LIMIT}+
        </h2>
        {highPriceProducts.length === 0 ? (
          <p className="text-gray-500">No overpriced products found.</p>
        ) : (
          <ul className="space-y-3">
            {highPriceProducts.map(p => (
              <li key={p.id} className="flex justify-between bg-white shadow p-4 rounded-lg">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">Price: ${p.price}</p>
                </div>
                <button
                  onClick={() => deleteProduct(p.id, p.name)}
                  className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
