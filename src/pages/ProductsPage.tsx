import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('seller_products')
      .select(`
        *,
        seller:profiles!seller_products_seller_id_fkey (
          id,
          username
        )
      `)
          .eq('active', true);   // <--- only show active products!

    if (error) {
      console.error('Error fetching products:', error.message);
      toast.error('Failed to load products');
    } else {
      setProducts(data || []);
    }
  };

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Auth error:', error.message);
      return;
    }
    setUser(data?.user || null);
  };

  const addToCart = async (product: any) => {
    if (!user) {
      toast.error('Please log in or register to add products to your cart.');
      return;
    }

    const quantity = quantities[product.id] || 1;

    const { error } = await supabase.from('shopping_cart').insert([
      {
        user_id:    user.id,
        product_id: product.id,
        quantity,
        seller_id:  product.seller_id,
        unit_price: product.price,
        status:     'pending',
      },
    ]);

    if (error) {
      console.error('Add to cart error:', error.message);
      toast.error('Failed to add to cart: ' + error.message);
    } else {
      toast.success('Product added to cart!');
    }
  };

  const filteredProducts =
    categoryFilter === 'all'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === categoryFilter);

  return (
    <div className="relative min-h-screen">
      {/* Full-page background image */}
      <img
        src="https://fnsharp.com/cdn/shop/articles/greek-cooking-tools-featured_850x.jpg?v=1617738818"
        alt="Kitchen tools background"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
      />

      {/* Foreground content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
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
              <div
                key={product.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 items-start"
              >
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
                  <p className="text-sm text-gray-500 mb-4">
                    Sold by: {product.seller?.username || 'Unknown Seller'}
                  </p>
                  <p className="text-orange-600 font-semibold mb-1 text-lg">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <label htmlFor={`qty-${product.id}`} className="text-sm">Qty:</label>
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      min={1}
                      max={10}
                      className="border px-2 py-1 w-20 text-sm rounded"
                      value={quantities[product.id] || 1}
                      onChange={(e) =>
                        setQuantities({
                          ...quantities,
                          [product.id]: Math.max(1, Math.min(10, parseInt(e.target.value))),
                        })
                      }
                    />
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className={`${user ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 text-gray-700'} text-white text-sm py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {user ? 'Add to Cart' : 'Register to Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
