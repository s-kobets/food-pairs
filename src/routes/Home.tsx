import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Food Combinations</span>
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover perfect food pairings, check ingredient compatibility, and explore culinary combinations in English and Russian.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Combinations Database */}
          <Link 
            to="/combinations" 
            className="relative group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-left">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-md mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Combinations Database
              </h3>
              <p className="text-gray-500">
                Browse and add food combinations with ratings and categories.
              </p>
            </div>
            <div className="absolute bottom-4 right-6 text-blue-500 group-hover:translate-x-1 transition-transform duration-200">
              →
            </div>
          </Link>

          {/* Ingredients Checker */}
          <Link 
            to="/checker" 
            className="relative group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-left">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-md mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compatibility Checker
              </h3>
              <p className="text-gray-500">
                Check if your ingredients work well together instantly.
              </p>
            </div>
            <div className="absolute bottom-4 right-6 text-blue-500 group-hover:translate-x-1 transition-transform duration-200">
              →
            </div>
          </Link>

          {/* Foods Database */}
          <Link 
            to="/foods" 
            className="relative group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-left">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-md mb-4">
                <span className="text-2xl">🥗</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Foods Database
              </h3>
              <p className="text-gray-500">
                Explore our comprehensive database of ingredients and categories.
              </p>
            </div>
            <div className="absolute bottom-4 right-6 text-blue-500 group-hover:translate-x-1 transition-transform duration-200">
              →
            </div>
          </Link>
        </div>

        {/* Example Combinations */}
        <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Combinations
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { items: "Tomato + Basil", rating: 5, category: "Classic Pairs" },
              { items: "Potato + Mushrooms", rating: 4, category: "Comfort Food" },
              { items: "Salmon + Lemon", rating: 5, category: "Seafood" },
              { items: "Beef + Garlic", rating: 5, category: "Meat" },
              { items: "Apple + Cinnamon", rating: 5, category: "Sweet" },
              { items: "Olive Oil + Balsamic", rating: 4, category: "Dressings" }
            ].map((combo, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-sm text-blue-600 mb-1">{combo.category}</div>
                <div className="font-medium text-gray-900">{combo.items}</div>
                <div className="text-yellow-400 mt-1">
                  {"⭐".repeat(combo.rating)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Quick Start Guide
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="bg-gray-50 p-6 rounded-lg h-full">
                <h3 className="font-semibold text-gray-900 mb-2">Check Compatibility</h3>
                <p className="text-gray-600">
                  Go to the Checker tool and select multiple ingredients to instantly see which combinations work well together.
                </p>
                <Link 
                  to="/checker"
                  className="inline-block mt-4 text-blue-500 hover:text-blue-600"
                >
                  Try Checker →
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 -top-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="bg-gray-50 p-6 rounded-lg h-full">
                <h3 className="font-semibold text-gray-900 mb-2">Browse Combinations</h3>
                <p className="text-gray-600">
                  Explore our database of food combinations, complete with ratings and category information.
                </p>
                <Link 
                  to="/combinations"
                  className="inline-block mt-4 text-blue-500 hover:text-blue-600"
                >
                  View Combinations →
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 -top-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="bg-gray-50 p-6 rounded-lg h-full">
                <h3 className="font-semibold text-gray-900 mb-2">Add New Combinations</h3>
                <p className="text-gray-600">
                  Contribute to our database by adding your own successful food combinations and ratings.
                </p>
                <Link 
                  to="/combinations"
                  className="inline-block mt-4 text-blue-500 hover:text-blue-600"
                >
                  Add Combination →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-block bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600">
                💡 <span className="font-medium">Pro Tip:</span> Use categories to find broader combinations. 
                For example, "Citrus + Fish" will show you various citrus fruits that pair well with different fish.
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Key Features
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🌍", title: "Bilingual Support", desc: "English and Russian language support" },
              { icon: "⭐", title: "Rating System", desc: "Rate combinations from 1 to 5 stars" },
              { icon: "🔄", title: "Smart Matching", desc: "Matches both specific foods and categories" },
              { icon: "📱", title: "Mobile Friendly", desc: "Works great on all devices" },
              { icon: "🎯", title: "Easy to Use", desc: "Intuitive interface for quick access" },
              { icon: "🔍", title: "Smart Search", desc: "Find combinations instantly" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start p-4">
                <div className="flex-shrink-0 text-2xl mr-4">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 