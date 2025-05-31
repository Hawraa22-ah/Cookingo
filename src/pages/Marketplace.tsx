import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Marketplace() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    supabase.from('seller_products').select('*').then(({ data }) => {
      setProducts(data || []);
    });
  }, []);

  const addToCart = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Login required');

    await supabase.from('shopping_cart').insert({
      user_id: user.id,
      product_id: productId,
    });

    alert('Added to cart');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4">
            {p.image_url && <img src={p.image_url} alt="" className="w-full h-32 object-cover mb-2" />}
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">{p.category}</div>
            <div className="text-orange-500">${p.price.toFixed(2)}</div>
            <button
              className="mt-2 bg-orange-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => addToCart(p.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
