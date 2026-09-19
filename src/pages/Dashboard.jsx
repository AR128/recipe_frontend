import { useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth';
import picture1 from '../assets/Picture1.png';

const recipes = [
  { id: 1, title: 'Spicy Tomato Pasta', author: 'Chef Mario', time: '30 mins', image: picture1, category: 'Dinner' },
  { id: 2, title: 'Avocado Toast with Egg', author: 'Jane Doe', time: '15 mins', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Breakfast' },
  { id: 3, title: 'Blueberry Pancakes', author: 'John Smith', time: '25 mins', image: 'https://images.unsplash.com/photo-1528207776546-3221976a1611?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Breakfast' },
  { id: 4, title: 'Classic Margherita Pizza', author: 'Luigi', time: '45 mins', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Dinner' },
  { id: 5, title: 'Healthy Green Smoothie', author: 'Alice Waters', time: '10 mins', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Drink' },
  { id: 6, title: 'Chocolate Chip Cookies', author: 'Grandma Betty', time: '40 mins', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', category: 'Dessert' },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 border-b border-gray-200">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl" style={{ fontFamily: 'Georgia, serif' }}>
              Delicious Recipes
            </h1>
            {user && (
              <p className="mt-2 text-sm text-[#dc4c4c] font-medium">
                Welcome back, {user.username}!
              </p>
            )}
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover a world of flavor. From quick weeknight dinners to show-stopping desserts, find your next favorite meal here.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            Latest Recipes
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm">All</button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm">Breakfast</button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm">Dinner</button>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#dc4c4c] hover:bg-[#c94343] text-white text-sm font-medium rounded-full transition shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                  {recipe.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#dc4c4c] transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                  {recipe.title}
                </h3>
                <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {recipe.author}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {recipe.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
