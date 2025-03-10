import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { ActionType } from '../../types'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface EventBody {
    action?: keyof typeof ActionType;
    payload?: any;
}

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        }
    }

    try {
        const { action, payload }: EventBody = JSON.parse(event.body || '{}')

        switch (action) {
            case ActionType.getCategories:
                const { data: categories } = await supabase
                    .from('categories')
                    .select('*')
                    .order('display_name')
                return { statusCode: 200, body: JSON.stringify(categories) }

            case ActionType.getFoods:
                const { data: foods } = await supabase
                    .from('foods')
                    .select(`
            id, 
            name,
            name_ru,
            foods_categories (category_id)
          `)
                    .order('name')
                return { statusCode: 200, body: JSON.stringify(foods) }

            case ActionType.getCombinations:
                const { data: combinations } = await supabase
                    .from('combinations')
                    .select(`
            *,
            food1:foods!item1_id(id, name, name_ru),
            food2:foods!item2_id(id, name, name_ru),
            category1:categories!item1_category_id(id, display_name, display_name_ru),
            category2:categories!item2_category_id(id, display_name, display_name_ru)
          `)
                    .order('created_at', { ascending: false })
                return { statusCode: 200, body: JSON.stringify(combinations) }

            case ActionType.getOneCombination:
                const { data: combination } = await supabase
                    .from('combinations')
                    .select('id')
                    .limit(1)
                    .maybeSingle()
                return { statusCode: 200, body: JSON.stringify(combination) }

            case ActionType.getFoodsCategories:
                const { data: foodsCategories } = await supabase.from('foods_categories')
                    .select('*')
                    .order('food_id')
                return { statusCode: 200, body: JSON.stringify(foodsCategories) }

            case ActionType.addFood:
                const { name, name_ru, categoryId } = payload
                const { data: newFood } = await supabase
                    .from('foods')
                    .insert([{ name, name_ru }])
                    .select()
                    .single()

                if (newFood) {
                    await supabase
                        .from('foods_categories')
                        .insert({ food_id: newFood.id, category_id: categoryId })
                }
                return { statusCode: 200, body: JSON.stringify(newFood) }

            case ActionType.addCategory:
                const { data: newCategory } = await supabase
                    .from('categories')
                    .insert(payload)
                    .select()
                    .single()
                return { statusCode: 200, body: JSON.stringify(newCategory) }

            case ActionType.addCombination:
                const { data: newCombination } = await supabase
                    .from('combinations')
                    .insert(payload)
                    .select()
                return { statusCode: 200, body: JSON.stringify(newCombination?.at(0)) }

            
            case ActionType.addFoodsCategories:
                const { data } = await supabase
                    .from('foods_categories')
                    .insert(payload)
                    .select()
                    .single()
                return { statusCode: 200, body: JSON.stringify(data) }

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid action' })
                }
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
} 