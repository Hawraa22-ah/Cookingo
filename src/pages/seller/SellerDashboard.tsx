import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
}

interface NewProduct {
  name: string;
  price: string;
  category: string;
  image_url: string;
}

interface EditValues extends NewProduct {}

const CATEGORIES = ['vegetables', 'ingredients', 'spices', 'tools'] as const;

export default function SellerDashboard() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('Seller');
  const [products, setProducts] = useState<Product[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    price: '',
    category: CATEGORIES[0],
    image_url: '',
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({
    name: '',
    price: '',
    category: CATEGORIES[0],
    image_url: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | typeof CATEGORIES[number]>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return navigate('/login');
      setUsername(user.user_metadata.username ?? 'Seller');
      setUserId(user.id);
    })();
  }, [navigate]);

  const fetchProducts = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('seller_products')
      .select<Product[]>('*')
      .eq('seller_id', userId);
    if (error) console.error('Error loading products:', error);
    setProducts(data ?? []);
  }, [userId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price.trim()) {
      return alert('Name and price are required.');
    }

    const { data, error } = await supabase
      .from('seller_products')
      .insert([
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
          seller_id: userId,
        },
      ])
      .select();

    if (error || !data || !data[0]) {
      console.error(error);
      return alert('Failed to add product.');
    }

    setProducts(prev => [...prev, data[0]]);
    setNewProduct({ name: '', price: '', category: CATEGORIES[0], image_url: '' });
    setSuccessMessage('✅ Product added successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setEditValues({
      name: p.name,
      price: p.price.toString(),
      category: p.category,
      image_url: p.image_url ?? '',
    });
  };

  const saveEdit = async () => {
    if (!editId || !editValues.name.trim() || !editValues.price.trim()) {
      return alert('Name and price are required.');
    }

    const { error } = await supabase
      .from('seller_products')
      .update({
        ...editValues,
        price: parseFloat(editValues.price),
      })
      .eq('id', editId)
      .eq('seller_id', userId!);

    if (error) {
      console.error(error);
      return alert('Failed to update product.');
    }

    setEditId(null);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;

    const { error } = await supabase
      .from('seller_products')
      .delete()
      .eq('id', id)
      .eq('seller_id', userId!);

    if (error) {
      console.error(error);
      return alert(`Delete failed: ${error.message}`);
    }

    setProducts(prev => prev.filter((p) => p.id !== id));
  };

  const filteredProducts = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return products.filter((p) => {
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchesSearch = p.name.toLowerCase().includes(lower);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, filterCategory]);

  const totalPrice = useMemo(() => products.reduce((s, p) => s + p.price, 0), [products]);
  const highestPrice = useMemo(() => Math.max(0, ...products.map((p) => p.price)), [products]);

  const renderProductCard = (p: Product) => (
    <div key={p.id} className="border p-4 rounded bg-gray-50">
      {editId === p.id ? (
        <>
          <input className="w-full mb-1 p-1 border rounded" value={editValues.name}
            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} placeholder="Name" />
          <input type="number" className="w-full mb-1 p-1 border rounded" value={editValues.price}
            onChange={(e) => setEditValues({ ...editValues, price: e.target.value })} placeholder="Price" />
          <input className="w-full mb-1 p-1 border rounded" value={editValues.image_url}
            onChange={(e) => setEditValues({ ...editValues, image_url: e.target.value })} placeholder="Image URL" />
          <select className="w-full mb-2 p-1 border rounded" value={editValues.category}
            onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
            <button onClick={() => startEdit(p)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
            <button onClick={() => deleteProduct(p.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-orange-600">Seller Dashboard</h1>
      <p className="text-gray-600 mb-4">Welcome back, {username}! Manage your kitchen products here.</p>

      {successMessage && (
        <div className="bg-green-100 text-green-800 font-medium p-3 rounded mb-4 shadow">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Products" value={products.length} />
        <SummaryCard label="Total Categories" value={new Set(products.map((p) => p.category)).size} />
        <SummaryCard label="Average Price" value={`$${(totalPrice / Math.max(products.length, 1)).toFixed(2)}`} />
        <SummaryCard label="Highest Priced" value={`$${highestPrice.toFixed(2)}`} />
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">🛒 Add New Product</h2>
        <input className="w-full mb-2 p-2 border rounded" placeholder="Product Image URL"
          value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} />
        <input className="w-full mb-2 p-2 border rounded" placeholder="Product name"
          value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
        <input type="number" className="w-full mb-2 p-2 border rounded" placeholder="Price (e.g. 5.99)"
          value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
        <select className="w-full mb-4 p-2 border rounded"
          value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
        </select>
        <button onClick={addProduct} className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600">
          Add Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <input className="p-2 border rounded w-full md:w-1/2" placeholder="Search by product name..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select className="p-2 border rounded w-full md:w-1/3"
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">🛍️ Filtered Market Preview</h2>
        {CATEGORIES.map((cat) => {
          const catProducts = filteredProducts.filter((p) => p.category === cat);
          if (catProducts.length === 0) return null;
          return (
            <section key={cat} className="mb-8">
              <h3 className="text-lg font-bold text-orange-600 mb-2">{cat[0].toUpperCase() + cat.slice(1)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catProducts.map(renderProductCard)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

interface SummaryProps {
  label: string;
  value: string | number;
}
function SummaryCard({ label, value }: SummaryProps) {
  return (
    <div className="bg-white shadow p-4 rounded">
      <h3 className="text-sm text-gray-500">{label}</h3>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
