import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
const IngredientsChecker = () => {
    const [foods, setFoods] = useState([]);
    const [combinations, setCombinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('en');
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenu, setOpenMenu] = useState(false);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [matchResults, setMatchResults] = useState(null);
    useEffect(() => {
        loadData();
    }, []);
    const getUniqueFoods = useCallback((foodsList) => {
        const uniqueFoodsMap = new Map();
        foodsList.forEach(food => {
            const name = language === 'en' ? food.name : food.name_ru;
            if (!uniqueFoodsMap.has(name.toLowerCase())) {
                uniqueFoodsMap.set(name.toLowerCase(), food);
            }
        });
        return Array.from(uniqueFoodsMap.values());
    }, []);
    const loadData = async () => {
        try {
            const [fds, combs] = await Promise.all([
                api.getFoods(),
                api.getCombinations()
            ]);
            setFoods(fds);
            setCombinations(combs);
        }
        catch (error) {
            console.error('Error loading data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const checkIngredients = () => {
        const results = {
            goodPairs: [],
            badPairs: []
        };
        for (let i = 0; i < selectedIngredients.length; i++) {
            for (let j = i + 1; j < selectedIngredients.length; j++) {
                const food1 = selectedIngredients[i];
                const food2 = selectedIngredients[j];
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
                            (food2.category_id === combo.item1_category_id && combo.food2?.id === food1.id))));
                const pair = `${language === 'en' ? food1.name : food1.name_ru} + ${language === 'en' ? food2.name : food2.name_ru}`;
                if (match) {
                    results.goodPairs.push(`${pair} (${match.rating}⭐)`);
                }
                else {
                    results.badPairs.push(pair);
                }
            }
        }
        setMatchResults(results);
    };
    const processInputTerms = (text) => {
        // Split by both comma and "and", clean up the terms
        const terms = text
            .split(/,|\sand\s/i) // Split by comma or " and "
            .map(term => term.trim())
            .filter(Boolean); // Remove empty strings
        // Find and add matching foods
        terms.forEach(term => {
            // Use unique foods for matching
            const uniqueFoods = getUniqueFoods(foods);
            const matchingFood = uniqueFoods.find(food => {
                const name = language === 'en' ? food.name : food.name_ru;
                return name.toLowerCase() === term.toLowerCase();
            });
            if (matchingFood && !selectedIngredients.find(i => i.id === matchingFood.id)) {
                setSelectedIngredients(prev => [...prev, matchingFood]);
            }
        });
        return terms;
    };
    const handleSearchInput = (e) => {
        const input = e.target.value;
        setSearchTerm(input);
        // If input ends with comma, process the input
        if (input.endsWith(',')) {
            processInputTerms(input);
            setSearchTerm('');
        }
    };
    const handlePasteInput = (e) => {
        // Get pasted text
        const pastedText = e.clipboardData.getData('text');
        // Process the pasted text
        processInputTerms(pastedText);
        // Prevent default paste behavior
        e.preventDefault();
        setSearchTerm('');
    };
    const handleUpdateIngridient = (value, key = 'id') => {
        const selectedIds = selectedIngredients.map(f => f.id);
        if (selectedIds.includes(Number(value))) {
            setSelectedIngredients(selectedIngredients.filter(f => f.id !== Number(value)));
            return;
        }
        const food = foods.find(f => f[key] === Number(value));
        if (food && !selectedIngredients.find(i => i.id === food.id)) {
            setSelectedIngredients([...selectedIngredients, food]);
        }
    };
    if (loading)
        return _jsx("div", { className: "p-4", children: "Loading..." });
    return (_jsxs("div", { className: "p-4 max-w-3xl mx-auto", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow inline-flex", children: [_jsx("button", { className: `px-4 py-2 rounded-l-lg ${language === 'en' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`, onClick: () => setLanguage('en'), children: "English" }), _jsx("button", { className: `px-4 py-2 rounded-r-lg ${language === 'ru' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`, onClick: () => setLanguage('ru'), children: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" })] }) }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: language === 'en' ? 'Ingredients Compatibility Checker' : 'Проверка совместимости ингредиентов' }), _jsxs("div", { className: "mb-6 relative", children: [selectedIngredients.length > 0 && _jsx("button", { className: 'absolute right-0 -top-6 ml-auto text-gray-500', onClick: () => { setSelectedIngredients([]); }, children: "clear all" }), _jsxs("div", { className: `flex flex-wrap gap-2 border-2 rounded p-2 cursor-pointer ${openMenu ? 'border-blue-300' : ''}`, tabIndex: 1, onClick: () => { setOpenMenu(openMenu ? false : true); }, children: [selectedIngredients.length === 0 ? _jsx("p", { className: 'px-1 py-1', children: language === 'en' ? '+ Add ingredient' : '+ Добавить ингредиент' }) : null, selectedIngredients.map(ingredient => (_jsxs("div", { className: "px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2", children: [_jsx("span", { children: language === 'en' ? ingredient.name : ingredient.name_ru }), _jsx("button", { onClick: () => setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredient.id)), className: "text-gray-500 hover:text-red-500", children: "\u00D7" })] }, ingredient.id)))] }), openMenu && _jsxs("div", { className: "border rounded p-2 absolute mt-1 z-[1] bg-white w-full gap-2 flex flex-col", children: [_jsx("input", { type: "text", autoFocus: true, value: searchTerm, onChange: handleSearchInput, onPaste: handlePasteInput, className: "w-full p-2 border rounded", placeholder: "Search ingredient (e.g., 'tomato' or 'vegetable')..." }), _jsx("ul", { className: 'overflow-y-auto max-h-[250px]', onClick: (e) => {
                                            const value = e.target?.value;
                                            if (value == null)
                                                return;
                                            handleUpdateIngridient(value);
                                        }, children: foods.filter(food => language === 'en' ? food.name.toLowerCase().includes(searchTerm.toLowerCase()) : food.name_ru.toLowerCase().includes(searchTerm.toLowerCase())).map(food => (_jsx("li", { value: food.id, className: `py-1 cursor-pointer hover:bg-gray-200 ${selectedIngredients.map(f => f.id).includes(food.id) ? 'bg-blue-100' : ''}`, children: language === 'en' ? food.name : food.name_ru }, food.id))) })] }), _jsx("button", { onClick: checkIngredients, disabled: selectedIngredients.length < 2, className: "mt-4 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50", children: language === 'en' ? 'Check Compatibility' : 'Проверить совместимость' })] }), matchResults && (_jsxs("div", { className: "space-y-4", children: [matchResults.goodPairs.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-green-600 mb-2", children: language === 'en' ? 'Good combinations:' : 'Хорошие сочетания:' }), _jsx("div", { className: "space-y-1", children: matchResults.goodPairs.map(pair => (_jsxs("div", { className: "text-green-600", children: ["\u2713 ", pair] }, pair))) })] })), matchResults.badPairs.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "font-semibold text-red-600 mb-2", children: language === 'en' ? 'Not found in database:' : 'Не найдено в базе данных:' }), _jsx("div", { className: "space-y-1", children: matchResults.badPairs.map(pair => (_jsxs("div", { className: "text-red-600", children: ["\u2717 ", pair] }, pair))) })] }))] }))] })] }));
};
export default IngredientsChecker;
