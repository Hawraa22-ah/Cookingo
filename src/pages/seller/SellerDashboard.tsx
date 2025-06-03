import { useEffect, useState } from 'react'; 
import { supabase } from "../../lib/supabase";
import { useNavigate } from 'react-router-dom';

export default function SellerDashboard() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'vegetables', image_url: '' });
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', price: '', category: '', image_url: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();

  const categories = ['vegetables', 'ingredients', 'spices', 'tools'];

  useEffect(() => {
    const checkRole = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return navigate('/login');
      if (user.user_metadata.role !== 'seller') return navigate('/unauthorized');

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
    if (userId) fetchProducts();
  }, [userId]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please enter a name and price.');
      return;
    }

    const { error } = await supabase.from('seller_products').insert([
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

  const editProduct = (product) => {
    setEditId(product.id);
    setEditValues({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
    });
  };

  const saveEdit = async () => {
    if (!editValues.name || !editValues.price) {
      alert('Please fill out all fields.');
      return;
    }

    const { error } = await supabase
      .from('seller_products')
      .update({
        name: editValues.name,
        price: parseFloat(editValues.price),
        category: editValues.category,
        image_url: editValues.image_url,
      })
      .eq('id', editId)
      .eq('seller_id', userId);

    if (error) {
      console.error('Failed to update product:', error);
      alert('Update failed.');
    } else {
      setEditId(null);
      setEditValues({ name: '', price: '', category: '', image_url: '' });
      fetchProducts();
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('seller_products')
      .delete()
      .eq('id', id)
      .eq('seller_id', userId);

    if (error) {
      console.error("Supabase delete error:", error);
      alert("Delete failed: " + error.message);
    } else {
      alert("Product deleted successfully.");
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const totalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
  const highestPrice = Math.max(0, ...products.map(p => parseFloat(p.price)));

  // Filter logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-orange-600">Seller Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome back, {username}! Manage your kitchen products here.</p>

      {/* Summary */}
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

      {/* Add Product */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">🛒 Add New Product</h2>
        <input
          type="text"
          placeholder="Product Image URL"
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
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <button
          onClick={addProduct}
          className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        >
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full md:w-1/2"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Product List Grouped by Category */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">🛍️ Filtered Market Preview</h2>
        {categories.map((cat) => {
          const catProducts = filteredProducts.filter(p => p.category === cat);
          if (catProducts.length === 0) return null;
          return (
            <div key={cat} className="mb-6">
              <h3 className="text-lg font-bold text-orange-600 mb-2">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catProducts.map((p) => (
                  <div key={p.id} className="border p-4 rounded bg-gray-50">
                    {editId === p.id ? (
                      <>
                        <input
                          type="text"
                          className="w-full mb-1 p-1 border rounded"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        />
                        <input
                          type="number"
                          className="w-full mb-1 p-1 border rounded"
                          value={editValues.price}
                          onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                        />
                        <input
                          type="text"
                          className="w-full mb-1 p-1 border rounded"
                          value={editValues.image_url}
                          onChange={(e) => setEditValues({ ...editValues, image_url: e.target.value })}
                        />
                        <select
                          className="w-full mb-2 p-1 border rounded"
                          value={editValues.category}
                          onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                          <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        {p.image_url && <img src={p.image_url} alt={p.name} className="h-24 w-full object-cover rounded mb-2" />}
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-sm text-gray-600 mb-2">${p.price.toFixed(2)}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editProduct(p)}
                            className="bg-[#FFB347] hover:bg-orange-300 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="bg-[#B0E57C] hover:bg-green-300 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
