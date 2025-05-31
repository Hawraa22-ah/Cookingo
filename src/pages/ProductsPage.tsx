// // // // import { useEffect, useState } from 'react';
// // // // import { supabase } from '../lib/supabase';

// // // // const handleAddToCart = async (productId) => {
// // // //   const { data: { user } } = await supabase.auth.getUser();
// // // //   if (!user) return alert('Please sign in to add items to your cart.');

// // // //   const { error } = await supabase
// // // //     .from('shopping_cart')
// // // //     .insert([{ user_id: user.id, product_id: productId }]);

// // // //   if (error) {
// // // //     console.error(error);
// // // //     alert('Failed to add to cart.');
// // // //   } else {
// // // //     alert('Product added to cart!');
// // // //   }
// // // // };

// // // // <button
// // // //   onClick={() => handleAddToCart(product.id)}
// // // //   className="mt-2 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
// // // // >
// // // //   Add to Cart
// // // // </button>


// // // // export default function ProductsPage() {
// // // //   const [products, setProducts] = useState([]);

// // // //   useEffect(() => {
// // // //     supabase
// // // //       .from('seller_products')
// // // //       .select('*')
// // // //       .then(({ data }) => setProducts(data || []));
// // // //   }, []);

// // // //   return (
// // // //     <div className="container mx-auto p-6">
// // // //       <h1 className="text-2xl font-bold mb-4 text-orange-600">Products for Kitchen</h1>
// // // //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// // // //         {products.map((product) => (
// // // //           <div key={product.id} className="bg-white p-4 rounded shadow">
// // // //             {product.image_url && (
// // // //               <img src={product.image_url} alt={product.name} className="mb-2 h-32 object-cover w-full rounded" />
// // // //             )}
// // // //             <h2 className="text-lg font-semibold">{product.name}</h2>
// // // //             <p className="text-sm text-gray-500 capitalize">{product.category}</p>
// // // //             <p className="text-orange-600 font-semibold">${product.price.toFixed(2)}</p>
// // // //           </div>
// // // //         ))}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // import { useEffect, useState } from 'react';
// // // import { supabase } from '../lib/supabase';


// // // export default function ProductsPage() {
// // //   const [products, setProducts] = useState([]);
// // //   const [user, setUser] = useState('null');

// // //   useEffect(() => {
// // //     fetchProducts();
// // //     fetchUser();
// // //   }, []);

// // //   const fetchProducts = async () => {
// // //     const { data, error } = await supabase.from('seller_products').select('*');
// // //     if (error) console.error('Error fetching products:', error);
// // //     else setProducts(data || []);
// // //   };

// // //   const fetchUser = async () => {
// // //     const { data } = await supabase.auth.getUser();
// // //     if (data?.user) setUser(data.user.id);
// // //   };

// // //   const addToCart = async (productId) => {
// // //     if (!user) {
// // //       alert('Please log in to add items to your cart.');
// // //       return;
// // //     }

// // //     const { error } = await supabase
// // //       .from('shopping_cart')
// // //       .insert([{ user_id: user.id, product_id: productId }]);

// // //     if (error) {
// // //       console.error(error);
// // //       alert('Failed to add product to cart.');
// // //     } else {
// // //       alert('Product added to cart!');
// // //     }
// // //   };

// // //   return (
// // //     <div className="container mx-auto px-4 py-8">
// // //       <h1 className="text-2xl font-bold mb-6 text-orange-600">🛒 Products for Kitchen</h1>

// // //       {products.length === 0 ? (
// // //         <p className="text-gray-600">No products found.</p>
// // //       ) : (
// // //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// // //           {products.map((product) => (
// // //             <div key={product.id} className="bg-white rounded-lg shadow p-4">
// // //               {product.image_url && (
// // //                 <img
// // //                   src={product.image_url}
// // //                   alt={product.name}
// // //                   className="w-full h-40 object-cover rounded mb-2"
// // //                 />
// // //               )}
// // //               <h2 className="text-lg font-semibold">{product.name}</h2>
// // //               <p className="text-sm text-gray-500 capitalize">{product.category}</p>
// // //               <p className="text-orange-600 font-semibold mb-2">${product.price.toFixed(2)}</p>

// // //               <button
// // //                 onClick={() => addToCart(product.id)}
// // //                 className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded"
// // //               >
// // //                 Add to Cart
// // //               </button>
              
              
// // //             </div>
// // //           ))}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // import { useEffect, useState } from 'react';
// // import { supabase } from '../lib/supabase';
// // import { useNavigate } from 'react-router-dom';



// // export default function ProductsPage() {
// //   const [products, setProducts] = useState([]);
// //   const [user, setUser] = useState(null);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     fetchProducts();
// //     fetchUser();
// //   }, []);

// //   const fetchProducts = async () => {
// //     const { data, error } = await supabase.from('seller_products').select('*');
// //     if (error) console.error('Error fetching products:', error);
// //     else setProducts(data || []);
// //   };

// //   const fetchUser = async () => {
// //     const { data } = await supabase.auth.getUser();
// //     if (data?.user) setUser(data.user);
// //   };

// //   const addToCart = async (productId: string) => {
// //     if (!user) {
// //       navigate('/login');
// //       return;
// //     }

// //     const { error } = await supabase
// //       .from('shopping_cart')
// //       .insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);

// //     if (error) {
// //       console.error('Add to cart error:', error);
// //       alert('Failed to add to cart.');
// //     } else {
// //       alert('Product added to cart!');
// //     }
// //   };

// //   return (
// //     <div className="container mx-auto px-4 py-8">
// //       <h1 className="text-2xl font-bold mb-6 text-orange-600">🛒 Products for Kitchen</h1>

// //       {products.length === 0 ? (
// //         <p className="text-gray-600">No products found.</p>
// //       ) : (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// //           {products.map((product) => (
// //             <div key={product.id} className="bg-white rounded-lg shadow p-4">
// //               {product.image_url && (
// //                 <img
// //                   src={product.image_url}
// //                   alt={product.name}
// //                   className="w-full h-40 object-cover rounded mb-2"
// //                 />
// //               )}
// //               <h2 className="text-lg font-semibold">{product.name}</h2>
// //               <p className="text-sm text-gray-500 capitalize">{product.category}</p>
// //               <p className="text-orange-600 font-semibold mb-2">${product.price.toFixed(2)}</p>

// //               <button
// //                 onClick={() => addToCart(product.id)}
// //                 className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded"
// //               >
// //                 Add to Cart
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { useNavigate } from 'react-router-dom';

// export default function ProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [user, setUser] = useState(null);
//   const [quantities, setQuantities] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProducts();
//     fetchUser();
//   }, []);

//   const fetchProducts = async () => {
//     const { data, error } = await supabase.from('seller_products').select('*');
//     if (error) console.error('Error fetching products:', error);
//     else setProducts(data || []);
//   };

//   const fetchUser = async () => {
//     const { data } = await supabase.auth.getUser();
//     if (data?.user) setUser(data.user);
//   };

//   const addToCart = async (productId: string) => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     const quantity = quantities[productId] || 1;

//     const { error } = await supabase
//       .from('shopping_cart')
//       .insert([{ user_id: user.id, product_id: productId, quantity }]);

//     if (error) {
//       console.error('Add to cart error:', error);
//       alert('Failed to add to cart.');
//     } else {
//       alert('Product added to cart!');
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6 text-orange-600">🛒 Products for Kitchen</h1>

//       {products.length === 0 ? (
//         <p className="text-gray-600">No products found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {products.map((product) => (
//             <div key={product.id} className="bg-white rounded-lg shadow p-4">
//               {product.image_url && (
//                 <img
//                   src={product.image_url}
//                   alt={product.name}
//                   className="w-full h-40 object-cover rounded mb-2"
//                 />
//               )}
//               <h2 className="text-lg font-semibold">{product.name}</h2>
//               <p className="text-sm text-gray-500 capitalize">{product.category}</p>
//               <p className="text-orange-600 font-semibold mb-2">${product.price.toFixed(2)}</p>

//               <div className="flex items-center gap-2 mb-2">
//                 <label htmlFor={`qty-${product.id}`} className="text-sm">Qty:</label>
//                 <input
//                   id={`qty-${product.id}`}
//                   type="number"
//                   min={1}
//                   className="border px-2 py-1 w-16 text-sm rounded"
//                   value={quantities[product.id] || 1}
//                   onChange={(e) =>
//                     setQuantities({
//                       ...quantities,
//                       [product.id]: Math.max(1, parseInt(e.target.value)),
//                     })
//                   }
//                 />
//               </div>

//               <button
//                 onClick={() => addToCart(product.id)}
//                 className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded w-full"
//               >
//                 Add to Cart
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

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
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser(data.user);
  };

  const addToCart = async (productId: string) => {
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

  const filteredProducts = categoryFilter === 'all'
    ? products
    : products.filter(p => p.category.toLowerCase() === categoryFilter);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{product.category}</p>
              <p className="text-orange-600 font-semibold mb-2">${product.price.toFixed(2)}</p>

              <div className="flex items-center gap-2 mb-2">
                <label htmlFor={`qty-${product.id}`} className="text-sm">Qty:</label>
                <input
                  id={`qty-${product.id}`}
                  type="number"
                  min={1}
                  className="border px-2 py-1 w-16 text-sm rounded"
                  value={quantities[product.id] || 1}
                  onChange={(e) =>
                    setQuantities({
                      ...quantities,
                      [product.id]: Math.max(1, parseInt(e.target.value)),
                    })
                  }
                />
              </div>

              <button
                onClick={() => addToCart(product.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded w-full"
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

