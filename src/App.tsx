import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import DailyDishPage from './pages/DailyDishPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ChefDashboardPage from './pages/ChefDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';  // ← import useAuth
import SellerDashboard from './pages/seller/SellerDashboard';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import SavedRecipes from './components/recipes/SavedRecipes';
import AdminDashboard from './pages/AdminDashboard';
import Donation from './pages/Donation';
import OccasionsPage from './pages/OccasionsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ChefOccasionRequestsSection from './components/profile/ChefOccasionRequestsSection';
import CartSection from './components/cart/CartSection'; // Adjust the path accordingly
import SellerNotificationsSection from './components/profile/SellerNotificationsSection';

function ChatWidgetLoader() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;                // ← only load script if logged in
    if (document.querySelector('script[data-df]')) {
      setReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
    s.async = true;
    s.setAttribute('data-df', 'true');
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, [user]);

  if (!user || !ready) return null;

  return (
    <df-messenger
      intent="WELCOME"
      chat-title="chef-chat"
      agent-id="f50305c3-a6c0-4e59-8b51-8b454dfe513a"
      language-code="en"
    ></df-messenger>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="recipes/:id" element={<RecipeDetailPage />} />
            <Route path="daily-dish" element={<DailyDishPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="chef/dashboard" element={<ChefDashboardPage />} />
            <Route path="seller/dashboard" element={<SellerDashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/saved-recipes" element={<SavedRecipes />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/occasions" element={<OccasionsPage />} />
            <Route path="/donation" element={<Donation />} />
            <Route path="/profile/announcements" element={<AnnouncementsPage />} />
            <Route path="/chef/requests" element={<ChefOccasionRequestsSection />}/>
            <Route path="/cart" element={<CartSection />} />
            <Route path="/profile/seller-notifications" element={<SellerNotificationsSection />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

        {/* Only logged-in users get the chat widget */}
        <ChatWidgetLoader />
      </AuthProvider>
    </Router>
  );
}

export default App;
