import React, { useEffect, useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedRecipes from '../components/home/FeaturedRecipes';
import DailyDishSection from '../components/home/DailyDishSection';
import CategoriesSection from '../components/home/CategoriesSection';
import { supabase } from '../lib/supabase';

const HomePage: React.FC = () => {
  const [latestRecipes, setLatestRecipes] = useState([]);
  const [dailyDishes, setDailyDishes] = useState([]);

  useEffect(() => {
    const fetchLatestRecipes = async () => {
      const { data, error } = await supabase
        .from('recipes')
        // .select('id, title, description, image_url, tags, created_at, status')
        .select(`
            *,
            chef:profiles!fk_chef (
              id,
              username
            )
          `).
        eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Failed to fetch recipes:', error.message);
      } else {
        setLatestRecipes(data || []);
      }
    };

    const fetchDailyDishes = async () => {
      const { data, error } = await supabase
        .from('daily_dishes')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Failed to fetch daily dish:', error.message);
      } else {
        setDailyDishes(data || []);
      }
    };

    fetchLatestRecipes();
    fetchDailyDishes();
  }, []);

  return (
    <div>
      <HeroSection />

      {/* ✅ How Cookingo Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Why Cookingo?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A platform that connects food enthusiasts with talented chefs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl text-orange-500">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chef Creates Dishes
              </h3>
              <p className="text-gray-600">
                Talented chefs prepare their specialties and share their best recipes with you.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl text-orange-500">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Browse Daily Menu
              </h3>
              <p className="text-gray-600">
                Explore a variety of dishes updated daily by our chefs, ready for your selection.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl text-orange-500">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Enjoy Great Food
              </h3>
              <p className="text-gray-600">
                Follow recipes to cook at home or order dishes prepared by professional chefs.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ✅ End How Cookingo Works */}

      {/* ✅ Featured Latest 3 Recipes */}
      <FeaturedRecipes recipes={latestRecipes} />

      {/* ✅ Daily Dish */}
      {dailyDishes[0] && <DailyDishSection dailyDish={dailyDishes[0]} />}

      <CategoriesSection />
    </div>
  );
};

export default HomePage;
