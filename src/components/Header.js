import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const links = [
        { to: "/", label: "Home" },
        { to: "/foods", label: "Foods" },
        { to: "/combinations", label: "Combinations" },
        { to: "/checker", label: "Checker" },
    ];
    return (_jsx("header", { className: "bg-white shadow", children: _jsxs("nav", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "hidden md:flex items-center justify-between h-16", children: [_jsx(Link, { to: "/", className: "text-xl font-bold text-blue-600", children: "FoodPairs" }), _jsx("ul", { className: "flex gap-6", children: links.map(link => (_jsx("li", { children: _jsx(Link, { to: link.to, className: `hover:text-blue-600 ${location.pathname === link.to ? 'text-blue-600 font-medium' : 'text-gray-600'}`, children: link.label }) }, link.to))) })] }), _jsxs("div", { className: "md:hidden flex items-center justify-between h-14", children: [_jsx(Link, { to: "/", className: "text-lg font-bold text-blue-600", children: "FoodPairs" }), _jsx("button", { onClick: () => setIsMenuOpen(!isMenuOpen), className: "p-2 rounded-lg hover:bg-gray-100", children: isMenuOpen ? (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })) : (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })) })] }), isMenuOpen && (_jsx("div", { className: "md:hidden py-2 border-t", children: _jsx("ul", { className: "space-y-1", children: links.map(link => (_jsx("li", { children: _jsx(Link, { to: link.to, className: `block px-4 py-2 rounded-lg ${location.pathname === link.to
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'}`, onClick: () => setIsMenuOpen(false), children: link.label }) }, link.to))) }) }))] }) }));
};
export default Header;
