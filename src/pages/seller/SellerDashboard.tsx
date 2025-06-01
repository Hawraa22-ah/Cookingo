import { useEffect, useState } from 'react';
import { supabase } from "../../lib/supabase";
import { useNavigate } from 'react-router-dom';



export default function SellerDashboard() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'vegetables', image_url: '' });
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', price: '', category: '' });
  const navigate = useNavigate();

  const categories = ['vegetables', 'ingredients', 'spices', 'tools'];

  useEffect(() => {
    const checkRole = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        navigate('/login');
        return;
      }

      if (user.user_metadata.role !== 'seller') {
        navigate('/unauthorized');
        return;
      }

      setUsername(user.user_metadata.username);
      setUserId(user.id);
    };

    checkRole();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('seller_products')
      .select('*')
      .eq('seller_id', userId);

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProducts();
    }
  }, [userId]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please enter a name and price.');
      return;
    }

    const { error } = await supabase
      .from('seller_products')
      .insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image_url: newProduct.image_url,
          seller_id: userId,
        },
      ]);

    if (error) {
      alert('Failed to add product');
      console.error(error);
    } else {
      setNewProduct({ name: '', price: '', category: 'vegetables', image_url: '' });
      fetchProducts();
    }
  };

  const getCategoryCount = (category) => {
    return products.filter(p => p.category === category).length;
  };

  const getCategorySample = (category, count = 2) => {
    return products.filter(p => p.category === category).slice(0, count);
  };

  const totalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
  const highestPrice = Math.max(0, ...products.map(p => parseFloat(p.price)));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-orange-600">Seller Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome back, {username}! Manage your kitchen products here.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-sm text-gray-500">Total Products</h3>
          <p className="text-xl font-semibold">{products.length}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-sm text-gray-500">Total Categories</h3>
          <p className="text-xl font-semibold">{[...new Set(products.map(p => p.category))].length}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-sm text-gray-500">Average Price</h3>
          <p className="text-xl font-semibold">${(totalPrice / (products.length || 1)).toFixed(2)}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-sm text-gray-500">Highest Priced</h3>
          <p className="text-xl font-semibold">${highestPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">🛒 Add New Product</h2>

        <input
          type="text"
          placeholder="Product Image URL from Supabase"
          className="w-full mb-2 p-2 border rounded"
          value={newProduct.image_url}
          onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
        />
        <input
          type="text"
          placeholder="Product name"
          className="w-full mb-2 p-2 border rounded"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price (e.g. 5.99)"
          className="w-full mb-2 p-2 border rounded"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <select
          className="w-full mb-4 p-2 border rounded"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={addProduct}
          className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">🛍️ Mini Market Preview</h2>
        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <h3 className="font-medium mb-2">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
            <div className="grid grid-cols-2 gap-3">
              {getCategorySample(cat).map((p) => (
                <div key={p.id} className="border p-3 rounded">
                  {p.image_url && <img src={p.image_url} alt="product" className="h-24 w-full object-cover mb-2 rounded" />}
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">${p.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
