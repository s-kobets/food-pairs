import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Food, Category } from '../lib/types'
import { getCurrentUserRole, permissions } from '../lib/permissions'

const Foods = () => {
  const [foods, setFoods] = useState<Food[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newFood, setNewFood] = useState({ name: '', name_ru: '', categoryId: '' })
  const [newJoin, setNewJoin] = useState({ foodId: '', categoryId: '' })
  const [error, setError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    display_name: '', 
    display_name_ru: '', 
    color: '#3B82F6' // default blue color
  })
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [foodsData, categoriesData] = await Promise.all([
        api.getFoods(),
        api.getCategories()
      ])
      setFoods(foodsData)
      setCategories(categoriesData)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newFood.name.trim() || !newFood.name_ru.trim() || !newFood.categoryId) {
      setError('Please fill in all fields / Пожалуйста, заполните все поля')
      return
    }

    try {
      await api.addFood(newFood.name.trim(), newFood.name_ru.trim(), Number(newFood.categoryId))
      setNewFood({ name: '', name_ru: '', categoryId: '' })
      loadData()
    } catch (err) {
      setError('Failed to add food / Не удалось добавить продукт')
      console.error(err)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newCategory.name.trim() || !newCategory.display_name.trim() || !newCategory.display_name_ru.trim()) {
      setError('Please fill in all category fields / Пожалуйста, заполните все поля категории')
      return
    }

    try {
      await api.addCategory(
        newCategory.name.trim(),
        newCategory.display_name.trim(),
        newCategory.display_name_ru.trim(),
        newCategory.color
      )
      setNewCategory({ name: '', display_name: '', display_name_ru: '', color: '#3B82F6' })
      setShowCategoryForm(false)
      loadData()
    } catch (err) {
      setError('Failed to add category / Не удалось добавить категорию')
      console.error(err)
    }
  }

  const handleAddJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newJoin.foodId || !newJoin.categoryId) {
      setError('Please fill in all fields / Пожалуйста, заполните все поля')
      return
    }

    try {
      await api.addFoodCategory(Number(newJoin.foodId), Number(newJoin.categoryId))
      setNewJoin({ foodId: '', categoryId: '' })
      loadData()
    } catch (err) {
      setError('Failed to add join / Не удалось добавить связь')
      console.error(err)
    }
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Foods Database</h1>
        {permissions.canAddFood(getCurrentUserRole()) && 
          <div className="flex gap-4">
            <button
              onClick={() => setShowFoodForm(!showFoodForm)}
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
            >
              <span className="flex items-center">
                {showFoodForm ? 'Hide Food Form' : '+ Add Food'}
              </span>
            </button>
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
            >
              <span className="flex items-center">
                {showCategoryForm ? 'Hide Category Form' : '+ Add Category'}
              </span>
            </button>
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
            >
              <span className="flex items-center">
                {showJoinForm ? 'Hide Food Form' : '+ Add Join F<->C'}
              </span>
            </button>
          </div>
        }
      </div>

      {/* Category Form */}
      {permissions.canAddFood(getCurrentUserRole()) && <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showCategoryForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAddCategory} className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Internal name (e.g., vegetables)"
                className="p-2 border rounded"
              />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newCategory.display_name}
                onChange={(e) => setNewCategory({ ...newCategory, display_name: e.target.value })}
                placeholder="Display name (English)"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={newCategory.display_name_ru}
                onChange={(e) => setNewCategory({ ...newCategory, display_name_ru: e.target.value })}
                placeholder="Название категории (Русский)"
                className="p-2 border rounded"
              />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-20 h-10"
              />
              <span className="text-sm text-gray-600">
                Choose category color / Выберите цвет категории
              </span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Category / Добавить категорию
            </button>
          </div>
        </form>
      </div>}

      {/* Food Form */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFoodForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAddFood} className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Food</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newFood.name}
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                placeholder="Food name (English)"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={newFood.name_ru}
                onChange={(e) => setNewFood({ ...newFood, name_ru: e.target.value })}
                placeholder="Название продукта (Русский)"
                className="p-2 border rounded"
              />
            </div>
            <select
              value={newFood.categoryId}
              onChange={(e) => setNewFood({ ...newFood, categoryId: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Select category / Выберите категорию</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.display_name} ({category.display_name_ru})
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Food / Добавить продукт
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>

      {/* Join Form */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showJoinForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAddJoin} className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add Join Food - Category</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newJoin.foodId}
                onChange={(e) => setNewJoin({ ...newJoin, foodId: e.target.value })}
                className="p-2 border rounded"
              >
                <option value="">Select food / Выберите продукт</option>
                {foods.map(food => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.name_ru})
                  </option>
                ))}
              </select>

              <select
                value={newFood.categoryId}
                onChange={(e) => setNewFood({ ...newFood, categoryId: e.target.value })}
                className="p-2 border rounded"
              >
                <option value="">Select category / Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.display_name} ({category.display_name_ru})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {`Add Join F <-> C / Добавить связь F <-> C`}
            </button>
          </div>

          </form>
      </div>

      {/* Foods list grouped by category */}
      <div className="grid gap-6">
        {categories.map(category => {
          const categoryFoods = foods.filter(food => food.category_ids.includes(category.id))
          if (categoryFoods.length === 0) return null

          return (
            <details key={category.id} className="bg-white rounded-lg shadow p-4 group">
              <summary className="text-lg font-semibold mb-3 flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <span className="transform transition-transform duration-200 group-open:rotate-90">→</span>
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.display_name} - {category.display_name_ru} ({categoryFoods.length})
              </summary>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
                {categoryFoods.map(food => (
                  <div
                    key={food.id}
                    className={`p-2 rounded-lg border`}
                    style={{ borderColor: category.color }}
                  >
                    {food.name} - {food.name_ru}
                  </div>
                ))}
              </div>
            </details>
          )
        })}
      </div>

      {/* Add some CSS to style the summary arrow */}
      <style>
        {`
          details > summary {
            list-style: none;
          }
          details > summary::-webkit-details-marker {
            display: none;
          }
        `}
      </style>
    </div>
  )
}

export default Foods 