import { Category, Food, Combination, FoodCategory, ActionType } from '../../types'

// Type definitions for API requests
interface ApiResponse<T> {
  data?: T
  error?: string
}

interface ApiRequest<T = any> {
  action: string
  payload?: T
}

// Generic function to make API calls
async function callApi<T>(request: ApiRequest): Promise<T> {
  const response = await fetch('/.netlify/functions/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  const result = await response.json()
  if (result.error) {
    throw new Error(result.error)
  }

  return result
}

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    return callApi<Category[]>({ action: ActionType.getCategories })
  },

  // Foods
  async getFoods(): Promise<Food[]> {
    const foods = await callApi<any[]>({ action: ActionType.getFoods })
    return foods.map(i => ({
      id: i.id,
      name: i.name,
      name_ru: i.name_ru,
      category_ids: i.foods_categories.map((c: any) => c.category_id)
    }))
  },

  async addFood(name: string, name_ru: string, categoryId: number): Promise<Food> {
    return callApi<Food>({
      action: ActionType.addFood,
      payload: { name, name_ru, categoryId }
    })
  },

  // Combinations
  async getCombinations(): Promise<Combination[]> {
    return callApi<Combination[]>({ action: ActionType.getCombinations })
  },
  // Combinations
  async getOneCombination(): Promise<Combination> {
    return callApi<Combination>({ action: ActionType.getOneCombination })
  },

  async addCombination(combination: Omit<Combination, 'id' | 'created_at'>) {
    return callApi<Combination>({
      action: ActionType.addCombination,
      payload: combination
    })
  },


  async addCombinations(combinations: Omit<Combination, 'id' | 'created_at'>[]) {
    return callApi<Combination[]>({
      action: ActionType.addCombinations,
      payload: combinations
    })
  },

  async addCategory(
    name: string,
    display_name: string,
    display_name_ru: string,
    color: string
  ) {
    return callApi<Category>({
      action: ActionType.addCategory,
      payload: { name, display_name, display_name_ru, color }
    })
  },

  // Categories
  async getFoodsCategories() {
    return callApi<FoodCategory>({
      action: ActionType.getFoodsCategories
    })
  },

  async addFoodCategory(foodId: number, categoryId: number) {
    return callApi<FoodCategory>({
      action: ActionType.addFoodsCategories,
      payload: {food_id: foodId, category_id: categoryId}
    })
  },
} 