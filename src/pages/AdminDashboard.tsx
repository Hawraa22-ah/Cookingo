import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, ScatterChart, Scatter
} from 'recharts';
import { Bell as BellIcon } from 'lucide-react';

const HIGH_PRICE_LIMIT = 100;
const COLORS = ['#f97316', '#8B5E3C', '#FFA500', '#d97706'];

const BENEFICIARY_LABELS = {
  street: 'Poor people on the street',
  orphans: 'Orphans',
  nursing: 'Nursing home',
};

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalChefs, setTotalChefs] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalDonationAmount, setTotalDonationAmount] = useState(0);
  const [totalOccasions, setTotalOccasions] = useState(0);

  const [donationBeneficiaryStats, setDonationBeneficiaryStats] = useState([]);
  const [occasionTypes, setOccasionTypes] = useState([]);
  const [favoritesStats, setFavoritesStats] = useState([]);
  const [topSeller, setTopSeller] = useState(null);
  const [topChef, setTopChef] = useState(null);

  const [signupStats, setSignupStats] = useState([]);
  const [topUsersByOrders, setTopUsersByOrders] = useState([]);
  const [topUsersByDishes, setTopUsersByDishes] = useState([]);
  const [topUsersByOccasions, setTopUsersByOccasions] = useState([]);
  const [topDonors, setTopDonors] = useState([]);

  const [orderedProductsStats, setOrderedProductsStats] = useState([]);

  const [lowRatedRecipes, setLowRatedRecipes] = useState([]);
  const [highPriceProducts, setHighPriceProducts] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newLink, setNewLink] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [adding, setAdding] = useState(false);

  // For per-category group summary
  const [allOccasions, setAllOccasions] = useState([]);

  useEffect(() => {
    // Roles
    (async () => {
      const { data, error } = await supabase.from('profiles').select('role');
      if (error) return;
      let u = 0, c = 0, s = 0, a = 0;
      data.forEach(r => {
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

    // Low rated recipes
    (async () => {
      const { data } = await supabase
        .from('recipes').select('id, title, avg_rating, meal_time, calories_level').lte('avg_rating', 2.5);
      setLowRatedRecipes(data || []);
    })();

    // High price products
    (async () => {
      const { data } = await supabase
        .from('seller_products').select('id, name, price, seller_id').gt('price', HIGH_PRICE_LIMIT);
      setHighPriceProducts(data || []);
    })();

    // Donations by beneficiary and total
    (async () => {
      const { data, count } = await supabase
        .from('donations').select('beneficiary,amount', { count: 'exact' });
      setTotalDonations(count || 0);
      // Per beneficiary
      const tally = {};
      let totalAmount = 0;
      (data || []).forEach(d => {
        if (!d.beneficiary) return;
        tally[d.beneficiary] = (tally[d.beneficiary] || 0) + (parseFloat(d.amount) || 0);
        totalAmount += parseFloat(d.amount) || 0;
      });
      setTotalDonationAmount(totalAmount);
      setDonationBeneficiaryStats(
        Object.entries(tally).map(([code, val]) => ({
          name: BENEFICIARY_LABELS[code] || code,
          value: val
        }))
      );
    })();

    // Top Donors
    (async () => {
      const { data } = await supabase
        .from('donations').select('user_id, amount').not('user_id', 'is', null);
      if (data) {
        const donorTotals = {};
        data.forEach(d => {
          const amt = Number(d.amount) || 0;
          donorTotals[d.user_id] = (donorTotals[d.user_id] || 0) + amt;
        });
        const topIds = Object.entries(donorTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const promises = topIds.map(async ([id, total]) => {
          const { data } = await supabase.from('profiles').select('username').eq('id', id).single();
          return { id, username: data?.username || id, total }
        });
        setTopDonors(await Promise.all(promises));
      }
    })();

    // Occasions statistics for bar chart (by name, count)
    (async () => {
      const { data, count } = await supabase.from('custom_requests').select('occasion', { count: 'exact' });
      setTotalOccasions(count || 0);
      const tally = {};
      (data || []).forEach(r => {
        if (!r.occasion) return;
        tally[r.occasion] = (tally[r.occasion] || 0) + 1;
      });
      setOccasionTypes(
        Object.entries(tally).map(([type, val]) => ({ name: type, value: val }))
      );
    })();

    // All occasions for per-category top type
    (async () => {
      // This assumes each row has at least 'type' (category) and 'name' (occasion type)
      const { data } = await supabase.from('occasions').select('type, name');
      setAllOccasions(data || []);
    })();

    // Favorite recipes
    (async () => {
      const { data } = await supabase
        .from('favorite_recipes')
        .select('recipe_id, recipes ( title )');
      const tally = {};
      (data || []).forEach((f) => {
        const title = f.recipes?.title ?? 'Unknown';
        tally[title] = (tally[title] || 0) + 1;
      });
      setFavoritesStats(
        Object.entries(tally).map(([recipe_title, value]) => ({ recipe_title, value }))
      );
    })();

    // Top seller (by products in seller_products)
    (async () => {
      const { data } = await supabase
        .from('seller_products').select('seller_id');
      if (data && data.length > 0) {
        const tally = {};
        data.forEach(p => { if (p.seller_id) tally[p.seller_id] = (tally[p.seller_id] || 0) + 1; });
        const topSellerId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
        if (topSellerId) {
          const [sellerId, count] = topSellerId;
          const { data: seller } = await supabase.from('profiles').select('username').eq('id', sellerId).single();
          setTopSeller({ id: sellerId, username: seller?.username || sellerId, count });
        }
      }
    })();

    // Top chef (by recipes)
    (async () => {
      const { data } = await supabase
        .from('recipes').select('chef_id');
      if (data && data.length > 0) {
        const tally = {};
        data.forEach(r => { if (r.chef_id) tally[r.chef_id] = (tally[r.chef_id] || 0) + 1; });
        const topChefId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
        if (topChefId) {
          const [chefId, count] = topChefId;
          const { data: chef } = await supabase.from('profiles').select('username').eq('id', chefId).single();
          setTopChef({ id: chefId, username: chef?.username || chefId, count });
        }
      }
    })();

    // New User Signups
    (async () => {
      const since = dayjs().subtract(29, 'day').startOf('day').toISOString();
      const { data } = await supabase
        .from('profiles').select('id, created_at').gte('created_at', since);
      const dateMap = {};
      for (let i = 29; i >= 0; i--) {
        const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        dateMap[d] = 0;
      }
      (data || []).forEach((u) => {
        const d = dayjs(u.created_at).format('YYYY-MM-DD');
        if (dateMap[d] !== undefined) dateMap[d]++;
      });
      setSignupStats(
        Object.entries(dateMap).map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    })();

    // Top 5 Users by Orders
    (async () => {
      const { data } = await supabase.from('orders').select('user_id').not('user_id', 'is', null);
      if (data) {
        const tally = {};
        data.forEach((o) => { tally[o.user_id] = (tally[o.user_id] || 0) + 1; });
        const topIds = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const promises = topIds.map(async ([id, count]) => {
          const { data } = await supabase.from('profiles').select('username').eq('id', id).single();
          return { id, username: data?.username || id, count };
        });
        setTopUsersByOrders(await Promise.all(promises));
      }
    })();

    // Top 5 Users by Ordered Dishes
    (async () => {
      const { data } = await supabase.from('daily_dish_orders').select('user_id').not('user_id', 'is', null);
      if (data) {
        const tally = {};
        data.forEach((o) => { tally[o.user_id] = (tally[o.user_id] || 0) + 1; });
        const topIds = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const promises = topIds.map(async ([id, count]) => {
          const { data } = await supabase.from('profiles').select('username').eq('id', id).single();
          return { id, username: data?.username || id, count };
        });
        setTopUsersByDishes(await Promise.all(promises));
      }
    })();

    // Top 5 Users by Ordered Occasions (users who send gifts)
    (async () => {
      const { data } = await supabase.from('custom_requests').select('user_id').not('user_id', 'is', null);
      if (data) {
        const tally = {};
        data.forEach((o) => { tally[o.user_id] = (tally[o.user_id] || 0) + 1; });
        const topIds = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const promises = topIds.map(async ([id, count]) => {
          const { data } = await supabase.from('profiles').select('username').eq('id', id).single();
          return { id, username: data?.username || id, count };
        });
        setTopUsersByOccasions(await Promise.all(promises));
      }
    })();

    // Ordered products stats (using seller_notifications)
    (async () => {
      const { data } = await supabase.from('seller_notifications').select('product_id,message');
      if (data) {
        // Count occurrences of each product_id
        const tally = {};
        data.forEach((n) => {
          if (!n.product_id) return;
          tally[n.product_id] = (tally[n.product_id] || 0) + 1;
        });
        const productIds = Object.keys(tally);
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('seller_products').select('id,name').in('id', productIds);
          if (products) {
            const stats = products.map((p) => ({
              name: p.name,
              count: tally[p.id] || 0
            }));
            setOrderedProductsStats(stats.sort((a, b) => b.count - a.count));
          }
        } else {
          setOrderedProductsStats([]);
        }
      }
    })();

  }, []);

  // Group occasions by type and find the most submitted name for each type/category
  const mostSubmittedByCategory = useMemo(() => {
    if (!allOccasions.length) return [];
    const tally = {};
    allOccasions.forEach(({ type, name }) => {
      if (!type || !name) return;
      if (!tally[type]) tally[type] = {};
      tally[type][name] = (tally[type][name] || 0) + 1;
    });
    // For each type/category, find the top occasion type (name)
    return Object.entries(tally).map(([type, nameCounts]) => {
      let max = 0;
      let topName = '';
      Object.entries(nameCounts).forEach(([n, c]) => {
        if (c > max) {
          max = c;
          topName = n;
        }
      });
      return { type, name: topName, count: max };
    });
  }, [allOccasions]);

  // Announcement handler
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      return alert('Title and message are required.');
    }
    setAdding(true);
    const { error } = await supabase
      .from('announcements')
      .insert([{
        title: newTitle,
        message: newMessage,
        link: newLink || null,
        target_audience: targetAudience,
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
    setTargetAudience('all');
  };

  // Dummy delete handlers (add your logic as needed)
  const deleteRecipe = (id, title) => {
    alert(`Delete recipe "${title}" (id: ${id})`);
  };
  const deleteProduct = (id, name) => {
    alert(`Delete product "${name}" (id: ${id})`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white bg-orange-500 px-4 py-2 rounded-md">
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Users', val: totalUsers, color: 'text-blue-600' },
          { label: 'Total Chefs', val: totalChefs, color: 'text-purple-600' },
          { label: 'Total Sellers', val: totalSellers, color: 'text-green-600' },
          { label: 'Total Admins', val: totalAdmins, color: 'text-red-600' },
          // { label: 'Total Donations', val: totalDonations, color: 'text-orange-600' },
          // { label: 'Total Occasions', val: totalOccasions, color: 'text-pink-600' },
        ].map(c => (
          <div key={c.label} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500">{c.label}</h2>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 shadow rounded-lg col-span-1">
          <h3 className="text-lg font-semibold mb-4">New User Signups (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={signupStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={d => dayjs(d).format('MM/DD')} />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Signups" stroke="#f97316" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      {/* Top Chef and Seller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
  {/* Top Chef */}
  <div className="bg-white p-6 shadow rounded-lg text-center">
    <h3 className="text-2xl font-bold mb-2 text-orange-500 flex items-center justify-center gap-2">
      <span role="img" aria-label="trophy">🏆</span>
      TOP CHEF
    </h3>
    {topChef ? (
      <>
        <div className="text-xl font-bold text-orange-600 flex items-center justify-center gap-2">
          {topChef.username}
          <span role="img" aria-label="medal">👨‍🍳</span>
        </div>
        <div className="mt-2 text-lg font-semibold">
          Recipes: {topChef.count}
        </div>
      </>
    ) : (
      <div className="text-gray-500">No data.</div>
    )}
  </div>

  {/* Top Seller */}
  <div className="bg-white p-6 shadow rounded-lg text-center">
    <h3 className="text-2xl font-bold mb-2 text-orange-500 flex items-center justify-center gap-2">
      <span role="img" aria-label="trophy">🏆</span>
      TOP SELLER
    </h3>
    {topSeller ? (
      <>
        <div className="text-xl font-bold text-orange-600 flex items-center justify-center gap-2">
          {topSeller.username}
          <span role="img" aria-label="medal">🏅</span>
        </div>
        <div className="mt-2 text-lg font-semibold">
          Products: {topSeller.count}
        </div>
      </>
    ) : (
      <div className="text-gray-500">No data.</div>
    )}
  </div>
</div>


      {/* Top Users Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Top by Orders */}
        <div className="bg-white p-6 shadow rounded-lg col-span-1">
          <h3 className="text-3xl font-bold mb-4">Top 5 Users by Orders</h3>
          <table className="w-full text-left border">
            <thead>
              <tr><th>#</th><th>Username</th><th>Orders</th></tr>
            </thead>
            <tbody>
              {topUsersByOrders.map((u, idx) => (
                <tr key={u.id}><td>{idx + 1}</td><td>{u.username}</td><td>{u.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Top by Ordered Dishes */}
        <div className="bg-white p-6 shadow rounded-lg col-span-1">
          <h3 className="text-3xl font-semibold mb-4">Top 5 Users by Ordered Dishes</h3>
          <table className="w-full text-left border">
            <thead>
              <tr><th>#</th><th>Username</th><th>Dishes</th></tr>
            </thead>
            <tbody>
              {topUsersByDishes.map((u, idx) => (
                <tr key={u.id}><td>{idx + 1}</td><td>{u.username}</td><td>{u.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Top by Ordered Occasions */}
        <div className="bg-white p-6 shadow rounded-lg col-span-1">
          <h3 className="text-3xl font-semibold mb-4">Top 5 by Ordered Occasions</h3>
          <table className="w-full text-left border">
            <thead>
              <tr><th>#</th><th>Username</th><th>Occasions</th></tr>
            </thead>
            <tbody>
              {topUsersByOccasions.map((u, idx) => (
                <tr key={u.id}><td>{idx + 1}</td><td>{u.username}</td><td>{u.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Signups (lonely) */}
        
      </div>

      


      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Donations */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-3xl font-semibold mb-4">Donations by Beneficiary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={donationBeneficiaryStats}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%" outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {donationBeneficiaryStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xl text-center font-bold text-orange-600">
            Total Amount Donated: ${totalDonationAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        {/* Occasions by Type */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-3xl font-semibold mb-4">Occasions by Type</h3>
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
          {/* {mostSubmittedByCategory.length > 0 && (
            <div className="mt-4 text-base text-center font-bold text-orange-600">
              {mostSubmittedByCategory.map(({ type, name, count }) => (
                <div key={type}>
                  <span className="font-semibold">{type}:</span> {name} ({count} submissions)
                </div>
              ))}
            </div>
          )} */}
        </div>
      </div>

      {/* Ordered Products & Favorite Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 shadow rounded-lg h-full flex flex-col">
          <h3 className="text-3xl font-semibold mb-4">Order Products (Times Ordered)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={orderedProductsStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="count" name="Times Ordered">
                  {orderedProductsStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 shadow rounded-lg h-full flex flex-col">
          <h3 className="text-3xl font-semibold mb-4">Favorite Recipes</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recipe_title" name="Recipe Title" />
                <YAxis dataKey="value" name="Number of Saves" allowDecimals={false} />
                <ReTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Saves" data={favoritesStats} fill="#f97316" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add New Occasion */}
      <section className="mt-12 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Occasion</h3>
        <form
          onSubmit={async e => {
            e.preventDefault();
            const f = e.target;
            const t = f.occasion_type;
            const o = f.occasion_options;
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
            <label className="block text-sm font-medium text-gray-700">Occasion Title</label>
            <input
              name="occasion_type"
              type="text"
              className="mt-1 w-full border px-4 py-2 rounded"
              placeholder="e.g. Birthdays"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Options (comma-separated)</label>
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
          >Add Occasion</button>
        </form>
      </section>

      {/* Add New Announcement */}
      <section className="mt-12 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BellIcon className="w-5 h-5 text-orange-500 mr-2" /> Add New Announcement
        </h3>
        <form onSubmit={handleAddAnnouncement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="mt-1 w-full border px-4 py-2 rounded" placeholder="Announcement title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} className="mt-1 w-full border px-4 py-2 rounded" rows={3} placeholder="What’s the announcement?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link (optional)</label>
            <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} className="mt-1 w-full border px-4 py-2 rounded" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Send to</label>
            <select
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              className="mt-1 w-full border px-4 py-2 rounded"
            >
              <option value="all">All Users</option>
              <option value="seller">Sellers Only</option>
              <option value="chef">Chefs Only</option>
            </select>
          </div>
          <button type="submit" disabled={adding} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50">
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
                <button onClick={() => deleteRecipe(r.id, r.title)} className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* High Price Products */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Seller Products ${HIGH_PRICE_LIMIT}+</h2>
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
                <button onClick={() => deleteProduct(p.id, p.name)} className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
