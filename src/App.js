import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './routes/Home';
import Combinations from './routes/Combinations';
import Profile from './routes/Profile';
import Foods from './routes/Foods';
import { useEffect, useState } from 'react';
import { setupDatabase, checkDatabaseHealth } from './lib/setupDatabase';
import IngredientsChecker from './routes/IngredientsChecker';
function App() {
    const { pathname } = window.location;
    const [isDbReady, setIsDbReady] = useState(false);
    const [dbError, setDbError] = useState(null);
    const isMainPage = pathname === '/';
    useEffect(() => {
        if (isMainPage)
            return;
        const initializeDatabase = async () => {
            try {
                // Check if database is healthy first
                const isHealthy = await checkDatabaseHealth();
                if (!isHealthy) {
                    // Only run setup if health check fails
                    const success = await setupDatabase();
                    if (!success) {
                        throw new Error('Failed to initialize database');
                    }
                }
                setIsDbReady(true);
            }
            catch (error) {
                setDbError(error instanceof Error ? error.message : 'Database initialization failed');
            }
        };
        initializeDatabase();
    }, [isMainPage]);
    if (dbError) {
        return _jsxs("div", { className: "text-red-500", children: ["Error: ", dbError] });
    }
    if (!isMainPage && !isDbReady) {
        return _jsx("div", { children: "Setting up database..." });
    }
    return (_jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(Header, {}), _jsx("main", { className: "container mx-auto px-4 py-8", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/foods", element: _jsx(Foods, {}) }), _jsx(Route, { path: "/combinations", element: _jsx(Combinations, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "/checker", element: _jsx(IngredientsChecker, {}) })] }) }), _jsx(Toaster, { position: "bottom-right" })] }) }) }));
}
export default App;
