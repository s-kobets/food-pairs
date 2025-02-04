import { supabase } from './supabase'
import { Category, Food, Combination } from './types'

export const api = {
  // Categories
  async getCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_name')
    return data as Category[]
  },

  // Foods
  async getFoods() {
    const { data } = await supabase
      .from('foods')
      .select(`
        *,
        category:categories(*)
      `)
      .order('name')
    return data as Food[]
  },

  async addFood(name: string, name_ru: string, categoryId: number) {
    const { data, error } = await supabase
      .from('foods')
      .insert([{ name, name_ru, category_id: categoryId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Combinations
  async getCombinations() {
    const { data } = await supabase
      .from('combinations')
      .select(`
        *,
        food1:foods!item1_id(
          id,
          name,
          name_ru,
          category:categories(*)
        ),
        food2:foods!item2_id(
          id,
          name,
          name_ru,
          category:categories(*)
        ),
        category1:categories!item1_category_id(*),
        category2:categories!item2_category_id(*)
      `)
      .order('created_at', { ascending: false })
    return data as Combination[]
  },

  async addCombination(combination: Omit<Combination, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('combinations')
      .insert([combination])
      .select()
    if (error) throw error
    return data[0] as Combination
  },

  async addCategory(
    name: string, 
    display_name: string, 
    display_name_ru: string, 
    color: string
  ) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name, 
        display_name, 
        display_name_ru, 
        color 
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
} 