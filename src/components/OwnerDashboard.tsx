import React, { useState, useEffect } from 'react';
import {
  Store,
  UtensilsCrossed,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  MapPin,
  Phone,
  Edit,
  Save,
  ArrowRight,
  Flame,
  ChefHat
} from 'lucide-react';
import { Restaurant, FoodItem, Order, User, OrderStatus } from '../types';
import { api } from '../api';

interface OwnerDashboardProps {
  currentUser: User | null;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  onViewOrder: (order: Order) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  onShowToast,
  onViewOrder,
}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'profile'>('orders');

  // Edit restaurant profile state
  const [restName, setRestName] = useState('');
  const [restDesc, setRestDesc] = useState('');
  const [restAddress, setRestAddress] = useState('');
  const [restPhone, setRestPhone] = useState('');
  const [restDeliveryTime, setRestDeliveryTime] = useState('');

  // Add food modal
  const [showAddFood, setShowAddFood] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState('Pizzas');
  const [foodPrice, setFoodPrice] = useState('15.00');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodVeg, setFoodVeg] = useState(false);
  const [foodImage, setFoodImage] = useState('');

  useEffect(() => {
    loadOwnerData();
  }, [currentUser]);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      // Find restaurant owned by current user (defaults to #1 if owner 1, or #2 if owner 2)
      const restId = currentUser?.email.includes('spiceroute') ? 2 : 1;
      const [restData, menuData, ordersData, statsData] = await Promise.all([
        api.getRestaurant(restId),
        api.getRestaurantMenu(restId),
        api.getOrders(restId),
        api.getOwnerStats(restId),
      ]);

      setRestaurant(restData);
      setFoods(menuData);
      setOrders(ordersData);
      setStats(statsData);

      setRestName(restData.name);
      setRestDesc(restData.description);
      setRestAddress(restData.address);
      setRestPhone(restData.phone);
      setRestDeliveryTime(restData.deliveryTime);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to load restaurant dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => (o.id === orderId ? updated : o)));
      onShowToast(`Order #${orderId} updated to ${newStatus}`, 'success');
      const updatedStats = await api.getOwnerStats(restaurant?.id || 1);
      setStats(updatedStats);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      const updated = await api.updateFood(item.id, { isAvailable: !item.isAvailable });
      setFoods(foods.map(f => (f.id === item.id ? updated : f)));
      onShowToast(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update availability', 'error');
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (!confirm('Are you sure you want to remove this dish from your kitchen menu?')) return;
    try {
      await api.deleteFood(id);
      setFoods(foods.filter(f => f.id !== id));
      onShowToast('Food item removed from menu', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete food', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    try {
      const updated = await api.updateRestaurant(restaurant.id, {
        name: restName,
        description: restDesc,
        address: restAddress,
        phone: restPhone,
        deliveryTime: restDeliveryTime,
      });
      setRestaurant(updated);
      onShowToast('Kitchen profile successfully updated!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handleAddFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    try {
      const created = await api.createFood({
        restaurantId: restaurant.id,
        name: foodName,
        category: foodCategory,
        price: parseFloat(foodPrice) || 12.0,
        description: foodDesc,
        isVeg: foodVeg,
        isAvailable: true,
        imageUrl: foodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      });
      setFoods([...foods, created]);
      setShowAddFood(false);
      setFoodName('');
      setFoodDesc('');
      onShowToast('New dish added to kitchen menu!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to add item', 'error');
    }
  };

  return (
    <div className="container-xl py-4 py-md-5 animate-in fade-in">
      {/* Restaurant Partner Header Card */}
      <div className="card rounded-4 border p-4 shadow-xs mb-4 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={restaurant?.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'}
              alt={restaurant?.name}
              className="rounded-3 object-fit-cover shadow-xs"
              style={{ width: '70px', height: '70px' }}
            />
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill px-2.5 py-1 text-[11px] fw-bold">
                  KITCHEN PARTNER HUB
                </span>
                <span className="text-warning fw-bold text-xs">★ {restaurant?.rating}</span>
              </div>
              <h1 className="fs-4 fw-black text-dark font-heading mb-0">
                {restaurant?.name || 'Restaurant Dashboard'}
              </h1>
              <p className="text-muted text-xs mb-0">{restaurant?.cuisine} • {restaurant?.address}</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddFood(true)}
            className="btn btn-primary btn-sm rounded-pill px-3.5 py-2 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card rounded-4 border p-3 bg-white shadow-xs h-100 card-hover-lift">
            <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
              <span>Active Kitchen Orders</span>
              <ChefHat className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <p className="fs-3 fw-black text-[#FF5A1F] font-heading mb-0">
              {stats?.activeOrders ?? orders.filter(o => o.orderStatus !== 'DELIVERED').length}
            </p>
            <span className="text-[10px] text-muted">Awaiting fulfillment</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card rounded-4 border p-3 bg-white shadow-xs h-100 card-hover-lift">
            <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
              <span>Lifetime Orders</span>
              <ShoppingBag className="w-4 h-4 text-purple-500" />
            </div>
            <p className="fs-3 fw-black text-dark font-heading mb-0">
              {stats?.totalOrders ?? orders.length}
            </p>
            <span className="text-[10px] text-muted">Completed & transit</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card rounded-4 border p-3 bg-white shadow-xs h-100 card-hover-lift">
            <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
              <span>Menu Dishes</span>
              <UtensilsCrossed className="w-4 h-4 text-warning" />
            </div>
            <p className="fs-3 fw-black text-dark font-heading mb-0">
              {foods.length} items
            </p>
            <span className="text-[10px] text-success fw-bold">
              {foods.filter(f => f.isAvailable).length} in stock
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card rounded-4 border p-3 bg-emerald-50 border-emerald-200 shadow-xs h-100 card-hover-lift">
            <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
              <span>Kitchen Revenue</span>
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <p className="fs-3 fw-black text-success font-heading mb-0">
              ${stats?.totalRevenue ?? orders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-success fw-bold">Gross Dish Sales</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold transition text-nowrap ${
            activeTab === 'orders' ? 'btn-dark text-white' : 'btn-light'
          }`}
        >
          Incoming Kitchen Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold transition text-nowrap ${
            activeTab === 'menu' ? 'btn-dark text-white' : 'btn-light'
          }`}
        >
          Manage Menu Catalog ({foods.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold transition text-nowrap ${
            activeTab === 'profile' ? 'btn-dark text-white' : 'btn-light'
          }`}
        >
          Restaurant Settings
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="card rounded-4 border shadow-xs overflow-hidden bg-white">
          <div className="p-3 px-4 border-bottom d-flex align-items-center justify-content-between">
            <h3 className="fs-6 fw-black text-dark font-heading mb-0">Live Kitchen Order Pipeline</h3>
            <span className="text-muted text-[11px]">Advance statuses to reflect real-time progress</span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-xs">
              <thead className="table-light text-uppercase text-[10px] text-muted">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Customer</th>
                  <th>Ordered Dishes</th>
                  <th>Total</th>
                  <th>Current Status</th>
                  <th className="text-end pe-4">Kitchen Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="ps-4 fw-bold text-dark">#{o.id}</td>
                    <td>
                      <p className="fw-bold text-dark mb-0">{o.userName}</p>
                      <p className="text-muted text-[11px] text-truncate mb-0" style={{ maxWidth: '200px' }}>
                        {o.deliveryAddress}
                      </p>
                    </td>
                    <td className="text-secondary">
                      {o.items.map(it => `${it.quantity}x ${it.foodItemName}`).join(', ')}
                    </td>
                    <td className="fw-black text-dark font-heading">${o.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge rounded-pill text-[10px] fw-bold ${
                        o.orderStatus === 'DELIVERED'
                          ? 'bg-success text-white'
                          : o.orderStatus === 'CANCELLED'
                          ? 'bg-danger text-white'
                          : 'bg-orange-100 text-[#FF5A1F]'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="text-end pe-4 space-x-1">
                      {o.orderStatus === 'PLACED' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'CONFIRMED')}
                            className="btn btn-sm btn-success rounded-pill px-2.5 py-1 text-xs fw-bold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                            className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 text-xs fw-bold"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {o.orderStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'PREPARING')}
                          className="btn btn-sm btn-warning text-dark rounded-pill px-2.5 py-1 text-xs fw-bold"
                        >
                          Start Cooking
                        </button>
                      )}

                      {o.orderStatus === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'OUT_FOR_DELIVERY')}
                          className="btn btn-sm btn-primary rounded-pill px-2.5 py-1 text-xs fw-bold"
                        >
                          Hand Over to Courier
                        </button>
                      )}

                      {o.orderStatus === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'DELIVERED')}
                          className="btn btn-sm btn-success rounded-pill px-2.5 py-1 text-xs fw-bold"
                        >
                          Mark Delivered
                        </button>
                      )}

                      <button
                        onClick={() => onViewOrder(o)}
                        className="btn btn-sm btn-outline-dark rounded-pill px-2 py-1 text-xs"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Menu Management */}
      {activeTab === 'menu' && (
        <div>
          <div className="row g-3">
            {foods.map(f => (
              <div key={f.id} className="col-12 col-md-6 col-lg-4">
                <div className="card rounded-4 border p-3 shadow-xs h-100 card-hover-lift bg-white">
                  <div className="d-flex gap-3">
                    <img src={f.imageUrl} alt={f.name} className="rounded-3 object-fit-cover shadow-2xs" style={{ width: '80px', height: '80px' }} />
                    <div className="flex-grow-1 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className={`badge rounded-pill text-[10px] ${f.isVeg ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                            {f.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                          <span className="fw-black text-dark font-heading">${f.price.toFixed(2)}</span>
                        </div>
                        <h4 className="fs-6 fw-bold text-dark font-heading mb-0 mt-1">{f.name}</h4>
                        <p className="text-muted text-[11px] line-clamp-1 mb-0">{f.description}</p>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2">
                        <button
                          onClick={() => handleToggleAvailability(f)}
                          className={`btn btn-sm rounded-pill text-xs fw-bold px-2.5 py-0.5 ${
                            f.isAvailable ? 'btn-success text-white' : 'btn-secondary text-white'
                          }`}
                        >
                          {f.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </button>

                        <button
                          onClick={() => handleDeleteFood(f.id)}
                          className="btn btn-sm btn-outline-danger rounded-circle p-1"
                          title="Delete dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="card rounded-4 border p-4 shadow-xs bg-white" style={{ maxWidth: '640px' }}>
          <h3 className="fs-5 fw-black text-dark font-heading mb-3">Kitchen Profile & Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="fw-bold mb-1">Kitchen Name</label>
              <input
                type="text"
                value={restName}
                onChange={e => setRestName(e.target.value)}
                className="form-control form-control-sm text-xs rounded-2"
              />
            </div>
            <div>
              <label className="fw-bold mb-1">Tagline & Specialties</label>
              <textarea
                rows={3}
                value={restDesc}
                onChange={e => setRestDesc(e.target.value)}
                className="form-control text-xs rounded-2"
              />
            </div>
            <div>
              <label className="fw-bold mb-1">Street Address</label>
              <input
                type="text"
                value={restAddress}
                onChange={e => setRestAddress(e.target.value)}
                className="form-control form-control-sm text-xs rounded-2"
              />
            </div>
            <div className="row g-2">
              <div className="col-6">
                <label className="fw-bold mb-1">Phone</label>
                <input
                  type="text"
                  value={restPhone}
                  onChange={e => setRestPhone(e.target.value)}
                  className="form-control form-control-sm text-xs rounded-2"
                />
              </div>
              <div className="col-6">
                <label className="fw-bold mb-1">Avg Delivery Time</label>
                <input
                  type="text"
                  value={restDeliveryTime}
                  onChange={e => setRestDeliveryTime(e.target.value)}
                  className="form-control form-control-sm text-xs rounded-2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4 py-2 text-xs fw-bold mt-2"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add Food Item */}
      {showAddFood && (
        <div className="position-fixed inset-0 z-50 d-flex align-items-center justify-content-center p-3 bg-dark opacity-60 backdrop-blur-xs">
          <div className="bg-white rounded-4 p-4 shadow-2xl border w-100 animate-in zoom-in-95" style={{ maxWidth: '480px', opacity: 1, zIndex: 1060 }}>
            <h3 className="fs-5 fw-black text-dark font-heading mb-3">Add Dish to Kitchen Menu</h3>
            <form onSubmit={handleAddFoodItem} className="space-y-2.5 text-xs">
              <div>
                <label className="fw-bold mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  className="form-control form-control-sm text-xs rounded-2"
                  placeholder="e.g. Special Truffle Penne"
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="fw-bold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={foodCategory}
                    onChange={e => setFoodCategory(e.target.value)}
                    className="form-control form-control-sm text-xs rounded-2"
                  />
                </div>
                <div className="col-6">
                  <label className="fw-bold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={foodPrice}
                    onChange={e => setFoodPrice(e.target.value)}
                    className="form-control form-control-sm text-xs rounded-2"
                  />
                </div>
              </div>
              <div>
                <label className="fw-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodDesc}
                  onChange={e => setFoodDesc(e.target.value)}
                  className="form-control text-xs rounded-2"
                />
              </div>
              <div className="form-check pt-1">
                <input
                  type="checkbox"
                  id="ownerVegDish"
                  checked={foodVeg}
                  onChange={e => setFoodVeg(e.target.checked)}
                  className="form-check-input"
                />
                <label htmlFor="ownerVegDish" className="form-check-label fw-bold text-dark">
                  Vegetarian Dish
                </label>
              </div>
              <div className="d-flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFood(false)}
                  className="btn btn-sm btn-light rounded-pill flex-grow-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-pill flex-grow-1"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
