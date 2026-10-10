import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Search,
  Star,
  Clock,
  MapPin,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldCheck,
  Code2,
  Filter,
  Check,
  Copy,
  Zap,
  Phone
} from 'lucide-react';
import { User, Restaurant, FoodItem, Cart, Order, OrderStatus } from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { CustomerOrders } from './components/CustomerOrders';
import { CustomerProfile } from './components/CustomerProfile';
import { JavaCodeViewerModal } from './components/JavaCodeViewerModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Global User & State
  const [currentUser, setCurrentUser] = useState<User | null>(api.getSavedUser());
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'owner' | 'orders' | 'profile' | 'track'>('home');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Restaurants & Foods data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('742 Evergreen Terrace, Springfield, OR');
  const [pureVegOnly, setPureVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'time'>('featured');
  const [loading, setLoading] = useState<boolean>(true);

  // Cart
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isJavaViewerOpen, setIsJavaViewerOpen] = useState<boolean>(false);
  const [couponCopied, setCouponCopied] = useState<boolean>(false);

  // User Orders
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Data Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [rests, foods, currentCart] = await Promise.all([
        api.getRestaurants(),
        api.getFoods(),
        api.getCart(),
      ]);
      setRestaurants(rests);
      setPopularFoods(foods);
      setCart(currentCart);

      // Load initial orders
      const orders = await api.getOrders();
      setUserOrders(orders);
    } catch (err: any) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart
  const refreshCart = async () => {
    try {
      const updated = await api.getCart();
      setCart(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Cart Operations
  const handleAddToCart = async (foodItemId: number, quantity: number = 1) => {
    try {
      const updatedCart = await api.addToCart(foodItemId, quantity);
      setCart(updatedCart);
      const food = popularFoods.find(f => f.id === foodItemId);
      showToast(`Added ${food?.name || 'dish'} to cart!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update cart', 'error');
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, newQty: number) => {
    try {
      const updatedCart = await api.updateCartItem(cartItemId, newQty);
      setCart(updatedCart);
    } catch (err: any) {
      showToast(err.message || 'Failed to update item quantity', 'error');
    }
  };

  const handleRemoveCartItem = async (cartItemId: number) => {
    try {
      const updatedCart = await api.removeCartItem(cartItemId);
      setCart(updatedCart);
      showToast('Item removed from cart', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  // Quick Account Login Switcher
  const handleQuickLogin = async (email: string) => {
    const password = email.startsWith('admin')
      ? 'Admin123!'
      : email.startsWith('owner')
      ? 'Owner123!'
      : 'Password123!';

    try {
      const resp = await api.login(email, password);
      setCurrentUser(resp.user);
      showToast(`Switched account to ${resp.user.name} (${resp.user.role})`, 'success');

      // Auto switch view based on role
      if (resp.user.role === 'ADMIN') {
        setCurrentView('admin');
      } else if (resp.user.role === 'RESTAURANT_OWNER') {
        setCurrentView('owner');
      } else {
        setCurrentView('home');
      }

      await refreshCart();
      const orders = await api.getOrders();
      setUserOrders(orders);
    } catch (err: any) {
      showToast(err.message || 'Quick login failed', 'error');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentView('home');
    showToast('Signed out of FoodHub', 'info');
  };

  const handleOrderSuccess = async (placedOrder: Order) => {
    setConfirmedOrder(placedOrder);
    setSelectedOrder(placedOrder);
    setIsOrderConfirmationOpen(true);
    await refreshCart();
    const orders = await api.getOrders();
    setUserOrders(orders);
  };

  const handleReorder = async (order: Order) => {
    try {
      if (order.items.length === 0) return;
      for (const item of order.items) {
        await api.addToCart(item.foodItemId, item.quantity);
      }
      await refreshCart();
      setIsCartOpen(true);
      showToast(`Added dishes from Order #${order.id} to cart`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder', 'error');
    }
  };

  const copyCouponCode = () => {
    navigator.clipboard.writeText('FOODHUB50');
    setCouponCopied(true);
    showToast('Coupon code FOODHUB50 copied! Apply at checkout.', 'success');
    setTimeout(() => setCouponCopied(false), 2500);
  };

  // Filtered restaurants
  let filteredRestaurants = restaurants.filter(r => {
    if (selectedCuisine !== 'All' && !r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())) {
      return false;
    }
    if (pureVegOnly) {
      const hasVegDish = popularFoods.some(f => f.restaurantId === r.id && f.isVeg);
      if (!hasVegDish) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = r.name.toLowerCase().includes(q);
      const matchesDesc = r.description.toLowerCase().includes(q);
      const matchesCuisine = r.cuisine.toLowerCase().includes(q);
      const hasFoodMatch = popularFoods.some(
        f => f.restaurantId === r.id && (f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
      );
      return matchesName || matchesDesc || matchesCuisine || hasFoodMatch;
    }
    return true;
  });

  // Sort restaurants
  if (sortBy === 'rating') {
    filteredRestaurants = [...filteredRestaurants].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'time') {
    filteredRestaurants = [...filteredRestaurants].sort((a, b) => {
      const timeA = parseInt(a.deliveryTime) || 30;
      const timeB = parseInt(b.deliveryTime) || 30;
      return timeA - timeB;
    });
  }

  const cuisines = ['All', 'Italian', 'Indian', 'Japanese', 'Burgers', 'Healthy'];

  const foodCategories = [
    { name: 'Pizzas', image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=200&q=80', tag: 'Handmade Sourdough' },
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80', tag: 'Dum Royal' },
    { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80', tag: 'Smash Angus' },
    { name: 'Ramen', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80', tag: 'Tonkotsu Broth' },
    { name: 'Sushi', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=200&q=80', tag: 'Nigiri & Rolls' },
    { name: 'Pasta', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=200&q=80', tag: 'Fresh Truffle' },
    { name: 'Bowls', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80', tag: 'Organic Greens' },
    { name: 'Desserts', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=200&q=80', tag: 'Sweet Treats' },
  ];

  const totalCartCount = cart?.items.reduce((sum, it) => sum + it.quantity, 0) || 0;

  return (
    <div className="min-h-screen d-flex flex-column bg-[#F8F9FA] text-[#212529]">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        cartCount={totalCartCount}
        cartTotal={cart?.total || 0}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode = 'login') => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenJavaViewer={() => setIsJavaViewerOpen(true)}
        onOpenOrders={() => setCurrentView('orders')}
        onOpenProfile={() => setCurrentView('profile')}
        onNavigateHome={() => setCurrentView('home')}
        currentView={currentView}
        onSwitchView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        onQuickLogin={handleQuickLogin}
        onShowToast={showToast}
      />

      {/* Main Content View Switcher */}
      <main className="flex-grow-1">
        {/* VIEW 1: Admin Dashboard */}
        {currentView === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onShowToast={showToast}
            onViewOrder={order => {
              setSelectedOrder(order);
              setIsTrackingOpen(true);
            }}
          />
        )}

        {/* VIEW 2: Restaurant Owner Dashboard */}
        {currentView === 'owner' && (
          <OwnerDashboard
            currentUser={currentUser}
            onShowToast={showToast}
            onViewOrder={order => {
              setSelectedOrder(order);
              setIsTrackingOpen(true);
            }}
          />
        )}

        {/* VIEW 3: Customer Orders History */}
        {currentView === 'orders' && (
          <CustomerOrders
            orders={userOrders}
            onViewOrder={order => {
              setSelectedOrder(order);
              setCurrentView('track');
            }}
            onReorder={handleReorder}
            onExploreFood={() => setCurrentView('home')}
          />
        )}

        {/* VIEW: Dedicated Live Order Tracking Page */}
        {currentView === 'track' && (
          <OrderTrackingPage
            orderId={selectedOrder?.id}
            initialOrder={selectedOrder}
            currentUser={currentUser}
            onNavigateHome={() => setCurrentView('home')}
            onNavigateOrders={() => setCurrentView('orders')}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 4: Customer Profile */}
        {currentView === 'profile' && (
          <CustomerProfile
            currentUser={currentUser}
            onProfileUpdated={updated => setCurrentUser(updated)}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 5: Home Page (Default Customer Experience) */}
        {currentView === 'home' && (
          <div className="animate-in fade-in space-y-5 pb-5">
            {/* Hero Banner Section */}
            <section className="bg-gradient-to-br from-[#212529] via-[#2A2E33] to-[#1C1E22] text-white py-5 py-md-5 overflow-hidden position-relative">
              {/* Atmospheric glows */}
              <div
                className="position-absolute top-0 end-25 w-96 h-96 bg-[#FF5A1F] opacity-20 rounded-circle blur-3xl pointer-events-none"
              />
              <div
                className="position-absolute bottom-0 start-10 w-72 h-72 bg-[#FFC107] opacity-15 rounded-circle blur-2xl pointer-events-none"
              />

              <div className="container-xl position-relative z-10">
                <div className="row align-items-center g-4">
                  {/* Left Column: Hero Text & Search */}
                  <div className="col-12 col-lg-7 space-y-4">
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-white/10 backdrop-blur-md border border-white/15 text-warning text-xs fw-bold">
                      <Sparkles className="w-3.5 h-3.5 text-warning" />
                      <span>Free Delivery on your first 3 FoodHub orders!</span>
                    </div>

                    <h1 className="display-4 display-md-3 fw-black text-white font-heading tracking-tight lh-tight">
                      Artisan Flavors Delivered{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A1F] via-[#FF8A00] to-[#FFC107]">
                        Fresh & Hot.
                      </span>
                    </h1>

                    <p className="text-light opacity-80 text-xs text-md-sm max-w-xl lh-base">
                      Explore top-rated Italian trattorias, royal biryani masters, Japanese ramen bars, and organic superfood cafes. Real-time visual timeline tracking from wok to doorstep.
                    </p>

                    {/* Search Bar in Hero */}
                    <div className="pt-2 max-w-xl">
                      <div className="card rounded-pill p-1.5 shadow-2xl border-0 bg-white">
                        <div className="d-flex align-items-center">
                          <Search className="w-5 h-5 text-muted ms-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search dishes, burgers, pizzas, curries..."
                            className="form-control form-control-sm border-0 bg-transparent text-dark text-xs text-md-sm px-2.5 focus:shadow-none"
                          />
                          <button
                            onClick={() => {
                              const el = document.getElementById('restaurants-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="btn btn-primary rounded-pill px-4 py-2 text-xs text-md-sm fw-bold shadow-sm d-inline-flex align-items-center gap-1.5 flex-shrink-0"
                          >
                            <span>Find Food</span>
                            <ArrowRight className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="d-flex flex-wrap align-items-center gap-4 pt-2 text-xs text-light opacity-90 fw-semibold">
                      <div className="d-flex align-items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#FF5A1F]" />
                        <span>Avg. 25-35 mins</span>
                      </div>
                      <div className="d-flex align-items-center gap-1.5">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span>4.8+ Top Rated Kitchens</span>
                      </div>
                      <div className="d-flex align-items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-success" />
                        <span>Simulated COD & Instant UPI</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hero Graphic Card with Coupon Promotion */}
                  <div className="col-12 col-lg-5 d-none d-lg-block">
                    <div className="position-relative mx-auto" style={{ maxWidth: '420px' }}>
                      <div className="rounded-4 overflow-hidden shadow-2xl border border-white/10 card-hover-lift">
                        <img
                          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80"
                          alt="Gourmet Dining Feast"
                          className="w-100 object-fit-cover"
                          style={{ height: '320px' }}
                        />
                      </div>

                      {/* Floating Coupon Badge Card */}
                      <div className="position-absolute bottom-0 start-0 translate-middle-x mb-n3 ms-5 bg-white text-dark p-3 rounded-4 shadow-xl border d-flex align-items-center gap-3">
                        <div className="w-10 h-10 rounded-3 bg-orange-50 text-[#FF5A1F] d-flex align-items-center justify-center fw-bold">
                          <Flame className="w-5 h-5 text-[#FF5A1F] fill-current" />
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-xs fw-black text-dark font-heading">50% Off First Feast</span>
                            <button
                              onClick={copyCouponCode}
                              className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill text-[10px] fw-bold d-inline-flex align-items-center gap-1 px-2 py-0.5"
                              title="Copy code"
                            >
                              <span>FOODHUB50</span>
                              {couponCopied ? <Check className="w-2.5 h-2.5 text-success" /> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-muted mb-0">Auto applied on orders over $40</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Food Categories Horizontal Grid */}
            <section className="container-xl py-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h2 className="fs-4 fw-black text-dark font-heading mb-0">Popular Food Categories</h2>
                  <p className="text-muted text-xs mb-0">Craving something specific? Tap to filter dishes</p>
                </div>
              </div>

              <div className="row g-2 g-md-3">
                {foodCategories.map(cat => (
                  <div key={cat.name} className="col-3 col-md-3 col-lg-1-5">
                    <button
                      onClick={() => {
                        setSearchQuery(cat.name);
                        const el = document.getElementById('restaurants-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="card border rounded-4 p-2 text-center shadow-xs hover:border-orange-300 card-hover-lift w-100 bg-white transition cursor-pointer"
                    >
                      <div className="w-12 h-12 w-md-14 h-md-14 rounded-3 overflow-hidden mx-auto mb-1.5 shadow-2xs">
                        <img src={cat.image} alt={cat.name} className="w-100 h-100 object-fit-cover" />
                      </div>
                      <span className="text-xs fw-bold text-dark d-block text-truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-muted d-none d-sm-block text-truncate">
                        {cat.tag}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Deals & Promotional Highlight Cards */}
            <section className="container-xl py-2">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="card rounded-4 border-0 p-4 bg-gradient-to-r from-orange-500 to-[#FF5A1F] text-white shadow-sm position-relative overflow-hidden card-hover-lift">
                    <div className="position-relative z-10" style={{ maxWidth: '320px' }}>
                      <span className="badge bg-white text-[#FF5A1F] rounded-pill px-2.5 py-1 text-[11px] fw-black text-uppercase mb-2">
                        SPECIAL SAVINGS
                      </span>
                      <h3 className="fs-5 fw-black text-white font-heading mb-1">
                        Get $5.00 OFF Instant Discount
                      </h3>
                      <p className="text-light opacity-90 text-xs mb-3">
                        On all orders over $40. Applied automatically with code FOODHUB50.
                      </p>
                      <button
                        onClick={copyCouponCode}
                        className="btn btn-sm btn-light rounded-pill px-3 py-1.5 text-xs fw-bold text-[#FF5A1F] shadow-sm d-inline-flex align-items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>Apply FOODHUB50</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="card rounded-4 border-0 p-4 bg-gradient-to-r from-dark to-secondary text-white shadow-sm position-relative overflow-hidden card-hover-lift">
                    <div className="position-relative z-10" style={{ maxWidth: '320px' }}>
                      <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1 text-[11px] fw-black text-uppercase mb-2">
                        CHEF CURATED
                      </span>
                      <h3 className="fs-5 fw-black text-white font-heading mb-1">
                        18-Hour Broth Ramen & Truffle Pasta
                      </h3>
                      <p className="text-light opacity-90 text-xs mb-3">
                        Prepared fresh by award-winning local chefs with premium authentic ingredients.
                      </p>
                      <button
                        onClick={() => {
                          const rest = restaurants[0];
                          if (rest) setSelectedRestaurant(rest);
                        }}
                        className="btn btn-sm btn-outline-light rounded-pill px-3 py-1.5 text-xs fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                      >
                        <span>Explore Chef Menus</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Restaurant Listing Section */}
            <section id="restaurants-section" className="container-xl py-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                  <h2 className="fs-3 fw-black text-dark font-heading mb-0">Featured Restaurants</h2>
                  <p className="text-muted text-xs mb-0">
                    {filteredRestaurants.length} verified culinary partners in your delivery zone
                  </p>
                </div>

                {/* Filter and Sort Bar */}
                <div className="d-flex flex-wrap align-items-center gap-2">
                  {/* Cuisine Pills */}
                  <div className="d-flex align-items-center gap-1 overflow-x-auto pb-1" style={{ maxWidth: '420px' }}>
                    {cuisines.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedCuisine(c)}
                        className={`btn btn-sm rounded-pill text-xs fw-bold px-3 py-1 text-nowrap transition ${
                          selectedCuisine === c
                            ? 'btn-primary'
                            : 'btn-outline-secondary bg-white text-dark border'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Pure Veg Switch */}
                  <div className="form-check form-switch d-flex align-items-center gap-1.5 m-0 ps-0 bg-white border rounded-pill px-2.5 py-1">
                    <label className="form-check-label text-xs fw-bold text-dark cursor-pointer me-1" htmlFor="homeVegSwitch">
                      Veg Only
                    </label>
                    <input
                      className="form-check-input m-0 cursor-pointer"
                      type="checkbox"
                      role="switch"
                      id="homeVegSwitch"
                      checked={pureVegOnly}
                      onChange={e => setPureVegOnly(e.target.checked)}
                      style={{ width: '2rem', height: '1.1rem' }}
                    />
                  </div>

                  {/* Sort Selector */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="form-select form-select-sm rounded-pill text-xs fw-bold bg-white border"
                    style={{ width: '140px' }}
                  >
                    <option value="featured">Featured First</option>
                    <option value="rating">Top Rated ★</option>
                    <option value="time">Fastest Delivery ⚡</option>
                  </select>
                </div>
              </div>

              {/* Restaurant Cards Grid */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-[#FF5A1F]" role="status">
                    <span className="visually-hidden">Loading kitchens...</span>
                  </div>
                  <p className="text-xs text-muted mt-2 fw-bold">Fetching local culinary partners...</p>
                </div>
              ) : filteredRestaurants.length === 0 ? (
                <div className="card rounded-4 border p-5 text-center bg-white shadow-xs">
                  <div className="w-16 h-16 rounded-circle bg-orange-50 text-[#FF5A1F] d-flex align-items-center justify-center mx-auto mb-3">
                    <Filter className="w-8 h-8" />
                  </div>
                  <h3 className="fs-5 fw-bold text-dark font-heading">No Restaurants Match Your Criteria</h3>
                  <p className="text-muted text-xs max-w-sm mx-auto mb-3">
                    We couldn't find any partners matching "{searchQuery}" with the selected filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCuisine('All');
                      setSearchQuery('');
                      setPureVegOnly(false);
                      setSortBy('featured');
                    }}
                    className="btn btn-sm btn-primary rounded-pill px-4 py-2 text-xs fw-bold mx-auto"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredRestaurants.map(rest => (
                    <div key={rest.id} className="col-12 col-md-6 col-lg-4">
                      <div className="card rounded-4 border overflow-hidden shadow-xs hover:border-orange-300 card-hover-lift h-100 bg-white transition group">
                        {/* Cover Image */}
                        <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                          <img
                            src={rest.imageUrl}
                            alt={rest.name}
                            className="w-100 h-100 object-fit-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="position-absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                          {/* Badges on image */}
                          <div className="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center">
                            <span className="badge bg-dark bg-opacity-75 text-white rounded-pill px-2.5 py-1 text-[11px] fw-bold">
                              {rest.cuisine}
                            </span>
                            <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1 text-xs fw-black d-inline-flex align-items-center gap-1 shadow-sm">
                              <Star className="w-3.5 h-3.5 fill-current text-dark" />
                              <span>{rest.rating}</span>
                            </span>
                          </div>

                          {/* Delivery Time Badge */}
                          <div className="position-absolute bottom-0 start-0 m-3 badge bg-white text-dark rounded-pill px-2.5 py-1 text-[11px] fw-bold d-inline-flex align-items-center gap-1 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                            <span>{rest.deliveryTime}</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 d-flex flex-column justify-content-between flex-grow-1">
                          <div>
                            <h3 className="fs-5 fw-black text-dark font-heading mb-1 group-hover:text-[#FF5A1F] transition text-truncate">
                              {rest.name}
                            </h3>
                            <p className="text-muted text-xs line-clamp-2 mb-3" style={{ lineHeight: '1.4' }}>
                              {rest.description}
                            </p>
                            <div className="d-flex align-items-center gap-1.5 text-muted text-[11px] mb-3">
                              <MapPin className="w-3.5 h-3.5 text-[#FF5A1F] flex-shrink-0" />
                              <span className="text-truncate">{rest.address}</span>
                            </div>
                          </div>

                          <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-2">
                            <span className="text-[11px] fw-bold text-success d-inline-flex align-items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                              <span>Free Delivery &gt; $35</span>
                            </span>

                            <button
                              onClick={() => setSelectedRestaurant(rest)}
                              className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm transition active:scale-95"
                            >
                              <span>View Menu</span>
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Popular Food Items Section */}
            <section className="container-xl py-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h2 className="fs-3 fw-black text-dark font-heading mb-0">Trending Dishes Near You</h2>
                  <p className="text-muted text-xs mb-0">Top ordered meals prepared hot and fresh today</p>
                </div>
              </div>

              <div className="row g-3 g-md-4">
                {popularFoods.slice(0, 8).map(food => {
                  const rest = restaurants.find(r => r.id === food.restaurantId);
                  const inCartItem = cart?.items.find(ci => ci.foodItemId === food.id);
                  const qty = inCartItem?.quantity || 0;
                  const isAvailable = food.isAvailable !== false;

                  return (
                    <div key={food.id} className="col-12 col-sm-6 col-lg-3">
                      <div className={`card rounded-4 border p-3 shadow-xs hover:border-orange-300 card-hover-lift h-100 bg-white transition d-flex flex-column justify-content-between ${!isAvailable ? 'opacity-75' : ''}`}>
                        <div>
                          {/* Image with veg and availability badges */}
                          <div className="position-relative rounded-3 overflow-hidden mb-2.5 cursor-pointer" style={{ height: '160px' }} onClick={() => rest && setSelectedRestaurant(rest)}>
                            <img
                              src={food.imageUrl}
                              alt={food.name}
                              className={`w-100 h-100 object-fit-cover transition duration-300 hover:scale-105 ${!isAvailable ? 'grayscale' : ''}`}
                            />
                            <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                              <span
                                className={`badge text-[10px] fw-bold rounded-pill ${
                                  food.isVeg ? 'bg-success text-white' : 'bg-danger text-white'
                                }`}
                              >
                                {food.isVeg ? 'Veg' : 'Non-Veg'}
                              </span>
                              {!isAvailable && (
                                <span className="badge bg-danger text-white text-[10px] fw-bold rounded-pill">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => rest && setSelectedRestaurant(rest)}
                            className="btn btn-link p-0 text-[11px] fw-bold text-[#FF5A1F] text-uppercase tracking-wider d-block text-decoration-none text-start hover:underline"
                          >
                            {rest?.name || 'Chef Specialty'} →
                          </button>
                          <h4
                            onClick={() => rest && setSelectedRestaurant(rest)}
                            className="fs-6 fw-bold text-dark font-heading mb-1 text-truncate cursor-pointer hover:text-[#FF5A1F] transition"
                          >
                            {food.name}
                          </h4>
                          <p className="text-muted text-xs line-clamp-2 mb-2" style={{ lineHeight: '1.4' }}>
                            {food.description}
                          </p>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2">
                          <span className="fs-5 fw-black text-dark font-heading">
                            ${food.price.toFixed(2)}
                          </span>

                          {!isAvailable ? (
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1 text-[11px] fw-bold">
                              Unavailable
                            </span>
                          ) : qty > 0 ? (
                            <div className="d-inline-flex align-items-center bg-orange-50 border border-[#FF5A1F] rounded-pill px-2 py-0.5 text-[#FF5A1F]">
                              <button
                                onClick={() => handleAddToCart(food.id, -1)}
                                className="btn btn-sm btn-link p-0 text-[#FF5A1F] fw-black text-decoration-none"
                              >
                                -
                              </button>
                              <span className="text-xs fw-black text-dark px-2">{qty}</span>
                              <button
                                onClick={() => handleAddToCart(food.id, 1)}
                                className="btn btn-sm btn-link p-0 text-[#FF5A1F] fw-black text-decoration-none"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(food.id, 1)}
                              className="btn btn-sm btn-primary rounded-pill px-3 py-1 text-xs fw-bold shadow-xs transition active:scale-95"
                            >
                              Add +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenJavaViewer={() => setIsJavaViewerOpen(true)} />

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={user => {
          setCurrentUser(user);
          if (user.role === 'ADMIN') setCurrentView('admin');
          else if (user.role === 'RESTAURANT_OWNER') setCurrentView('owner');
        }}
        initialMode={authMode}
        onShowToast={showToast}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onBrowseMenu={() => {
          setCurrentView('home');
          const el = document.getElementById('restaurants-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        defaultAddress={currentUser?.address || selectedLocation}
        onOrderSuccess={handleOrderSuccess}
        onShowToast={showToast}
      />

      <OrderConfirmationModal
        isOpen={isOrderConfirmationOpen}
        onClose={() => setIsOrderConfirmationOpen(false)}
        order={confirmedOrder}
        onTrackOrder={order => {
          setSelectedOrder(order);
          setIsOrderConfirmationOpen(false);
          setCurrentView('track');
        }}
        onViewOrderHistory={() => setCurrentView('orders')}
        onContinueShopping={() => setCurrentView('home')}
      />

      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={selectedOrder}
        currentUser={currentUser}
        onOrderUpdated={updated => setSelectedOrder(updated)}
        onShowToast={showToast}
        onViewOrderHistory={() => setCurrentView('orders')}
        onOpenFullTrackingPage={order => {
          setSelectedOrder(order);
          setIsTrackingOpen(false);
          setCurrentView('track');
        }}
      />

      <JavaCodeViewerModal
        isOpen={isJavaViewerOpen}
        onClose={() => setIsJavaViewerOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
