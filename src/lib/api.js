import { supabase } from './supabase';
export const api = {
    // Categories
    async getCategories() {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('display_name');
        return data;
    },
    // Foods
    async getFoods() {
        const { data } = await supabase
            .from('foods')
            .select(`
        id, 
        name,
        name_ru,
        foods_categories (category_id)
      `)
            .order('name');
        return data?.map(i => ({ id: i.id, name: i.name, name_ru: i.name_ru, category_ids: i.foods_categories.map(c => c.category_id) })) ?? [];
    },
    // Categories
    async getFoodsCategories() {
        const { data } = await supabase
            .from('foods_categories')
            .select('*')
            .order('food_id');
        return data;
    },
    async addFoodCategory(foodId, categoryId) {
        const { data, error } = await supabase
            .from('foods_categories')
            .insert(({ food_id: foodId, category_id: categoryId }))
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async addFood(name, name_ru, categoryId) {
        const { data: food, error: foodError } = await supabase
            .from('foods')
            .insert([{ name, name_ru }])
            .select()
            .single();
        if (foodError)
            throw foodError;
        const foodId = food.id;
        const { error: categoryError } = await this.addFoodCategory(foodId, categoryId);
        if (categoryError)
            throw categoryError;
        return food;
    },
    // Combinations
    async getCombinations() {
        const { data } = await supabase
            .from('combinations')
            .select(`
        *,
        food1:foods!item1_id(id, name, name_ru),
        food2:foods!item2_id(id, name, name_ru),
        category1:categories!item1_category_id(id, display_name, display_name_ru),
        category2:categories!item2_category_id(id, display_name, display_name_ru)
      `)
            .order('created_at', { ascending: false });
        return data;
    },
    async addCombination(combination) {
        const { data, error } = await supabase
            .from('combinations')
            .insert([combination])
            .select();
        if (error)
            throw error;
        return data[0];
    },
    async addCategory(name, display_name, display_name_ru, color) {
        const { data, error } = await supabase
            .from('categories')
            .insert([{
                name,
                display_name,
                display_name_ru,
                color
            }])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
};
