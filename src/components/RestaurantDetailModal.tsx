import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  MapPin,
  Phone,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  Filter,
  CheckCircle2,
  Share2,
  Info
} from 'lucide-react';
import { Restaurant, FoodItem, Cart } from '../types';
import { api } from '../api';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onAddToCart: (foodItemId: number, quantity: number) => void;
  onOpenCart: () => void;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onOpenCart,
}) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [onlyVeg, setOnlyVeg] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (restaurant && isOpen) {
      loadMenu(restaurant.id);
      setMenuSearch('');
      setSelectedCategory('All');
      setOnlyVeg(false);
    }
  }, [restaurant, isOpen]);

  const loadMenu = async (restaurantId: number) => {
    setLoading(true);
    try {
      const items = await api.getRestaurantMenu(restaurantId);
      setFoods(items);
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !restaurant) return null;

  const categories = ['All', ...Array.from(new Set(foods.map(f => f.category)))];

  const filteredFoods = foods.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (onlyVeg && !item.isVeg) return false;
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const getCartQuantityForFood = (foodId: number) => {
    const item = cart?.items.find(ci => ci.foodItemId === foodId);
    return item ? item.quantity : 0;
  };

  const totalRestaurantItemsInCart = cart?.items.filter(i =>
    foods.some(f => f.id === i.foodItemId)
  ).reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <div className="position-fixed inset-0 z-50 overflow-hidden d-flex align-items-center justify-content-center p-2 p-md-4" style={{ zIndex: 1055 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="position-fixed inset-0 bg-dark opacity-60 backdrop-blur-xs animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div
        className="position-relative w-100 bg-white rounded-4 shadow-2xl overflow-hidden d-flex flex-column animate-in zoom-in-95"
        style={{ maxWidth: '960px', maxHeight: '92vh', zIndex: 1 }}
      >
        {/* Banner with Restaurant Details */}
        <div className="position-relative w-100 flex-shrink-0" style={{ height: '260px' }}>
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-100 h-100 object-fit-cover"
          />
          <div
            className="position-absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 p-2 bg-white/80 hover:bg-white text-dark shadow-sm z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Restaurant Header Information */}
          <div className="position-absolute bottom-0 start-0 end-0 p-4 text-white">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="badge bg-[#FF5A1F] text-white px-2.5 py-1 text-xs fw-bold rounded-pill text-uppercase">
                {restaurant.cuisine}
              </span>
              <span className="badge bg-warning text-dark px-2.5 py-1 text-xs fw-black rounded-pill d-inline-flex align-items-center gap-1 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current text-dark" />
                <span>{restaurant.rating} Rating</span>
              </span>
              <span className="badge bg-dark bg-opacity-75 text-light px-2.5 py-1 text-xs fw-bold rounded-pill d-inline-flex align-items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-warning" />
                <span>{restaurant.deliveryTime}</span>
              </span>
            </div>

            <h1 className="fs-3 fs-md-2 fw-black text-white font-heading mb-1 text-shadow">
              {restaurant.name}
            </h1>
            <p className="text-light opacity-90 text-xs text-md-sm mb-2 text-truncate" style={{ maxWidth: '650px' }}>
              {restaurant.description}
            </p>

            <div className="d-flex flex-wrap align-items-center gap-3 text-xs text-light opacity-80">
              <div className="d-flex align-items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>{restaurant.address}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-success" />
                <span>{restaurant.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 px-4 border-bottom bg-light d-flex flex-wrap align-items-center justify-content-between gap-2 flex-shrink-0">
          {/* Menu Search Box */}
          <div className="d-flex align-items-center bg-white border rounded-pill px-3 py-1 shadow-2xs" style={{ width: '220px' }}>
            <span className="text-muted me-1.5 text-xs">🔍</span>
            <input
              type="text"
              value={menuSearch}
              onChange={e => setMenuSearch(e.target.value)}
              placeholder="Search dishes..."
              className="border-0 bg-transparent text-xs text-dark w-100 p-0 focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="d-flex align-items-center gap-1.5 overflow-x-auto pb-1" style={{ maxWidth: '440px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm rounded-pill text-xs fw-bold text-nowrap px-3 py-1 transition ${
                  selectedCategory === cat
                    ? 'btn-primary'
                    : 'btn-outline-secondary bg-white text-dark border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Veg Only Toggle Switch */}
          <div className="form-check form-switch d-flex align-items-center gap-2 m-0 ps-0">
            <label className="form-check-label text-xs fw-bold text-dark cursor-pointer" htmlFor="vegOnlySwitch">
              Pure Veg Only
            </label>
            <input
              className="form-check-input m-0 cursor-pointer"
              type="checkbox"
              role="switch"
              id="vegOnlySwitch"
              checked={onlyVeg}
              onChange={e => setOnlyVeg(e.target.checked)}
              style={{ width: '2.5rem', height: '1.25rem' }}
            />
          </div>
        </div>

        {/* Dishes Menu Content */}
        <div className="flex-grow-1 overflow-y-auto p-3 p-md-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-[#FF5A1F]" role="status">
                <span className="visually-hidden">Loading menu...</span>
              </div>
              <p className="text-xs text-muted mt-2 fw-bold">Loading delicious menu items...</p>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="text-center py-5">
              <div className="w-16 h-16 rounded-circle bg-orange-50 text-[#FF5A1F] d-flex align-items-center justify-center mx-auto mb-3">
                <Filter className="w-8 h-8" />
              </div>
              <h4 className="fs-6 fw-bold text-dark">No dishes match your filter</h4>
              <p className="text-xs text-muted">Try clearing the search or turning off the Veg Only switch.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setOnlyVeg(false);
                  setMenuSearch('');
                }}
                className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 text-xs"
              >
                Reset Menu Filters
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {filteredFoods.map(food => {
                const inCartQty = getCartQuantityForFood(food.id);
                const isAvailable = food.isAvailable !== false;

                return (
                  <div key={food.id} className="col-12 col-md-6">
                    <div className={`card h-100 rounded-4 border p-3 shadow-xs hover:border-orange-300 card-hover-lift bg-white ${!isAvailable ? 'opacity-75' : ''}`}>
                      <div className="d-flex gap-3 align-items-start">
                        {/* Food Description */}
                        <div className="flex-grow-1 min-w-0">
                          {/* Veg/Non-Veg & Availability indicator */}
                          <div className="d-flex align-items-center gap-1.5 mb-1 flex-wrap">
                            <span
                              className={`border d-inline-flex align-items-center justify-content-center p-0.5 rounded-1 ${
                                food.isVeg ? 'border-success text-success' : 'border-danger text-danger'
                              }`}
                              style={{ width: '14px', height: '14px' }}
                              title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                            >
                              <span
                                className={`rounded-circle ${food.isVeg ? 'bg-success' : 'bg-danger'}`}
                                style={{ width: '6px', height: '6px' }}
                              />
                            </span>
                            <span className="badge bg-light text-secondary text-[10px] fw-bold text-uppercase">
                              {food.category}
                            </span>
                            {!isAvailable && (
                              <span className="badge bg-danger-subtle text-danger border border-danger-subtle text-[10px] fw-bold rounded-pill">
                                Sold Out
                              </span>
                            )}
                          </div>

                          <h3 className="fs-6 fw-bold text-dark mb-1 font-heading text-truncate">
                            {food.name}
                          </h3>
                          <p className="text-xs text-muted mb-2 line-clamp-2" style={{ lineHeight: '1.4' }}>
                            {food.description}
                          </p>

                          <div className="d-flex align-items-center justify-content-between mt-auto">
                            <span className="fs-5 fw-black text-dark font-heading">
                              ${food.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Food Image with Floating ADD/Quantity Stepper */}
                        <div className="position-relative flex-shrink-0 text-center" style={{ width: '100px' }}>
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            className={`rounded-3 object-fit-cover shadow-xs ${!isAvailable ? 'grayscale' : ''}`}
                            style={{ width: '96px', height: '96px' }}
                          />

                          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-n2" style={{ width: '84px' }}>
                            {!isAvailable ? (
                              <button
                                disabled
                                className="btn btn-sm btn-secondary disabled rounded-pill px-2 py-0.5 text-[10px] fw-bold w-100 opacity-75 shadow-xs"
                              >
                                Unavailable
                              </button>
                            ) : inCartQty > 0 ? (
                              <div className="bg-white border border-[#FF5A1F] rounded-pill shadow-sm d-flex align-items-center justify-content-between px-1.5 py-0.5">
                                <button
                                  onClick={() => onAddToCart(food.id, -1)}
                                  className="btn btn-sm btn-link p-0 text-[#FF5A1F] fw-black text-decoration-none"
                                >
                                  -
                                </button>
                                <span className="text-xs fw-black text-dark px-1">
                                  {inCartQty}
                                </span>
                                <button
                                  onClick={() => onAddToCart(food.id, 1)}
                                  className="btn btn-sm btn-link p-0 text-[#FF5A1F] fw-black text-decoration-none"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onAddToCart(food.id, 1)}
                                className="btn btn-sm btn-light bg-white text-[#FF5A1F] border border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-white rounded-pill px-3 py-1 text-xs fw-black shadow-sm transition w-100"
                              >
                                ADD +
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Cart Checkout Bar at bottom if user has items */}
        {cart && cart.items.length > 0 && (
          <div className="p-3 px-4 bg-[#212529] text-white d-flex align-items-center justify-content-between gap-3 flex-shrink-0">
            <div className="d-flex align-items-center gap-3">
              <div className="w-8 h-8 rounded-pill bg-[#FF5A1F] d-flex align-items-center justify-center fw-bold text-xs">
                {cart.items.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <div>
                <p className="text-xs fw-bold mb-0">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
                </p>
                <p className="text-[11px] text-light opacity-75 mb-0">
                  Subtotal: <span className="text-warning fw-bold">${cart.subtotal.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="btn btn-primary btn-sm rounded-pill px-3.5 py-2 text-xs fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>View Cart & Checkout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
