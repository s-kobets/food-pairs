import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Food, Combination } from '../lib/types'

const IngredientsChecker = () => {
  const [foods, setFoods] = useState<Food[]>([])
  const [combinations, setCombinations] = useState<Combination[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'ru'>('en')
  const [searchTerm, setSearchTerm] = useState('')
  const [openMenu, setOpenMenu] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<Food[]>([])
  const [matchResults, setMatchResults] = useState<{
    goodPairs: string[];
    badPairs: string[];
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [fds, combs] = await Promise.all([
        api.getFoods(),
        api.getCombinations()
      ])
      setFoods(fds)
      setCombinations(combs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIngredients = () => {
    const results = {
      goodPairs: [] as string[],
      badPairs: [] as string[]
    }

    for (let i = 0; i < selectedIngredients.length; i++) {
      for (let j = i + 1; j < selectedIngredients.length; j++) {
        const food1 = selectedIngredients[i]
        const food2 = selectedIngredients[j]

        const match = combinations.find(combo => 
        // Food to Food
          (combo.item1_type === 'food' && combo.item2_type === 'food' && 
            ((combo.food1?.id === food1.id && combo.food2?.id === food2.id) ||
             (combo.food1?.id === food2.id && combo.food2?.id === food1.id))) ||
        // Category to Category
          (combo.item1_type === 'category' && combo.item2_type === 'category' &&
            ((food1.category_id === combo.item1_category_id && food2.category_id === combo.item2_category_id) ||
             (food1.category_id === combo.item2_category_id && food2.category_id === combo.item1_category_id))) ||
        // Food to Category
          (combo.item1_type === 'food' && combo.item2_type === 'category' &&
            ((combo.food1?.id === food1.id && food2.category_id === combo.item2_category_id) ||
             (combo.food1?.id === food2.id && food1.category_id === combo.item2_category_id))) ||
         // Category to Food
          (combo.item1_type === 'category' && combo.item2_type === 'food' &&
            ((food1.category_id === combo.item1_category_id && combo.food2?.id === food2.id) ||
             (food2.category_id === combo.item1_category_id && combo.food2?.id === food1.id)))
        )


        const pair = `${language === 'en' ? food1.name : food1.name_ru} + ${language === 'en' ? food2.name : food2.name_ru}`
        if (match) {
          results.goodPairs.push(`${pair} (${match.rating}⭐)`)
        } else {
          results.badPairs.push(pair)
        }
      }
    }

    setMatchResults(results)
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Language Toggle */}
      <div className="flex justify-end mb-4">
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
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">
          {language === 'en' ? 'Ingredients Compatibility Checker' : 'Проверка совместимости ингредиентов'}
        </h1>

        <div className="mb-6 relative">
          {selectedIngredients.length > 0 && <button className='absolute right-0 -top-6 ml-auto text-gray-500' onClick={() => {setSelectedIngredients([])}}>clear all</button>}
          <div className={`flex flex-wrap gap-2 border-2 rounded p-2 cursor-pointer ${openMenu ? 'border-blue-300' : ''}`} tabIndex={1} onClick={() => {setOpenMenu(openMenu ? false : true)}}>
            {selectedIngredients.length === 0 ? <p className='px-1 py-1'>{language === 'en' ? '+ Add ingredient' : '+ Добавить ингредиент'}</p>: null}
            {selectedIngredients.map(ingredient => (
              <div 
                key={ingredient.id} 
                className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
              >
                <span>{language === 'en' ? ingredient.name : ingredient.name_ru}</span>
                <button
                  onClick={() => setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredient.id))}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {openMenu && <div className="border rounded p-2 absolute mt-1 z-[1] bg-white w-full gap-2 flex flex-col">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Search ingredient (e.g., 'tomato' or 'vegetable')..."
            />
            <ul className='overflow-y-auto max-h-[250px]' 
              onClick={(e) => {
                const value = (e.target as HTMLLIElement)?.value
                if (value == null) return
                const selectedIds = selectedIngredients.map(f => f.id)
                if (selectedIds.includes(Number(value))) {
                  setSelectedIngredients(selectedIngredients.filter(f => f.id !== Number(value)))
                  return
                }
                const food = foods.find(f => f.id === Number(value))
                if (food && !selectedIngredients.find(i => i.id === food.id)) {
                  setSelectedIngredients([...selectedIngredients, food])
                }
              }}
            >
              {foods.filter(food => language === 'en' ? food.name.toLowerCase().includes(searchTerm.toLowerCase()) : food.name_ru.toLowerCase().includes(searchTerm.toLowerCase())).map(food => (
                <li key={food.id} value={food.id} className={`py-1 cursor-pointer hover:bg-gray-200 ${selectedIngredients.map(f => f.id).includes(food.id) ? 'bg-blue-100' : ''}`}>
                  {language === 'en' ? food.name : food.name_ru}
                </li>
              ))}
            </ul>
          </div>
          }

          <button
            onClick={checkIngredients}
            disabled={selectedIngredients.length < 2}
            className="mt-4 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {language === 'en' ? 'Check Compatibility' : 'Проверить совместимость'}
          </button>
        </div>

        {matchResults && (
          <div className="space-y-4">
            {matchResults.goodPairs.length > 0 && (
              <div>
                <h2 className="font-semibold text-green-600 mb-2">
                  {language === 'en' ? 'Good combinations:' : 'Хорошие сочетания:'}
                </h2>
                <div className="space-y-1">
                  {matchResults.goodPairs.map(pair => (
                    <div key={pair} className="text-green-600">✓ {pair}</div>
                  ))}
                </div>
              </div>
            )}
            {matchResults.badPairs.length > 0 && (
              <div>
                <h2 className="font-semibold text-red-600 mb-2">
                  {language === 'en' ? 'Not found in database:' : 'Не найдено в базе данных:'}
                </h2>
                <div className="space-y-1">
                  {matchResults.badPairs.map(pair => (
                    <div key={pair} className="text-red-600">✗ {pair}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default IngredientsChecker 