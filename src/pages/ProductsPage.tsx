import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('seller_products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
  };

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  const addToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const quantity = quantities[productId] || 1;

    const { error } = await supabase
      .from('shopping_cart')
      .insert([{ user_id: user.id, product_id: productId, quantity }]);

    if (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart.');
    } else {
      alert('Product added to cart!');
    }
  };

  const filteredProducts =
    categoryFilter === 'all'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === categoryFilter);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">🛒 Products for Kitchen</h1>

      <div className="mb-6">
        <label className="text-sm font-medium mr-2">Filter by Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="all">All</option>
          <option value="tools">Tools</option>
          <option value="vegetables">Vegetables</option>
          <option value="spices">Spices</option>
          <option value="ingredients">Ingredients</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 items-start">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-48 h-48 object-cover rounded"
                />
              )}

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-500 capitalize mb-1">{product.category}</p>
                <p className="text-orange-600 font-semibold mb-1 text-lg">${product.price.toFixed(2)}</p>

                {/* Quantity Input */}
                <div className="flex items-center gap-2 mb-3">
                  <label htmlFor={`qty-${product.id}`} className="text-sm">
                    Qty:
                  </label>
                  <input
                    id={`qty-${product.id}`}
                    type="number"
                    min={1}
                    max={product.stock || 1}
                    className="border px-2 py-1 w-20 text-sm rounded"
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      setQuantities({
                        ...quantities,
                        [product.id]: Math.max(1, Math.min(product.stock, parseInt(e.target.value))),
                      })
                    }
                    disabled={product.stock <= 0}
                  />
                </div>

                <button
                  onClick={() => addToCart(product.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.stock <= 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
