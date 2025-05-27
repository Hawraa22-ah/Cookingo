import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedRecipes from '../components/home/FeaturedRecipes';
import DailyDishSection from '../components/home/DailyDishSection';
import CategoriesSection from '../components/home/CategoriesSection';
import { getAllRecipes, getDailyDishes } from '../data/recipes';

const HomePage: React.FC = () => {
  const recipes = getAllRecipes();
  const dailyDishes = getDailyDishes();
  
  return (
    <div>
      <HeroSection />
      <FeaturedRecipes recipes={recipes} />
      <DailyDishSection dailyDish={dailyDishes[0]} />
      <CategoriesSection />
    </div>
  );
};

export default HomePage;