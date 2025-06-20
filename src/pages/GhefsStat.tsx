// import React, { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend,
// } from 'recharts';

// interface ChefStatsProps {
//   userId: string;
// }

// const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fecaca'];

// const ChefStats: React.FC<ChefStatsProps> = ({ userId }) => {
//   const [totalDishes, setTotalDishes] = useState(0);
//   const [totalRecipes, setTotalRecipes] = useState(0);
//   const [totalSales, setTotalSales] = useState(0);
//   const [averagePrice, setAveragePrice] = useState(0);
//   const [mostPopularDish, setMostPopularDish] = useState<string>('N/A');
//   const [monthlyBookings, setMonthlyBookings] = useState<any[]>([]);
//   const [dishCategoryData, setDishCategoryData] = useState<any[]>([]);
//   const [totalUpdates, setTotalUpdates] = useState(0);

//   useEffect(() => {
//     const fetchStats = async () => {
//       // 1. Total dishes
//       const { count: dishesCount } = await supabase
//         .from('dishes')
//         .select('*', { count: 'exact', head: true })
//         .eq('chef_id', userId);
//       setTotalDishes(dishesCount || 0);

//       // 2. Total recipes
//       const { count: recipesCount } = await supabase
//         .from('recipes')
//         .select('*', { count: 'exact', head: true })
//         .eq('chef_id', userId);
//       setTotalRecipes(recipesCount || 0);

//       // 3. Get dish info
//       const { data: dishes } = await supabase
//         .from('dishes')
//         .select('id, title, price')
//         .eq('chef_id', userId);

//       const dishMap = new Map<string, { title: string; price: number }>();
//       let totalPrice = 0;

//       if (dishes) {
//         for (const d of dishes) {
//           dishMap.set(d.id, { title: d.title, price: d.price });
//           totalPrice += d.price || 0;
//         }
//         setAveragePrice(dishes.length > 0 ? totalPrice / dishes.length : 0);
//       }

//       // 4. Bookings / orders
//       const { data: orders } = await supabase
//         .from('daily_dish_orders')
//         .select('dish_id, quantity, delivery_date')
//         .in('dish_id', [...dishMap.keys()]);

//       if (orders && orders.length > 0) {
//         let sales = 0;
//         const monthMap: Record<string, number> = {};
//         const dishCountMap: Record<string, number> = {};

//         for (const order of orders) {
//           const dish = dishMap.get(order.dish_id);
//           if (!dish) continue;

//           const revenue = dish.price * (order.quantity || 1);
//           sales += revenue;

//           const month = new Date(order.delivery_date)
//             .toLocaleString('default', { month: 'short' });
//           monthMap[month] = (monthMap[month] || 0) + 1;

//           dishCountMap[dish.title] = (dishCountMap[dish.title] || 0)
//             + (order.quantity || 1);
//         }

//         setTotalSales(sales);

//         const sortedDishes = Object.entries(dishCountMap)
//           .sort((a, b) => b[1] - a[1]);
//         setMostPopularDish(sortedDishes[0]?.[0] || 'N/A');

//         setMonthlyBookings(
//           Object.entries(monthMap).map(([month, count]) => ({ month, count }))
//         );
//         setDishCategoryData(
//           Object.entries(dishCountMap).map(([name, value]) => ({ name, value }))
//         );
//       }

//       // 5. Total Impact Updates
//       const { count: updatesCount } = await supabase
//         .from('impact_updates')
//         .select('id', { count: 'exact', head: true });
//       setTotalUpdates(updatesCount || 0);
//     };

//     fetchStats();
//   }, [userId]);

//   return (
//     <div className="space-y-10">
//       {/* Statistic Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         <div className="bg-white shadow rounded-xl p-4">
//           <h4 className="text-sm text-gray-500">Total Dishes</h4>
//           <p className="text-2xl font-bold text-orange-600">{totalDishes}</p>
//         </div>
//         <div className="bg-white shadow rounded-xl p-4">
//           <h4 className="text-sm text-gray-500">Total Recipes</h4>
//           <p className="text-2xl font-bold text-orange-600">{totalRecipes}</p>
//         </div>
//         <div className="bg-white shadow rounded-xl p-4">
//           <h4 className="text-sm text-gray-500">Total Sales</h4>
//           <p className="text-2xl font-bold text-orange-600">
//             ${totalSales.toFixed(2)}
//           </p>
//         </div>
//         <div className="bg-white shadow rounded-xl p-4">
//           <h4 className="text-sm text-gray-500">Average Dish Price</h4>
//           <p className="text-2xl font-bold text-orange-600">
//             ${averagePrice.toFixed(2)}
//           </p>
//         </div>
//         <div className="bg-white shadow rounded-xl p-4">
//           <h4 className="text-sm text-gray-500">Total Donations</h4>
//           <p className="text-2xl font-bold text-orange-600">
//             {totalUpdates}
//           </p>
//         </div>
//         {/* <div className="bg-white shadow rounded-xl p-4 col-span-1 sm:col-span-2 lg:col-span-3">
//           <h4 className="text-sm text-gray-500">Most Popular Dish</h4>
//           <p className="text-xl font-semibold text-orange-700">
//             {mostPopularDish}
//           </p>
//         </div> */}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Bar Chart */}
//         <div className="bg-white rounded-xl shadow p-4">
//           <h3 className="text-lg font-bold text-gray-700 mb-2">
//             Monthly Bookings
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={monthlyBookings}>
//               <XAxis dataKey="month" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Bar dataKey="count" fill="#fb923c" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Pie Chart */}
//         <div className="bg-white rounded-xl shadow p-4">
//           <h3 className="text-lg font-bold text-gray-700 mb-2">
//             Dish Popularity
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={dishCategoryData}
//                 dataKey="value"
//                 nameKey="name"
//                 outerRadius={100}
//                 label
//               >
//                 {dishCategoryData.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={COLORS[index % COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChefStats;
// src/components/GhefsStat.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ChefStatsProps {
  userId: string;
}

interface Booking {
  name: string;
  count: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fecaca'];

const ChefStats: React.FC<ChefStatsProps> = ({ userId }) => {
  const [totalDishes, setTotalDishes] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [mostPopularDish, setMostPopularDish] = useState<string>('N/A');
  const [monthlyBookings, setMonthlyBookings] = useState<Booking[]>([]);
  const [dishCategoryData, setDishCategoryData] = useState<CategoryData[]>([]);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // ── 1) TOTAL DISHES ─────────────────────────────────────────
      const { count: dishesCount } = await supabase
        .from('dishes')
        .select('*', { count: 'exact', head: true })
        .eq('chef_id', userId);
      setTotalDishes(dishesCount || 0);

      // ── 2) TOTAL RECIPES ───────────────────────────────────────
      const { count: recipesCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('chef_id', userId);
      setTotalRecipes(recipesCount || 0);

      // ── 3) LOAD DISH INFO ──────────────────────────────────────
      //    We need name & price for each dish
      const { data: dishes } = await supabase
        .from<{ id: string; name: string; price: number }>('dishes')
        .select('id, name, price')
        .eq('chef_id', userId);

      const dishMap = new Map<string, { name: string; price: number }>();
      let priceSum = 0;
      if (dishes) {
        dishes.forEach(d => {
          dishMap.set(d.id, { name: d.name, price: d.price });
          priceSum += d.price;
        });
        setAveragePrice(dishes.length > 0 ? priceSum / dishes.length : 0);
      }

      // ── 4) LOAD ORDERS & AGGREGATE ─────────────────────────────
      const { data: orders } = await supabase
        .from<{
          dish_id: string;
          quantity: number | null;
          delivery_date: string;
        }>('daily_dish_orders')
        .select('dish_id, quantity, delivery_date')
        .in('dish_id', [...dishMap.keys()]);

      // Prepare date bounds for THIS MONTH
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const dishCountMap: Record<string, number> = {};
      let sales = 0;

      if (orders) {
        orders.forEach(o => {
          const qty = o.quantity || 1;
          const dish = dishMap.get(o.dish_id);
          if (!dish) return;

          // Count this order toward sales (all time)
          sales += dish.price * qty;

          // Only count for booking charts if in this month
          const del = new Date(o.delivery_date);
          if (del >= startOfMonth && del <= endOfMonth) {
            dishCountMap[dish.name] = (dishCountMap[dish.name] || 0) + qty;
          }
        });
      }

      setTotalSales(sales);

      // Build arrays for charts
      const bookingsArray: Booking[] = Object.entries(dishCountMap).map(
        ([name, count]) => ({ name, count })
      );
      setMonthlyBookings(bookingsArray);

      const categoryArray: CategoryData[] = bookingsArray.map(b => ({
        name: b.name,
        value: b.count,
      }));
      setDishCategoryData(categoryArray);

      // Determine most popular dish this month
      const sorted = bookingsArray.sort((a, b) => b.count - a.count);
      setMostPopularDish(sorted[0]?.name || 'N/A');

      // ── 5) TOTAL DONATIONS/UPDATES ─────────────────────────────
      const { count: updatesCount } = await supabase
        .from('impact_updates')
        .select('id', { count: 'exact', head: true });
      setTotalUpdates(updatesCount || 0);

      setLoading(false);
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return <p className="p-4 text-center">Loading statistics…</p>;
  }

  return (
    <div className="space-y-10">
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-xl p-4">
          <h4 className="text-sm text-gray-500">Total Dishes</h4>
          <p className="text-2xl font-bold text-orange-600">{totalDishes}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h4 className="text-sm text-gray-500">Total Recipes</h4>
          <p className="text-2xl font-bold text-orange-600">{totalRecipes}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h4 className="text-sm text-gray-500">Total Sales</h4>
          <p className="text-2xl font-bold text-orange-600">
            ${totalSales.toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h4 className="text-sm text-gray-500">Average Dish Price</h4>
          <p className="text-2xl font-bold text-orange-600">
            ${averagePrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h4 className="text-sm text-gray-500">Total Donations</h4>
          <p className="text-2xl font-bold text-orange-600">{totalUpdates}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h4 className="text-sm text-gray-500">Top Dish This Month</h4>
          <p className="text-xl font-semibold text-orange-700">
            {mostPopularDish}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart: Bookings per Dish this Month */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            Monthly Bookings by Dish
          </h3>
          {monthlyBookings.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyBookings}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#fb923c"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No bookings yet this month.</p>
          )}
        </div>

        {/* Pie Chart: Relative Popularity this Month */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            Dish Popularity
          </h3>
          {dishCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dishCategoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {dishCategoryData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No data to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefStats;
