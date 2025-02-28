export interface Category {
  id: number
  name: string
  display_name: string
  display_name_ru: string
  color: string
  created_at: string
}

export interface Food {
  id: number
  name: string
  name_ru: string
  category_ids: number[]
}

export interface FoodCategory {
  food_id: number
  category_id: number
}

export interface Combination {
  id: number
  item1_type: 'food' | 'category'
  item1_id?: number
  item1_category_id?: number
  item2_type: 'food' | 'category'
  item2_id?: number
  item2_category_id?: number
  rating: number
  created_at: string
  // Join fields
  food1?: Food
  food2?: Food
  category1?: Category
  category2?: Category
} 