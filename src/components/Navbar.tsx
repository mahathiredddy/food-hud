import React, { useState } from 'react';
import {
  UtensilsCrossed,
  MapPin,
  Search,
  ShoppingBag,
  User as UserIcon,
  Code2,
  Shield,
  Store,
  LogOut,
  ChevronDown,
  Sparkles,
  Copy,
  Check,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  cartTotal?: number;
  onOpenCart: () => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenJavaViewer: () => void;
  onOpenOrders: () => void;
  onOpenProfile: () => void;
  onNavigateHome: () => void;
  currentView: string;
  onSwitchView: (view: 'home' | 'admin' | 'owner' | 'orders' | 'profile' | 'track') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  onQuickLogin: (email: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  cartCount,
  cartTotal = 0,
  onOpenCart,
  onOpenAuth,
  onLogout,
  onOpenJavaViewer,
  onOpenOrders,
  onOpenProfile,
  onNavigateHome,
  currentView,
  onSwitchView,
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  onQuickLogin,
  onShowToast,
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const locations = [
    '742 Evergreen Terrace, Springfield, OR',
    '42 Via Bella, Little Italy, New York, NY',
    '221B Baker Street, Boston, MA',
    '88 Curry Mile, Jersey City, NJ',
    '100 FoodHub Way, Silicon Valley, CA'
  ];

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('FOODHUB50');
    setCopiedCoupon(true);
    onShowToast?.('Coupon FOODHUB50 copied to clipboard! Enjoy $5 OFF on orders > $40', 'success');
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-bottom shadow-sm">
      {/* Top Banner with Quick Role Testing Switcher & Coupon */}
      <div className="bg-[#212529] text-white py-1 px-3 border-bottom border-dark">
        <div className="container-xl d-flex flex-wrap align-items-center justify-content-between gap-2">
          {/* Promo Tag */}
          <div className="d-flex align-items-center gap-2 text-xs">
            <span className="badge bg-success rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2 font-bold">
              <span className="spinner-grow spinner-grow-sm text-light" style={{ width: '0.45rem', height: '0.45rem' }} role="status"></span>
              Live Backend
            </span>
            <span className="text-light opacity-90 d-none d-md-inline">
              Spring Boot REST API & MySQL Connected
            </span>
            <span className="text-secondary d-none d-md-inline">|</span>
            <button
              onClick={handleCopyCoupon}
              className="btn btn-sm btn-outline-warning text-warning py-0 px-2 d-inline-flex align-items-center gap-1 border-warning rounded-pill text-[11px] font-bold"
              title="Click to copy coupon"
            >
              <Sparkles className="w-3 h-3 text-warning" />
              <span>Use FOODHUB50 for $5 OFF</span>
              {copiedCoupon ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 opacity-75" />}
            </button>
          </div>

          {/* Quick Test Demo Roles Switcher */}
          <div className="d-flex align-items-center gap-1 ms-auto text-xs">
            <span className="text-secondary text-[11px] d-none d-lg-inline me-1">Demo Quick Roles:</span>
            <button
              onClick={() => onQuickLogin('john.doe@example.com')}
              className={`btn btn-sm py-0 px-2 rounded-pill text-[11px] font-bold transition ${
                currentUser?.role === 'CUSTOMER' && currentUser?.email === 'john.doe@example.com'
                  ? 'btn-primary'
                  : 'btn-outline-light border-secondary text-light'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => onQuickLogin('owner.goldenspoon@foodhub.com')}
              className={`btn btn-sm py-0 px-2 rounded-pill text-[11px] font-bold transition ${
                currentUser?.role === 'RESTAURANT_OWNER'
                  ? 'btn-primary'
                  : 'btn-outline-light border-secondary text-light'
              }`}
            >
              Owner
            </button>
            <button
              onClick={() => onQuickLogin('admin@foodhub.com')}
              className={`btn btn-sm py-0 px-2 rounded-pill text-[11px] font-bold transition ${
                currentUser?.role === 'ADMIN'
                  ? 'btn-primary'
                  : 'btn-outline-light border-secondary text-light'
              }`}
            >
              Admin
            </button>

            <button
              onClick={onOpenJavaViewer}
              className="btn btn-sm bg-warning text-dark py-0 px-2 rounded-pill text-[11px] font-bold ms-2 d-inline-flex align-items-center gap-1 shadow-sm"
              title="Inspect complete Spring Boot Java Maven code & MySQL Schema"
            >
              <Code2 className="w-3 h-3 text-dark" />
              <span className="d-none d-sm-inline">Spring Boot</span> Source
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container-xl py-2 py-md-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          {/* Logo & Location Dropdown */}
          <div className="d-flex align-items-center gap-3 gap-lg-4">
            <button
              onClick={onNavigateHome}
              className="d-flex align-items-center gap-2 text-decoration-none border-0 bg-transparent p-0 text-start group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF8A00] text-white d-flex align-items-center justify-content-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="fs-3 fw-black tracking-tight text-dark font-heading lh-1">
                  Food<span className="text-[#FF5A1F]">Hub</span>
                </span>
                <span className="d-block text-[10px] tracking-widest text-uppercase fw-bold text-muted lh-1 mt-0.5">
                  Fast & Fresh
                </span>
              </div>
            </button>

            {/* Address / Location Selector */}
            <div className="position-relative d-none d-md-block">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="btn btn-light bg-gray-100 hover:bg-gray-200 border-0 rounded-pill px-3 py-1.5 text-xs fw-semibold text-secondary d-flex align-items-center gap-2 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span className="text-truncate" style={{ maxWidth: '170px' }}>
                  {selectedLocation.split(',')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-muted" />
              </button>

              {showLocationDropdown && (
                <div
                  className="position-absolute start-0 mt-2 bg-white rounded-3 shadow-lg border p-2 z-50 animate-in fade-in"
                  style={{ width: '280px' }}
                >
                  <div className="px-2 py-1 text-[11px] fw-bold text-muted text-uppercase tracking-wider">
                    Select Delivery Address
                  </div>
                  <div className="dropdown-divider my-1"></div>
                  {locations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowLocationDropdown(false);
                        onShowToast?.(`Delivery address updated to: ${loc}`, 'info');
                      }}
                      className={`w-100 text-start btn btn-sm rounded-2 text-xs py-2 px-2 d-flex align-items-center gap-2 mb-1 border-0 ${
                        selectedLocation === loc
                          ? 'bg-orange-50 text-[#FF5A1F] fw-bold'
                          : 'text-dark hover:bg-light'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#FF5A1F] flex-shrink-0" />
                      <span className="text-truncate">{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search bar in center */}
          <div className="flex-grow-1 mx-2 mx-lg-4 d-none d-md-block" style={{ maxWidth: '440px' }}>
            <div className="position-relative">
              <input
                type="text"
                placeholder="Search restaurants, cuisines, pizzas, biryani..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-control form-control-sm rounded-pill ps-5 pe-4 py-2 border-0 bg-light text-dark text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5A1F]/20"
              />
              <Search className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-sm text-muted position-absolute end-0 top-50 translate-middle-y me-1 p-0 px-2 border-0 bg-transparent text-xs hover:text-dark"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Nav Actions Right */}
          <div className="d-flex align-items-center gap-2">
            {/* Nav Links for Home & Orders */}
            <button
              onClick={onNavigateHome}
              className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold transition border-0 ${
                currentView === 'home'
                  ? 'bg-orange-50 text-[#FF5A1F]'
                  : 'text-secondary hover:text-dark hover:bg-light'
              }`}
            >
              Explore
            </button>

            {currentUser && (
              <button
                onClick={onOpenOrders}
                className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold transition border-0 d-none d-sm-inline-block ${
                  currentView === 'orders'
                    ? 'bg-orange-50 text-[#FF5A1F]'
                    : 'text-secondary hover:text-dark hover:bg-light'
                }`}
              >
                My Orders
              </button>
            )}

            <button
              onClick={() => onSwitchView('track')}
              className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold transition border-0 d-none d-sm-inline-block ${
                currentView === 'track'
                  ? 'bg-orange-50 text-[#FF5A1F]'
                  : 'text-secondary hover:text-dark hover:bg-light'
              }`}
            >
              Track Order
            </button>

            {/* Role specific portals */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => onSwitchView(currentView === 'admin' ? 'home' : 'admin')}
                className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 transition ${
                  currentView === 'admin'
                    ? 'btn-dark text-white'
                    : 'btn-outline-dark'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-warning" />
                <span>Admin</span>
              </button>
            )}

            {currentUser?.role === 'RESTAURANT_OWNER' && (
              <button
                onClick={() => onSwitchView(currentView === 'owner' ? 'home' : 'owner')}
                className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 transition ${
                  currentView === 'owner'
                    ? 'btn-dark text-white'
                    : 'btn-outline-dark'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Kitchen</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="btn btn-light bg-orange-50 hover:bg-orange-100 text-[#FF5A1F] border-0 rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 position-relative shadow-xs transition group cursor-pointer"
              aria-label="Open Shopping Cart"
            >
              <div className="position-relative">
                <ShoppingBag className="w-4 h-4 text-[#FF5A1F] group-hover:scale-110 transition" />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-[#FF5A1F] text-white text-[10px] fw-bold shadow-sm animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              {cartTotal > 0 && (
                <span className="text-xs fw-black text-[#FF5A1F] d-none d-sm-inline">
                  ${cartTotal.toFixed(2)}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            {currentUser ? (
              <div className="position-relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="btn btn-outline-light text-dark bg-white border rounded-pill p-1 pe-2 pe-md-3 d-flex align-items-center gap-2 shadow-xs transition"
                >
                  <div className="w-7 h-7 rounded-circle bg-gradient-to-tr from-[#FF5A1F] to-[#FFC107] text-white d-flex align-items-center justify-center fw-bold text-xs shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-start d-none d-md-block" style={{ lineHeight: '1.1' }}>
                    <span className="d-block text-xs fw-bold text-dark text-truncate" style={{ maxWidth: '90px' }}>
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-muted text-uppercase fw-semibold">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted d-none d-md-block" />
                </button>

                {showUserDropdown && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-xl border p-2 z-50 animate-in fade-in"
                    style={{ width: '230px' }}
                  >
                    <div className="px-3 py-2 border-bottom">
                      <p className="text-xs fw-bold text-dark mb-0">{currentUser.name}</p>
                      <p className="text-[11px] text-muted text-truncate mb-1">{currentUser.email}</p>
                      <span className="badge bg-orange-100 text-[#FF5A1F] text-[10px] fw-bold rounded-pill">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile();
                      }}
                      className="w-100 text-start btn btn-sm btn-light bg-transparent rounded-2 text-xs py-2 px-3 d-flex align-items-center gap-2 border-0 text-dark hover:bg-light"
                    >
                      <UserIcon className="w-4 h-4 text-muted" />
                      <span>My Profile & Address</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenOrders();
                      }}
                      className="w-100 text-start btn btn-sm btn-light bg-transparent rounded-2 text-xs py-2 px-3 d-flex align-items-center gap-2 border-0 text-dark hover:bg-light"
                    >
                      <ShoppingBag className="w-4 h-4 text-muted" />
                      <span>Order History & Timeline</span>
                    </button>

                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onSwitchView('admin');
                        }}
                        className="w-100 text-start btn btn-sm btn-light bg-transparent rounded-2 text-xs py-2 px-3 d-flex align-items-center gap-2 border-0 text-dark hover:bg-light fw-bold"
                      >
                        <Shield className="w-4 h-4 text-warning" />
                        <span>Admin Management Portal</span>
                      </button>
                    )}

                    {currentUser.role === 'RESTAURANT_OWNER' && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onSwitchView('owner');
                        }}
                        className="w-100 text-start btn btn-sm btn-light bg-transparent rounded-2 text-xs py-2 px-3 d-flex align-items-center gap-2 border-0 text-dark hover:bg-light fw-bold"
                      >
                        <Store className="w-4 h-4 text-[#FF5A1F]" />
                        <span>Kitchen Partner Portal</span>
                      </button>
                    )}

                    <div className="dropdown-divider my-1"></div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-100 text-start btn btn-sm btn-light bg-transparent rounded-2 text-xs py-2 px-3 d-flex align-items-center gap-2 border-0 text-danger hover:bg-danger-subtle fw-bold"
                    >
                      <LogOut className="w-4 h-4 text-danger" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="btn btn-sm btn-light rounded-pill px-3 py-1.5 text-xs fw-bold text-dark border"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 text-xs fw-bold shadow-sm"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-sm btn-light d-md-none rounded-circle p-2 text-secondary"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pt-2 d-md-none">
          <div className="position-relative">
            <input
              type="text"
              placeholder="Search dishes, burgers, pizzas, ramen..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-control form-control-sm rounded-pill ps-5 py-2 text-xs border-0 bg-light"
            />
            <Search className="w-3.5 h-3.5 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
          </div>
        </div>

        {/* Mobile Collapsible Navigation Menu */}
        {mobileMenuOpen && (
          <div className="d-md-none bg-white border-top mt-2 pt-2 pb-3 px-1 animate-in fade-in">
            <div className="d-flex flex-column gap-1">
              <button
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className={`btn btn-sm text-start py-2 px-3 rounded-3 text-xs fw-bold ${
                  currentView === 'home' ? 'bg-orange-50 text-[#FF5A1F]' : 'btn-light'
                }`}
              >
                Explore Restaurants
              </button>
              {currentUser && (
                <button
                  onClick={() => {
                    onOpenOrders();
                    setMobileMenuOpen(false);
                  }}
                  className={`btn btn-sm text-start py-2 px-3 rounded-3 text-xs fw-bold ${
                    currentView === 'orders' ? 'bg-orange-50 text-[#FF5A1F]' : 'btn-light'
                  }`}
                >
                  My Orders
                </button>
              )}
              <button
                onClick={() => {
                  onSwitchView('track');
                  setMobileMenuOpen(false);
                }}
                className={`btn btn-sm text-start py-2 px-3 rounded-3 text-xs fw-bold ${
                  currentView === 'track' ? 'bg-orange-50 text-[#FF5A1F]' : 'btn-light'
                }`}
              >
                Track Order
              </button>
              {currentUser?.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    onSwitchView('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-sm btn-light text-start py-2 px-3 rounded-3 text-xs fw-bold d-flex align-items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-warning" />
                  <span>Admin Portal</span>
                </button>
              )}
              {currentUser?.role === 'RESTAURANT_OWNER' && (
                <button
                  onClick={() => {
                    onSwitchView('owner');
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-sm btn-light text-start py-2 px-3 rounded-3 text-xs fw-bold d-flex align-items-center gap-2"
                >
                  <Store className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Restaurant Owner Portal</span>
                </button>
              )}
              <div className="p-2 border-top mt-1">
                <span className="text-[11px] text-muted d-block mb-1">Delivering to:</span>
                <span className="text-xs fw-semibold text-dark">{selectedLocation}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
