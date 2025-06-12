import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Fetch all products from seller_products table
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('seller_products').select('*');
      if (error) {
        console.error('Error fetching products:', error.message);
        toast.error('Failed to load products');
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  // Add to shopping_cart
  const addToCart = async (productId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please log in to add products');
      return;
    }

    const quantity = quantities[productId] || 1;

    const { error } = await supabase.from('shopping_cart').insert([
      {
        user_id: user.id,
        product_id: productId,
        quantity,
      },
    ]);

    if (error) {
      console.error('Add to cart error:', error.message);
      toast.error('Failed to add to cart');
    } else {
      toast.success('Product added to cart!');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">🛒 Marketplace</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm">
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-36 object-cover rounded mb-3"
                />
              )}
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="text-sm text-gray-500 capitalize mb-1">{p.category}</div>
              <div className="text-orange-600 font-bold mb-3">${p.price.toFixed(2)}</div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor={`qty-${p.id}`} className="text-sm">
                  Qty:
                </label>
                <input
                  id={`qty-${p.id}`}
                  type="number"
                  min={1}
                  max={10}
                  className="border px-2 py-1 w-20 text-sm rounded"
                  value={quantities[p.id] || 1}
                  onChange={(e) =>
                    setQuantities({
                      ...quantities,
                      [p.id]: Math.max(1, Math.min(10, parseInt(e.target.value))),
                    })
                  }
                />
              </div>

              <button
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded w-full"
                onClick={() => addToCart(p.id)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

