
// import React, { useEffect, useState } from 'react'
// import { supabase } from '../../lib/supabase'
// import { useAuth } from '../../contexts/AuthContext'
// import { Recipe } from '../../types'
// import RecipeCard from '../recipes/RecipeCard'

// const SavedRecipesPage: React.FC = () => {
//   const { user } = useAuth()
//   const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchSaved = async () => {
//       if (!user) return

//       // We select recipe (*) including chef_id_text
//       const { data, error } = await supabase
//         .from('favorite_recipes')
//         .select('recipe:recipe_id(*)')
//         .eq('user_id', user.id)

//       if (error) {
//         console.error('Error fetching saved recipes:', error)
//         setSavedRecipes([])
//       } else {
//         // Unwrap the nested recipe object
//         const recipes = (data || [])
//           .map((row) => row.recipe as Recipe)
//           .filter(Boolean)
//         setSavedRecipes(recipes)
//       }
//       setLoading(false)
//     }

//     fetchSaved()
//   }, [user])

//   if (loading) {
//     return <div className="text-center py-12">Loading saved recipes…</div>
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Saved Recipes</h1>

//       {savedRecipes.length === 0 ? (
//         <div className="text-center py-20 text-gray-600">
//           <div className="text-4xl mb-2">👩‍🍳</div>
//           <p className="mb-2">You haven't saved any recipes yet.</p>
//           <a href="/recipes" className="text-orange-500 hover:underline">
//             Browse Recipes
//           </a>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {savedRecipes.map((recipe) => (
//             <RecipeCard
//               key={recipe.id}
//               recipe={recipe}
//               showChefName={true}      // ← now show the username
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default SavedRecipesPage
// src/pages/SavedRecipesPage.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Recipe } from '../../types'
import RecipeCard from '../recipes/RecipeCard'

const SavedRecipesPage: React.FC = () => {
  const { user } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('favorite_recipes')
        .select('recipe:recipe_id(*)')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching saved recipes:', error)
        setSavedRecipes([])
      } else {
        const recipes = (data || [])
          .map((row) => row.recipe as Recipe)
          .filter(Boolean)
        setSavedRecipes(recipes)
      }
      setLoading(false)
    }

    fetchSaved()
  }, [user])

  if (loading) {
    return <div className="text-center py-12">Loading saved recipes…</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Recipes</h1>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-2">👩‍🍳</div>
          <p className="mb-2">You haven't saved any recipes yet.</p>
          <a href="/recipes" className="text-orange-500 hover:underline">
            Browse Recipes
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              showChefName={false}     // hide the “By:” line
              showAvgRating={false}    // hide the ★ rating badge
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedRecipesPage
