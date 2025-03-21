import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Category, Food, Combination } from '../../types'
import { permissions, getCurrentUserRole } from '../lib/permissions'
import ForceGraph from '../components/ForceGraph'

const Combinations = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [combinations, setCombinations] = useState<Combination[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Quick add state
  const [firstType, setFirstType] = useState<'food' | 'category'>('category')
  const [firstId, setFirstId] = useState<number | ''>('')
  const [secondType, setSecondType] = useState<'food' | 'category'>('category')
  const [secondId, setSecondId] = useState<number | ''>('')
  const [language, setLanguage] = useState<'en' | 'ru'>('en')
  const [view, setView] = useState<'list' | 'chart'>('list')
  const [rating, setRating] = useState<number>(5)

  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [cats, fds, combs] = await Promise.all([
        api.getCategories(),
        api.getFoods(),
        api.getCombinations()
      ])
      setCategories(cats)
      setFoods(fds)
      setCombinations(combs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRelatedCombinations = (searchTerm: string) => {
    if (!searchTerm) return combinations

    const searchLower = searchTerm.toLowerCase()

    // First, find the searched food or category
    const matchedFood = foods.find(f =>
      (language === 'en' ? f.name : f.name_ru).toLowerCase().includes(searchLower)
    )

    const matchedCategory = categories.find(c =>
      (language === 'en' ? c.display_name : c.display_name_ru).toLowerCase().includes(searchLower) ||
      c.name.toLowerCase().includes(searchLower)  // name is always in English
    )

    return combinations.filter(combo => {
      // Direct matches
      const matchesFood1 = combo.food1 && (language === 'en' ? combo.food1.name : combo.food1.name_ru).toLowerCase().includes(searchLower)
      const matchesFood2 = combo.food2 && (language === 'en' ? combo.food2.name : combo.food2.name_ru).toLowerCase().includes(searchLower)
      const matchesCategory1 = combo.category1 && (language === 'en' ? combo.category1.display_name : combo.category1.display_name_ru).toLowerCase().includes(searchLower)
      const matchesCategory2 = combo.category2 && (language === 'en' ? combo.category2.display_name : combo.category2.display_name_ru).toLowerCase().includes(searchLower)

      // Category relationships
      const food1MatchesCategory = matchedCategory && combo.food1?.category_ids?.includes(matchedCategory.id)
      const food2MatchesCategory = matchedCategory && combo.food2?.category_ids?.includes(matchedCategory.id)

      // Food's category relationships
      const matchedFoodCategories = matchedFood?.category_ids
      const category1MatchesFood = matchedFoodCategories?.length && matchedFoodCategories?.includes(combo.category1?.id ?? NaN)
      const category2MatchesFood = matchedFoodCategories?.length && matchedFoodCategories?.includes(combo.category2?.id ?? NaN)

      return (
        matchesFood1 || matchesFood2 ||
        matchesCategory1 || matchesCategory2 ||
        food1MatchesCategory || food2MatchesCategory ||
        category1MatchesFood || category2MatchesFood
      )
    })
  }

  const filteredCombinations = getRelatedCombinations(searchTerm)

  const handleAddCombination = async () => {
    if (!firstId || !secondId) return

    try {
      await api.addCombination({
        item1_type: firstType,
        [firstType === 'food' ? 'item1_id' : 'item1_category_id']: firstId,
        item2_type: secondType,
        [secondType === 'food' ? 'item2_id' : 'item2_category_id']: secondId,
        rating
      })
      loadData() // Refresh data
      // Reset form
      setFirstId('')
      setSecondId('')
      setRating(5)
    } catch (error) {
      console.error('Error adding combination:', error)
    }
  }

  const formatCombinationText = (combo: Combination) => {
    const first = combo.item1_type === 'food'
      ? combo.food1?.name || '' + ' (' + combo.food1?.name_ru || '' + ')'
      : `any ${combo.category1?.display_name?.toLowerCase() || ''} (${combo.category1?.display_name_ru?.toLowerCase() || ''})`

    const second = combo.item2_type === 'food'
      ? combo.food2?.name || '' + ` (${combo.food2?.name_ru || ''})`
      : `any ${combo.category2?.display_name?.toLowerCase() || ''} (${combo.category2?.display_name_ru?.toLowerCase() || ''})`

    return `${first} + ${second}`
  }

  const formatSearchResult = (combo: Combination) => {
    const searchLower = searchTerm.toLowerCase()
    const result = formatCombinationText(combo)

    // If it's a direct match, no need for additional context
    if (result.toLowerCase().includes(searchLower)) {
      return result + ` ${combo.rating}⭐`
    }

    // Add context for category relationships
    const matchedFood = foods.find(f =>
      (language === 'en' ? f.name : f.name_ru).toLowerCase().includes(searchLower)
    )

    if (matchedFood) {
      const foodCategory = categories.find(c => matchedFood.category_ids.includes(c.id))
      return (
        <div>
          <div>
            {result}
            <span className='ml-4'>{combo.rating}⭐</span>
          </div>
          <div className="text-sm text-gray-500">
            Related to "{matchedFood.name}" ({foodCategory?.display_name} - {foodCategory?.display_name_ru})
          </div>
        </div>
      )
    }

    const matchedCategory = categories.find(c =>
      (language === 'en' ? c.display_name : c.display_name_ru).toLowerCase().includes(searchLower)
    )

    if (matchedCategory) {
      return (
        <div>
          <div>
            {result}
            <span className='ml-4'>{combo.rating}⭐</span>
          </div>
          <div className="text-sm text-gray-500">
            Related to category: {matchedCategory.display_name} - {matchedCategory.display_name_ru}
          </div>
        </div>
      )
    }

    return result
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-end mb-4 gap-3">
        <div className="bg-white rounded-lg shadow inline-flex">
          <button
            className={`px-4 py-2 rounded-l-lg ${language === 'en' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${language === 'ru' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            onClick={() => setLanguage('ru')}
          >
            Русский
          </button>
        </div>

        {/* Change view for result */}
        <div className="bg-white rounded-lg shadow inline-flex">
          <button
            className={`px-4 py-2 rounded-l-lg ${view === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            onClick={() => setView('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>

          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${view === 'chart' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            onClick={() => setView('chart')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>

          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Food Combinations</h1>
        {permissions.canAddCombination(getCurrentUserRole()) && <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
        >
          <span className="flex items-center">
            {showAddForm ? 'Hide Combination Form' : '+ Add Combination'}
          </span>
        </button>}
      </div>

      {/* Add Combination Form */}
      {permissions.canAddCombination(getCurrentUserRole()) && <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showAddForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <form className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Combination</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* First Item */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFirstType('category')}
                  className={`px-3 py-1 rounded ${firstType === 'category'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  Category
                </button>
                <button
                  type="button"
                  onClick={() => setFirstType('food')}
                  className={`px-3 py-1 rounded ${firstType === 'food'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  Food
                </button>
              </div>
              <select
                value={firstId}
                onChange={(e) => setFirstId(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value="">Select {firstType}</option>
                {firstType === 'category'
                  ? categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.display_name} ({cat.display_name_ru})
                    </option>
                  ))
                  : foods.map(food => (
                    <option key={food.id} value={food.id}>
                      {food.name} ({food.name_ru})
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Second Item */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSecondType('category')}
                  className={`px-3 py-1 rounded ${secondType === 'category'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  Category
                </button>
                <button
                  type="button"
                  onClick={() => setSecondType('food')}
                  className={`px-3 py-1 rounded ${secondType === 'food'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  Food
                </button>
              </div>
              <select
                value={secondId}
                onChange={(e) => setSecondId(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value="">Select {secondType}</option>
                {secondType === 'category'
                  ? categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.display_name} ({cat.display_name_ru})
                    </option>
                  ))
                  : foods.map(food => (
                    <option key={food.id} value={food.id}>
                      {food.name} ({food.name_ru})
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              className="w-full p-2 border rounded"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>
                  {value} ⭐
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddCombination}
            disabled={!firstId || !secondId}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Combination
          </button>
        </form>
      </div>}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search combinations (e.g., 'tomato' or 'vegetable')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Updated Combinations chart */}
      {view === 'chart' && <ForceGraph foods={foods} categories={categories} combinations={combinations} searchTerm={searchTerm}/>}

      {/* Updated Combinations List */}
      {view === 'list' && <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-4 border-b">
          {searchTerm
            ? `Found Combinations (${filteredCombinations?.length})`
            : `All Combinations (${combinations?.length})`
          }
        </h2>
        <div className="divide-y">
          {filteredCombinations?.map(combo => (
            <div key={combo.id} className="p-4 hover:bg-gray-50">
              {searchTerm ? formatSearchResult(combo) : <div>
                <span className={`${combo.rating < 3 ? 'text-red-500' : 'text-gray-900'}`}>
                  {formatCombinationText(combo)}
                </span>
                <span className='ml-4'>{combo.rating}⭐</span>
              </div>
              }
            </div>
          ))}
          {filteredCombinations?.length === 0 && (
            <div className="p-4 text-gray-500">
              {searchTerm
                ? 'No combinations found for your search.'
                : 'No combinations yet. Add your first one above!'
              }
            </div>
          )}
        </div>
      </div>}
    </div>
  )
}

export default Combinations 