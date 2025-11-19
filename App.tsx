import { useState, useEffect } from 'react';
import { Home, PlusCircle, ShoppingBag, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import SpendingSummary from './components/SpendingSummary';
import ShoppingDeals from './components/ShoppingDeals';
import ShoppingList from './components/ShoppingList';
import Settings from './components/Settings';

type Screen = 'dashboard' | 'add-expense' | 'spending-summary' | 'shopping-deals' | 'shopping-list' | 'settings';
type Theme = 'light' | 'dark';
type UserData = {
  name: string;
  email: string;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [expenses, setExpenses] = useState([
    { id: 1, amount: 250, category: 'Food', date: '2025-11-10', notes: 'Lunch at canteen' },
    { id: 2, amount: 50, category: 'Transport', date: '2025-11-10', notes: 'Metro ride' },
    { id: 3, amount: 120, category: 'Entertainment', date: '2025-11-09', notes: 'Movie ticket' },
    { id: 4, amount: 200, category: 'Food', date: '2025-11-09', notes: 'Dinner with friends' },
    { id: 5, amount: 100, category: 'Shopping', date: '2025-11-08', notes: 'Notebooks' },
  ]);

  // Load authentication state from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('finpulse-auth');
    const savedUser = localStorage.getItem('finpulse-user');
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(savedUser));
    }
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('finpulse-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('finpulse-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Hide splash screen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: UserData) => {
    setUserData(user);
    setIsAuthenticated(true);
    localStorage.setItem('finpulse-auth', 'true');
    localStorage.setItem('finpulse-user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setCurrentScreen('dashboard');
    localStorage.removeItem('finpulse-auth');
    localStorage.removeItem('finpulse-user');
  };

  const addExpense = (expense: { amount: number; category: string; date: string; notes: string }) => {
    const newExpense = {
      id: expenses.length + 1,
      ...expense,
    };
    setExpenses([newExpense, ...expenses]);
    setCurrentScreen('dashboard');
  };

  const handleSearch = (results: any[]) => {
    setSearchResults(results);
    setCurrentScreen('shopping-list');
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const renderScreen = () => {
    const screenProps = { theme };
    
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentScreen} expenses={expenses} {...screenProps} />;
      case 'add-expense':
        return <AddExpense onNavigate={setCurrentScreen} onAddExpense={addExpense} {...screenProps} />;
      case 'spending-summary':
        return <SpendingSummary onNavigate={setCurrentScreen} expenses={expenses} {...screenProps} />;
      case 'shopping-deals':
        return <ShoppingDeals onNavigate={setCurrentScreen} onSearch={handleSearch} {...screenProps} />;
      case 'shopping-list':
        return <ShoppingList onNavigate={setCurrentScreen} searchResults={searchResults} {...screenProps} />;
      case 'settings':
        return <Settings onNavigate={setCurrentScreen} currentTheme={theme} onThemeChange={handleThemeChange} onLogout={handleLogout} userData={userData} {...screenProps} />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} expenses={expenses} {...screenProps} />;
    }
  };

  const showBottomNav = currentScreen === 'dashboard' || currentScreen === 'shopping-deals';

  // Show splash screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } flex items-center justify-center p-4 transition-colors duration-300`}>
      {/* Mobile Frame */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md h-[812px] ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        } rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-8 ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-800'
        }`}
      >
        {/* Screen Content with Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${
              theme === 'dark' 
                ? 'bg-gray-800/95 border-gray-700' 
                : 'bg-white/80 border-gray-200'
            } backdrop-blur-lg border-t px-6 py-3 flex justify-around items-center`}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('dashboard')}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentScreen === 'dashboard' 
                  ? 'text-blue-600 scale-110' 
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('add-expense')}
              className="flex flex-col items-center gap-1 text-gray-400 relative"
            >
              <motion.div 
                whileHover={{ rotate: 90 }}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center -mt-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <PlusCircle className="w-7 h-7 text-white" />
              </motion.div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('shopping-deals')}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentScreen === 'shopping-deals' 
                  ? 'text-blue-600 scale-110' 
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xs">Deals</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('settings')}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentScreen === 'settings' 
                  ? 'text-blue-600 scale-110' 
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}
            >
              <motion.div
                animate={{ rotate: currentScreen === 'settings' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsIcon className="w-6 h-6" />
              </motion.div>
              <span className="text-xs">Settings</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}