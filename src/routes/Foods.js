import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getCurrentUserRole, permissions } from '../lib/permissions';
const Foods = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newFood, setNewFood] = useState({ name: '', name_ru: '', categoryId: '' });
    const [newJoin, setNewJoin] = useState({ foodId: '', categoryId: '' });
    const [error, setError] = useState(null);
    const [newCategory, setNewCategory] = useState({
        name: '',
        display_name: '',
        display_name_ru: '',
        color: '#3B82F6' // default blue color
    });
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showFoodForm, setShowFoodForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const [foodsData, categoriesData] = await Promise.all([
                api.getFoods(),
                api.getCategories()
            ]);
            setFoods(foodsData);
            setCategories(categoriesData);
        }
        catch (err) {
            setError('Failed to load data');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddFood = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newFood.name.trim() || !newFood.name_ru.trim() || !newFood.categoryId) {
            setError('Please fill in all fields / Пожалуйста, заполните все поля');
            return;
        }
        try {
            await api.addFood(newFood.name.trim(), newFood.name_ru.trim(), Number(newFood.categoryId));
            setNewFood({ name: '', name_ru: '', categoryId: '' });
            loadData();
        }
        catch (err) {
            setError('Failed to add food / Не удалось добавить продукт');
            console.error(err);
        }
    };
    const handleAddCategory = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newCategory.name.trim() || !newCategory.display_name.trim() || !newCategory.display_name_ru.trim()) {
            setError('Please fill in all category fields / Пожалуйста, заполните все поля категории');
            return;
        }
        try {
            await api.addCategory(newCategory.name.trim(), newCategory.display_name.trim(), newCategory.display_name_ru.trim(), newCategory.color);
            setNewCategory({ name: '', display_name: '', display_name_ru: '', color: '#3B82F6' });
            setShowCategoryForm(false);
            loadData();
        }
        catch (err) {
            setError('Failed to add category / Не удалось добавить категорию');
            console.error(err);
        }
    };
    const handleAddJoin = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newJoin.foodId || !newJoin.categoryId) {
            setError('Please fill in all fields / Пожалуйста, заполните все поля');
            return;
        }
        try {
            await api.addFoodCategory(Number(newJoin.foodId), Number(newJoin.categoryId));
            setNewJoin({ foodId: '', categoryId: '' });
            loadData();
        }
        catch (err) {
            setError('Failed to add join / Не удалось добавить связь');
            console.error(err);
        }
    };
    if (loading)
        return _jsx("div", { className: "p-4", children: "Loading..." });
    return (_jsxs("div", { className: "p-4 max-w-4xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Foods Database" }), permissions.canAddFood(getCurrentUserRole()) &&
                        _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => setShowFoodForm(!showFoodForm), className: "text-blue-500 hover:text-blue-600 transition-colors duration-200", children: _jsx("span", { className: "flex items-center", children: showFoodForm ? 'Hide Food Form' : '+ Add Food' }) }), _jsx("button", { onClick: () => setShowCategoryForm(!showCategoryForm), className: "text-blue-500 hover:text-blue-600 transition-colors duration-200", children: _jsx("span", { className: "flex items-center", children: showCategoryForm ? 'Hide Category Form' : '+ Add Category' }) }), _jsx("button", { onClick: () => setShowJoinForm(!showJoinForm), className: "text-blue-500 hover:text-blue-600 transition-colors duration-200", children: _jsx("span", { className: "flex items-center", children: showJoinForm ? 'Hide Food Form' : '+ Add Join F<->C' }) })] })] }), permissions.canAddFood(getCurrentUserRole()) && _jsx("div", { className: `transition-all duration-300 ease-in-out overflow-hidden ${showCategoryForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`, children: _jsxs("form", { onSubmit: handleAddCategory, className: "p-4 bg-white rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Add New Category" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("input", { type: "text", value: newCategory.name, onChange: (e) => setNewCategory({ ...newCategory, name: e.target.value }), placeholder: "Internal name (e.g., vegetables)", className: "p-2 border rounded" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("input", { type: "text", value: newCategory.display_name, onChange: (e) => setNewCategory({ ...newCategory, display_name: e.target.value }), placeholder: "Display name (English)", className: "p-2 border rounded" }), _jsx("input", { type: "text", value: newCategory.display_name_ru, onChange: (e) => setNewCategory({ ...newCategory, display_name_ru: e.target.value }), placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 (\u0420\u0443\u0441\u0441\u043A\u0438\u0439)", className: "p-2 border rounded" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { type: "color", value: newCategory.color, onChange: (e) => setNewCategory({ ...newCategory, color: e.target.value }), className: "w-20 h-10" }), _jsx("span", { className: "text-sm text-gray-600", children: "Choose category color / \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0446\u0432\u0435\u0442 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" })] }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Add Category / \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E" })] })] }) }), _jsx("div", { className: `transition-all duration-300 ease-in-out overflow-hidden ${showFoodForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`, children: _jsxs("form", { onSubmit: handleAddFood, className: "p-4 bg-white rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Add New Food" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("input", { type: "text", value: newFood.name, onChange: (e) => setNewFood({ ...newFood, name: e.target.value }), placeholder: "Food name (English)", className: "p-2 border rounded" }), _jsx("input", { type: "text", value: newFood.name_ru, onChange: (e) => setNewFood({ ...newFood, name_ru: e.target.value }), placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430 (\u0420\u0443\u0441\u0441\u043A\u0438\u0439)", className: "p-2 border rounded" })] }), _jsxs("select", { value: newFood.categoryId, onChange: (e) => setNewFood({ ...newFood, categoryId: e.target.value }), className: "p-2 border rounded", children: [_jsx("option", { value: "", children: "Select category / \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E" }), categories.map(category => (_jsxs("option", { value: category.id, children: [category.display_name, " (", category.display_name_ru, ")"] }, category.id)))] }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Add Food / \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0440\u043E\u0434\u0443\u043A\u0442" })] }), error && _jsx("p", { className: "text-red-500 mt-2", children: error })] }) }), _jsx("div", { className: `transition-all duration-300 ease-in-out overflow-hidden ${showJoinForm ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`, children: _jsxs("form", { onSubmit: handleAddJoin, className: "p-4 bg-white rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Add Join Food - Category" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("select", { value: newJoin.foodId, onChange: (e) => setNewJoin({ ...newJoin, foodId: e.target.value }), className: "p-2 border rounded", children: [_jsx("option", { value: "", children: "Select food / \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442" }), foods.map(food => (_jsxs("option", { value: food.id, children: [food.name, " (", food.name_ru, ")"] }, food.id)))] }), _jsxs("select", { value: newFood.categoryId, onChange: (e) => setNewFood({ ...newFood, categoryId: e.target.value }), className: "p-2 border rounded", children: [_jsx("option", { value: "", children: "Select category / \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E" }), categories.map(category => (_jsxs("option", { value: category.id, children: [category.display_name, " (", category.display_name_ru, ")"] }, category.id)))] })] }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: `Add Join F <-> C / Добавить связь F <-> C` })] })] }) }), _jsx("div", { className: "grid gap-6", children: categories.map(category => {
                    const categoryFoods = foods.filter(food => food.category_ids.includes(category.id));
                    if (categoryFoods.length === 0)
                        return null;
                    return (_jsxs("details", { className: "bg-white rounded-lg shadow p-4 group", children: [_jsxs("summary", { className: "text-lg font-semibold mb-3 flex items-center gap-2 cursor-pointer hover:text-blue-600", children: [_jsx("span", { className: "transform transition-transform duration-200 group-open:rotate-90", children: "\u2192" }), _jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: category.color } }), category.display_name, " - ", category.display_name_ru, " (", categoryFoods.length, ")"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2", children: categoryFoods.map(food => (_jsxs("div", { className: `p-2 rounded-lg border`, style: { borderColor: category.color }, children: [food.name, " - ", food.name_ru] }, food.id))) })] }, category.id));
                }) }), _jsx("style", { children: `
          details > summary {
            list-style: none;
          }
          details > summary::-webkit-details-marker {
            display: none;
          }
        ` })] }));
};
export default Foods;
