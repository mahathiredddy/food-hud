import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  FileBarChart2,
  LogOut,
  DollarSign,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  Filter,
  Download,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Check
} from 'lucide-react';
import { Restaurant, FoodItem, Order, User, OrderStatus, Payment } from '../types';
import { api } from '../api';

interface AdminDashboardProps {
  currentUser?: User | null;
  onLogout?: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onViewOrder: (order: Order) => void;
}

type AdminSidebarTab =
  | 'dashboard'
  | 'customers'
  | 'restaurants'
  | 'foods'
  | 'orders'
  | 'payments'
  | 'reports';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onShowToast,
  onViewOrder,
}) => {
  const [activeTab, setActiveTab] = useState<AdminSidebarTab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState<string>('ALL');

  const [userSearch, setUserSearch] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState('ALL');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');

  // Modals for Adding Restaurant & Food
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [restForm, setRestForm] = useState({
    name: '',
    cuisine: '',
    address: '',
    phone: '',
    description: '',
    imageUrl: '',
    deliveryTime: '25-35 min',
  });

  const [showAddFood, setShowAddFood] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodForm, setFoodForm] = useState({
    restaurantId: 1,
    name: '',
    category: 'Pizzas',
    price: '14.99',
    description: '',
    isVeg: false,
    imageUrl: '',
    isAvailable: true,
  });

  // Customer Detail Drawer / Modal
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, restsData, foodsData, usersData, paymentsData] = await Promise.all([
        api.getAdminStats(),
        api.getOrders(),
        api.getRestaurants(),
        api.getFoods(),
        api.getUsers(),
        api.getPayments().catch(() => []),
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setRestaurants(restsData);
      setFoods(foodsData);
      setUsers(usersData);
      setPayments(paymentsData);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to load administrative dataset', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Status transitions check based on standard restaurant pipeline
  const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PLACED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders(orders.map(o => (o.id === orderId ? updated : o)));
      onShowToast(`Order #${orderId} moved to ${status}`, 'success');
      const [newStats, newPayments] = await Promise.all([
        api.getAdminStats(),
        api.getPayments().catch(() => payments),
      ]);
      setStats(newStats);
      setPayments(newPayments);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Customers: Toggle Activation
  const handleToggleCustomerStatus = async (user: User) => {
    const newStatus = user.isActive === false ? true : false;
    try {
      const updated = await api.updateUserStatus(user.id, newStatus);
      setUsers(users.map(u => (u.id === user.id ? { ...u, isActive: newStatus } : u)));
      onShowToast(
        `Customer ${user.name} is now ${newStatus ? 'Activated' : 'Deactivated'}`,
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'Failed to toggle customer status', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this customer account?')) return;
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      onShowToast('Customer removed successfully', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Restaurants: Add / Edit / Toggle / Delete
  const handleToggleRestaurantStatus = async (rest: Restaurant) => {
    try {
      const updated = await api.updateRestaurant(rest.id, { isActive: !rest.isActive });
      setRestaurants(restaurants.map(r => (r.id === rest.id ? updated : r)));
      onShowToast(`${rest.name} is now ${!rest.isActive ? 'Active' : 'Inactive'}`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update restaurant status', 'error');
    }
  };

  const handleDeleteRestaurant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this restaurant and its associations?')) return;
    try {
      await api.deleteRestaurant(id);
      setRestaurants(restaurants.filter(r => r.id !== id));
      onShowToast('Restaurant deleted successfully', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete restaurant', 'error');
    }
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRestaurant) {
        const updated = await api.updateRestaurant(editingRestaurant.id, {
          name: restForm.name,
          cuisine: restForm.cuisine,
          address: restForm.address,
          phone: restForm.phone,
          description: restForm.description,
          imageUrl: restForm.imageUrl || editingRestaurant.imageUrl,
          deliveryTime: restForm.deliveryTime,
        });
        setRestaurants(restaurants.map(r => (r.id === editingRestaurant.id ? updated : r)));
        onShowToast('Restaurant updated successfully', 'success');
      } else {
        const created = await api.createRestaurant({
          name: restForm.name,
          cuisine: restForm.cuisine,
          address: restForm.address,
          phone: restForm.phone,
          description: restForm.description,
          imageUrl: restForm.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          deliveryTime: restForm.deliveryTime || '25-35 min',
          rating: 4.8,
          isActive: true,
        });
        setRestaurants([...restaurants, created]);
        onShowToast('New restaurant partner added!', 'success');
      }
      setShowAddRestaurant(false);
      setEditingRestaurant(null);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save restaurant', 'error');
    }
  };

  // Food Items: Add / Edit / Toggle Availability / Delete
  const handleToggleFoodAvailability = async (item: FoodItem) => {
    try {
      const updated = await api.updateFood(item.id, { isAvailable: !item.isAvailable });
      setFoods(foods.map(f => (f.id === item.id ? updated : f)));
      onShowToast(`Item availability set to: ${!item.isAvailable ? 'In Stock' : 'Out of Stock'}`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update item availability', 'error');
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.deleteFood(id);
      setFoods(foods.filter(f => f.id !== id));
      onShowToast('Food item deleted successfully', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete food item', 'error');
    }
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceVal = parseFloat(foodForm.price) || 12.0;
      if (editingFood) {
        const updated = await api.updateFood(editingFood.id, {
          restaurantId: foodForm.restaurantId,
          name: foodForm.name,
          category: foodForm.category,
          price: priceVal,
          description: foodForm.description,
          isVeg: foodForm.isVeg,
          isAvailable: foodForm.isAvailable,
          imageUrl: foodForm.imageUrl || editingFood.imageUrl,
        });
        setFoods(foods.map(f => (f.id === editingFood.id ? updated : f)));
        onShowToast('Dish updated successfully', 'success');
      } else {
        const created = await api.createFood({
          restaurantId: foodForm.restaurantId,
          name: foodForm.name,
          category: foodForm.category,
          price: priceVal,
          description: foodForm.description,
          isVeg: foodForm.isVeg,
          isAvailable: true,
          imageUrl: foodForm.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        });
        setFoods([...foods, created]);
        onShowToast('New dish added to catalog!', 'success');
      }
      setShowAddFood(false);
      setEditingFood(null);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save food item', 'error');
    }
  };

  // Helper filters
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      orderSearch === '' ||
      String(o.id).includes(orderSearch) ||
      (o.userName && o.userName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.restaurantName && o.restaurantName.toLowerCase().includes(orderSearch.toLowerCase()));

    const matchesStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
    const matchesDate =
      orderDateFilter === 'ALL' ||
      (orderDateFilter === 'TODAY' && o.createdAt.startsWith(new Date().toISOString().slice(0, 10))) ||
      (orderDateFilter === 'APRIL' && o.createdAt.includes('2026-04')) ||
      (orderDateFilter === 'MARCH' && o.createdAt.includes('2026-03'));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredCustomers = users
    .filter(u => u.role === 'CUSTOMER')
    .filter(
      u =>
        userSearch === '' ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone.toLowerCase().includes(userSearch.toLowerCase())
    );

  const filteredRestaurants = restaurants.filter(
    r =>
      restaurantSearch === '' ||
      r.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
      r.address.toLowerCase().includes(restaurantSearch.toLowerCase())
  );

  const filteredFoods = foods.filter(f => {
    const matchesSearch =
      foodSearch === '' ||
      f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(foodSearch.toLowerCase());
    const matchesCategory = foodCategoryFilter === 'ALL' || f.category === foodCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      paymentSearch === '' ||
      String(p.id).includes(paymentSearch) ||
      String(p.orderId).includes(paymentSearch) ||
      p.transactionId.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesMethod = paymentMethodFilter === 'ALL' || p.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesMethod;
  });

  // Calculate high-fidelity chart data from real database stats
  const totalRev = stats?.totalRevenue ?? 209.6;
  const ordersByDay = stats?.ordersByDay || [
    { day: 'Mon', orders: 3, revenue: 58.5 },
    { day: 'Tue', orders: 4, revenue: 82.0 },
    { day: 'Wed', orders: 2, revenue: 41.5 },
    { day: 'Thu', orders: 5, revenue: 112.0 },
    { day: 'Fri', orders: 7, revenue: 174.5 },
    { day: 'Sat', orders: 8, revenue: 209.6 },
    { day: 'Sun', orders: 6, revenue: 145.0 },
  ];

  const revenueByMonth = stats?.revenueByMonth || [
    { month: 'Jan', revenue: 140.0 },
    { month: 'Feb', revenue: 175.0 },
    { month: 'Mar', revenue: 195.0 },
    { month: 'Apr', revenue: totalRev },
  ];

  const statusDistribution = stats?.statusDistribution || [
    { status: 'DELIVERED', count: orders.filter(o => o.orderStatus === 'DELIVERED').length },
    { status: 'OUT_FOR_DELIVERY', count: orders.filter(o => o.orderStatus === 'OUT_FOR_DELIVERY').length },
    { status: 'PREPARING', count: orders.filter(o => o.orderStatus === 'PREPARING').length },
    { status: 'CONFIRMED', count: orders.filter(o => o.orderStatus === 'CONFIRMED').length },
    { status: 'PLACED', count: orders.filter(o => o.orderStatus === 'PLACED').length },
  ];

  const maxDayOrders = Math.max(...ordersByDay.map((d: any) => d.orders), 1);
  const maxMonthRev = Math.max(...revenueByMonth.map((m: any) => m.revenue), 1);
  const totalStatusCount = statusDistribution.reduce((acc: number, s: any) => acc + s.count, 0) || 1;

  return (
    <div className="container-fluid p-0 bg-slate-50 min-vh-100 animate-in fade-in">
      <div className="row g-0">
        {/* ========================================================
            ADMIN SIDEBAR (Fixed/Sticky on Desktop)
            ======================================================== */}
        <aside className="col-12 col-lg-2 bg-dark text-white border-end border-secondary/30 min-vh-lg-100 d-flex flex-column justify-content-between p-3">
          <div>
            {/* Brand & Admin Badge */}
            <div className="d-flex align-items-center gap-2.5 pb-3 mb-3 border-bottom border-secondary/40">
              <div className="w-9 h-9 rounded-3 bg-gradient-to-tr from-[#FF5A1F] to-[#FF8A00] d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="fw-black text-white font-heading d-block text-sm tracking-tight text-truncate">
                  FoodHub Admin
                </span>
                <span className="text-[10px] text-orange-400 font-mono text-uppercase tracking-wider">
                  Spring JPA / MySQL
                </span>
              </div>
            </div>

            {/* Sidebar Navigation Links */}
            <div className="text-[11px] fw-bold text-muted text-uppercase px-2 mb-2">Main Menu</div>
            <nav className="nav flex-column gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`nav-link text-start rounded-3 px-3 py-2 text-xs fw-bold d-flex align-items-center justify-content-between transition ${
                  activeTab === 'dashboard'
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'text-light text-opacity-80 hover:bg-white/10'
                }`}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                {activeTab === 'dashboard' && <span className="w-1.5 h-1.5 rounded-circle bg-white" />}
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`nav-link text-start rounded-3 px-3 py-2 text-xs fw-bold d-flex align-items-center justify-content-between transition ${
                  activeTab === 'customers'
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'text-light text-opacity-80 hover:bg-white/10'
                }`}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Customers</span>
                </div>
                <span className="badge bg-white/20 text-white rounded-pill text-[10px] px-1.5">
                  {users.filter(u => u.role === 'CUSTOMER').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('restaurants')}
                className={`nav-link text-start rounded-3 px-3 py-2 text-xs fw-bold d-flex align-items-center justify-content-between transition ${
                  activeTab === 'restaurants'
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'text-light text-opacity-80 hover:bg-white/10'
                }`}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <Store className="w-4 h-4" />
                  <span>Restaurants</span>
                </div>
                <span className="badge bg-white/20 text-white rounded-pill text-[10px] px-1.5">
                  {restaurants.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('foods')}
                className={`nav-link text-start rounded-3 px-3 py-2 text-xs fw-bold d-flex align-items-center justify-content-between transition ${
                  activeTab === 'foods'
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'text-light text-opacity-80 hover:bg-white/10'
                }`}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Food Items</span>
                </div>
                <span className="badge bg-white/20 text-white rounded-pill text-[10px] px-1.5">
                  {foods.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`nav-link text-start rounded-3 px-3 py-2 text-xs fw-bold d-flex align-items-center justify-content-between transition ${
                  activeTab === 'orders'
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'text-light text-opacity-80 hover:bg-white/10'
                }`}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders</span>
                </div>
                <span className="badge bg-warning text-dark rounded-pill text-[10px] px-1.5 fw-bold">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`nav-link text-start rounded-3 px-3 py-2 text-xs fw-bold d-flex align-items-center justify-content-between transition ${
                  activeTab === 'payments'
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'text-light text-opacity-80 hover:bg-white/10'
                }`}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Payments</span>
                </div>
                <span className="badge bg-success-subtle text-success rounded-pill text-[10px] px-1.5">
                  {payments.length || orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`nav-link text-start rounded-3 px-3 py-2 text-xs fw-bold d-flex align-items-center justify-content-between transition ${
                  activeTab === 'reports'
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'text-light text-opacity-80 hover:bg-white/10'
                }`}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <FileBarChart2 className="w-4 h-4" />
                  <span>Reports</span>
                </div>
                <span className="badge bg-info-subtle text-info rounded-pill text-[10px] px-1.5">
                  BI
                </span>
              </button>
            </nav>
          </div>

          {/* Footer User Info & Logout Button */}
          <div className="pt-3 mt-3 border-top border-secondary/40">
            <div className="d-flex align-items-center gap-2 mb-2 px-2">
              <div className="w-7 h-7 rounded-circle bg-warning text-dark fw-bold text-xs d-flex align-items-center justify-content-center">
                A
              </div>
              <div className="overflow-hidden">
                <span className="text-xs fw-bold text-white d-block text-truncate">
                  {currentUser?.name || 'System Admin'}
                </span>
                <span className="text-[10px] text-muted d-block text-truncate">
                  {currentUser?.email || 'admin@foodhub.com'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                onShowToast('Logged out of admin console', 'info');
              }}
              className="btn btn-outline-danger btn-sm w-100 rounded-3 text-xs fw-bold d-flex align-items-center justify-content-center gap-1.5 py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ========================================================
            MAIN ADMIN CONTENT AREA
            ======================================================== */}
        <main className="col-12 col-lg-10 p-3 p-md-4 p-xl-5 overflow-y-auto">
          {/* Top Bar / Header */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom bg-white p-3 rounded-4 shadow-2xs">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-warning text-dark rounded-pill px-2.5 py-0.5 text-[10px] fw-black d-inline-flex align-items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>ROLE: ADMIN</span>
                </span>
                <span className="text-muted text-[11px]">System Status: Online & Synchronized</span>
              </div>
              <h1 className="fs-4 fw-black text-dark font-heading mb-0 text-capitalize">
                {activeTab === 'dashboard' ? 'Executive Dashboard Overview' : `${activeTab} Management`}
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="btn btn-sm btn-light border rounded-pill px-3 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1 text-muted"
                title="Reload dataset from backend"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => {
                  setEditingRestaurant(null);
                  setRestForm({
                    name: '',
                    cuisine: '',
                    address: '',
                    phone: '',
                    description: '',
                    imageUrl: '',
                    deliveryTime: '25-35 min',
                  });
                  setShowAddRestaurant(true);
                }}
                className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Restaurant</span>
              </button>

              <button
                onClick={() => {
                  setEditingFood(null);
                  setFoodForm({
                    restaurantId: restaurants[0]?.id || 1,
                    name: '',
                    category: 'Pizzas',
                    price: '14.99',
                    description: '',
                    isVeg: false,
                    imageUrl: '',
                    isAvailable: true,
                  });
                  setShowAddFood(true);
                }}
                className="btn btn-sm btn-dark rounded-pill px-3 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Food Item</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              TAB 1: DASHBOARD (STATISTICS + CHARTS + RECENT FEED)
              ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Dashboard Statistics - 6 Key KPI Cards */}
              <div className="row g-3">
                {/* 1. Total Orders */}
                <div className="col-12 col-sm-6 col-xl-2">
                  <div className="card rounded-4 border p-3 bg-white shadow-2xs h-100 card-hover-lift">
                    <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
                      <span>Total Orders</span>
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="fs-3 fw-black text-dark font-heading mb-0">
                      {stats?.totalOrders ?? orders.length}
                    </p>
                    <span className="text-[10px] text-muted">All-time lifetime orders</span>
                  </div>
                </div>

                {/* 2. Total Customers */}
                <div className="col-12 col-sm-6 col-xl-2">
                  <div className="card rounded-4 border p-3 bg-white shadow-2xs h-100 card-hover-lift">
                    <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
                      <span>Total Customers</span>
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <p className="fs-3 fw-black text-dark font-heading mb-0">
                      {stats?.totalCustomers ?? users.filter(u => u.role === 'CUSTOMER').length}
                    </p>
                    <span className="text-[10px] text-success fw-bold">Active user accounts</span>
                  </div>
                </div>

                {/* 3. Total Restaurants */}
                <div className="col-12 col-sm-6 col-xl-2">
                  <div className="card rounded-4 border p-3 bg-white shadow-2xs h-100 card-hover-lift">
                    <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
                      <span>Restaurants</span>
                      <Store className="w-4 h-4 text-[#FF5A1F]" />
                    </div>
                    <p className="fs-3 fw-black text-dark font-heading mb-0">
                      {stats?.totalRestaurants ?? restaurants.length}
                    </p>
                    <span className="text-[10px] text-[#FF5A1F] fw-bold">Onboarded kitchens</span>
                  </div>
                </div>

                {/* 4. Total Food Items */}
                <div className="col-12 col-sm-6 col-xl-2">
                  <div className="card rounded-4 border p-3 bg-white shadow-2xs h-100 card-hover-lift">
                    <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
                      <span>Food Items</span>
                      <UtensilsCrossed className="w-4 h-4 text-warning" />
                    </div>
                    <p className="fs-3 fw-black text-dark font-heading mb-0">
                      {stats?.totalFoodItems ?? foods.length}
                    </p>
                    <span className="text-[10px] text-muted">Active menu offerings</span>
                  </div>
                </div>

                {/* 5. Total Revenue */}
                <div className="col-12 col-sm-6 col-xl-2">
                  <div className="card rounded-4 border p-3 bg-emerald-50/50 border-emerald-200 shadow-2xs h-100 card-hover-lift">
                    <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
                      <span>Total Revenue</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="fs-3 fw-black text-emerald-700 font-heading mb-0">
                      ${totalRev.toFixed(2)}
                    </p>
                    <span className="text-[10px] text-emerald-700 fw-bold">Gross transaction volume</span>
                  </div>
                </div>

                {/* 6. Pending Orders */}
                <div className="col-12 col-sm-6 col-xl-2">
                  <div className="card rounded-4 border p-3 bg-rose-50/50 border-rose-200 shadow-2xs h-100 card-hover-lift">
                    <div className="d-flex justify-content-between text-muted text-[11px] fw-bold text-uppercase mb-1">
                      <span>Pending Orders</span>
                      <Clock className="w-4 h-4 text-danger" />
                    </div>
                    <p className="fs-3 fw-black text-danger font-heading mb-0">
                      {stats?.pendingOrders ?? orders.filter(o => o.orderStatus !== 'DELIVERED').length}
                    </p>
                    <span className="text-[10px] text-danger fw-bold">Active in prep/transit</span>
                  </div>
                </div>
              </div>

              {/* Charts Section: 3 Rich Visual Graphs based on Real Database Data */}
              <div className="row g-3">
                {/* Chart 1: Orders by Day (Last 7 Days) */}
                <div className="col-12 col-lg-5">
                  <div className="card rounded-4 border p-4 bg-white shadow-2xs h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h3 className="fs-6 fw-black text-dark font-heading mb-0">Orders by Day</h3>
                        <span className="text-muted text-[11px]">Daily volume over the past 7 days</span>
                      </div>
                      <span className="badge bg-primary-subtle text-primary rounded-pill text-[10px] fw-bold">
                        Weekly Pipeline
                      </span>
                    </div>

                    <div className="pt-2 d-flex align-items-end justify-content-between gap-2" style={{ height: '180px' }}>
                      {ordersByDay.map((d: any, idx: number) => {
                        const heightPct = Math.round((d.orders / maxDayOrders) * 100);
                        return (
                          <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end group">
                            <span className="text-[10px] fw-bold text-dark mb-1">{d.orders}</span>
                            <div
                              className="w-100 rounded-3 bg-gradient-to-t from-orange-500 to-[#FF8A00] transition group-hover:opacity-85 shadow-2xs"
                              style={{ height: `${Math.max(15, heightPct)}%`, minWidth: '18px' }}
                              title={`${d.day}: ${d.orders} orders ($${d.revenue})`}
                            />
                            <span className="text-[11px] text-muted fw-bold mt-2">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Chart 2: Revenue by Month */}
                <div className="col-12 col-lg-4">
                  <div className="card rounded-4 border p-4 bg-white shadow-2xs h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h3 className="fs-6 fw-black text-dark font-heading mb-0">Revenue by Month</h3>
                        <span className="text-muted text-[11px]">Monthly settlement totals</span>
                      </div>
                      <span className="badge bg-success-subtle text-success rounded-pill text-[10px] fw-bold">
                        GTV Breakdown
                      </span>
                    </div>

                    <div className="pt-2 d-flex align-items-end justify-content-between gap-3" style={{ height: '180px' }}>
                      {revenueByMonth.map((m: any, idx: number) => {
                        const heightPct = Math.round((m.revenue / maxMonthRev) * 100);
                        return (
                          <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                            <span className="text-[10px] fw-black text-emerald-700 mb-1">${Math.round(m.revenue)}</span>
                            <div
                              className="w-100 rounded-3 bg-gradient-to-t from-emerald-600 to-teal-400 transition shadow-2xs"
                              style={{ height: `${Math.max(20, heightPct)}%`, minWidth: '22px' }}
                              title={`${m.month}: $${m.revenue.toFixed(2)}`}
                            />
                            <span className="text-[11px] text-muted fw-bold mt-2">{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Chart 3: Order Status Distribution */}
                <div className="col-12 col-lg-3">
                  <div className="card rounded-4 border p-4 bg-white shadow-2xs h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h3 className="fs-6 fw-black text-dark font-heading mb-0">Status Distribution</h3>
                        <span className="text-muted text-[11px]">Live state allocation</span>
                      </div>
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {statusDistribution.map((item: any, idx: number) => {
                        const pct = Math.round((item.count / totalStatusCount) * 100);
                        const colorClass =
                          item.status === 'DELIVERED'
                            ? 'bg-success'
                            : item.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-primary'
                            : item.status === 'PREPARING'
                            ? 'bg-warning'
                            : item.status === 'CONFIRMED'
                            ? 'bg-info'
                            : 'bg-secondary';
                        return (
                          <div key={idx}>
                            <div className="d-flex justify-content-between text-[11px] mb-1">
                              <span className="fw-bold text-dark">{item.status.replace(/_/g, ' ')}</span>
                              <span className="text-muted fw-bold">
                                {item.count} ({pct}%)
                              </span>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                              <div
                                className={`progress-bar ${colorClass}`}
                                role="progressbar"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders in Dashboard view */}
              <div className="card rounded-4 border shadow-2xs overflow-hidden bg-white">
                <div className="p-3 px-4 border-bottom d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="fs-6 fw-black text-dark font-heading mb-0">Recent Order Pipeline</h3>
                    <span className="text-muted text-[11px]">Real-time live feeds from verified kitchens</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="btn btn-sm btn-link text-[#FF5A1F] text-xs fw-bold text-decoration-none p-0"
                  >
                    View all orders &rarr;
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 text-xs">
                    <thead className="table-light text-uppercase text-[10px] text-muted">
                      <tr>
                        <th className="ps-4">ID</th>
                        <th>Customer</th>
                        <th>Restaurant</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td className="ps-4 fw-bold text-dark">#{o.id}</td>
                          <td className="fw-semibold text-dark">{o.userName}</td>
                          <td className="text-secondary">{o.restaurantName}</td>
                          <td className="fw-black text-dark font-heading">${o.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`badge rounded-pill text-[10px] fw-bold ${
                              o.paymentStatus === 'PAID' ? 'bg-success text-white' : 'bg-warning text-dark'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill text-[10px] fw-bold">
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <button
                              onClick={() => onViewOrder(o)}
                              className="btn btn-sm btn-outline-dark rounded-pill py-1 px-2.5 text-xs fw-bold"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: CUSTOMERS (VIEW, SEARCH, ACTIVATE/DEACTIVATE, DETAILS)
              ======================================================== */}
          {activeTab === 'customers' && (
            <div className="card rounded-4 border shadow-2xs overflow-hidden bg-white">
              <div className="p-3 px-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h3 className="fs-6 fw-black text-dark font-heading mb-0">
                    Platform Customers ({filteredCustomers.length})
                  </h3>
                  <span className="text-muted text-[11px]">
                    Manage registered customer profiles, credentials, and activation state.
                  </span>
                </div>

                <div className="position-relative" style={{ maxWidth: '320px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="form-control form-control-sm rounded-pill ps-5 text-xs bg-light"
                  />
                  <Search className="w-3.5 h-3.5 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-xs">
                  <thead className="table-light text-uppercase text-[10px] text-muted">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Customer Details</th>
                      <th>Contact Info</th>
                      <th>Primary Delivery Address</th>
                      <th>Account Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          No customer accounts found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(u => {
                        const isActive = u.isActive !== false;
                        return (
                          <tr key={u.id}>
                            <td className="ps-4 font-monospace text-muted">#{u.id}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="w-8 h-8 rounded-circle bg-orange-100 text-[#FF5A1F] fw-black text-xs d-flex align-items-center justify-content-center">
                                  {u.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="fw-bold text-dark d-block">{u.name}</span>
                                  <span className="text-muted text-[10px]">
                                    Joined {new Date(u.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-dark fw-semibold">{u.email}</div>
                              <div className="text-muted text-[11px]">{u.phone || 'No phone'}</div>
                            </td>
                            <td>
                              <div className="text-muted text-truncate" style={{ maxWidth: '240px' }}>
                                {u.address || 'Address not configured'}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill text-[10px] fw-bold ${
                                  isActive ? 'bg-success text-white' : 'bg-secondary text-white'
                                }`}
                              >
                                {isActive ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <div className="d-flex align-items-center justify-content-end gap-1.5">
                                <button
                                  onClick={() => setSelectedCustomer(u)}
                                  className="btn btn-sm btn-outline-dark rounded-pill py-1 px-2.5 text-xs fw-bold"
                                  title="View full customer details"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => handleToggleCustomerStatus(u)}
                                  className={`btn btn-sm rounded-pill py-1 px-2.5 text-xs fw-bold ${
                                    isActive
                                      ? 'btn-outline-warning text-dark'
                                      : 'btn-outline-success'
                                  }`}
                                  title={isActive ? 'Deactivate account' : 'Activate account'}
                                >
                                  {isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                                  title="Delete customer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: RESTAURANTS (ADD, EDIT, DELETE, ACTIVATE/DEACTIVATE)
              ======================================================== */}
          {activeTab === 'restaurants' && (
            <div className="space-y-3">
              {/* Search and Action Bar */}
              <div className="card rounded-4 border p-3 bg-white shadow-2xs d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="position-relative" style={{ maxWidth: '340px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Search restaurant by name, cuisine, address..."
                    value={restaurantSearch}
                    onChange={e => setRestaurantSearch(e.target.value)}
                    className="form-control form-control-sm rounded-pill ps-5 text-xs bg-light"
                  />
                  <Search className="w-3.5 h-3.5 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
                </div>

                <button
                  onClick={() => {
                    setEditingRestaurant(null);
                    setRestForm({
                      name: '',
                      cuisine: '',
                      address: '',
                      phone: '',
                      description: '',
                      imageUrl: '',
                      deliveryTime: '25-35 min',
                    });
                    setShowAddRestaurant(true);
                  }}
                  className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Restaurant Partner</span>
                </button>
              </div>

              {/* Restaurant Cards Grid */}
              <div className="row g-3">
                {filteredRestaurants.map(rest => (
                  <div key={rest.id} className="col-12 col-md-6 col-xl-4">
                    <div className="card rounded-4 border overflow-hidden shadow-2xs h-100 card-hover-lift bg-white">
                      <div className="position-relative" style={{ height: '160px' }}>
                        <img src={rest.imageUrl} alt={rest.name} className="w-100 h-100 object-fit-cover" />
                        <span className={`position-absolute top-0 end-0 m-2 badge rounded-pill ${
                          rest.isActive ? 'bg-success' : 'bg-secondary'
                        }`}>
                          {rest.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white rounded-pill text-[10px]">
                          ★ {rest.rating} • {rest.deliveryTime}
                        </div>
                      </div>
                      <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                        <div>
                          <div className="d-flex align-items-center justify-content-between">
                            <h4 className="fs-6 fw-bold text-dark font-heading mb-0">{rest.name}</h4>
                            <span className="badge bg-orange-100 text-[#FF5A1F] text-[10px] rounded-pill">
                              {rest.cuisine}
                            </span>
                          </div>
                          <p className="text-muted text-xs line-clamp-2 my-2">{rest.description}</p>
                          <p className="text-muted text-[11px] mb-0 d-flex align-items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#FF5A1F]" />
                            <span className="text-truncate">{rest.address}</span>
                          </p>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-3 mt-2 border-top">
                          <button
                            onClick={() => handleToggleRestaurantStatus(rest)}
                            className={`btn btn-sm rounded-pill text-xs fw-bold px-2.5 py-1 ${
                              rest.isActive ? 'btn-outline-secondary' : 'btn-outline-success'
                            }`}
                          >
                            {rest.isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          <div className="d-flex align-items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingRestaurant(rest);
                                setRestForm({
                                  name: rest.name,
                                  cuisine: rest.cuisine,
                                  address: rest.address,
                                  phone: rest.phone,
                                  description: rest.description,
                                  imageUrl: rest.imageUrl,
                                  deliveryTime: rest.deliveryTime,
                                });
                                setShowAddRestaurant(true);
                              }}
                              className="btn btn-sm btn-outline-dark rounded-circle p-1.5"
                              title="Edit partner"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRestaurant(rest.id)}
                              className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                              title="Delete partner"
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

          {/* ========================================================
              TAB 4: FOOD ITEMS (ADD, EDIT, DELETE, UPDATE AVAILABILITY)
              ======================================================== */}
          {activeTab === 'foods' && (
            <div className="card rounded-4 border shadow-2xs overflow-hidden bg-white">
              <div className="p-3 px-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h3 className="fs-6 fw-black text-dark font-heading mb-0">Food Catalog ({filteredFoods.length})</h3>
                  <span className="text-muted text-[11px]">Manage menu dishes, prices, categories, and real-time inventory</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <select
                    value={foodCategoryFilter}
                    onChange={e => setFoodCategoryFilter(e.target.value)}
                    className="form-select form-select-sm text-xs rounded-pill"
                    style={{ width: '140px' }}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Curries">Curries</option>
                    <option value="Ramen">Ramen</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Bowls">Bowls</option>
                    <option value="Beverages">Beverages</option>
                  </select>

                  <div className="position-relative" style={{ maxWidth: '260px', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Search dish..."
                      value={foodSearch}
                      onChange={e => setFoodSearch(e.target.value)}
                      className="form-control form-control-sm rounded-pill ps-5 text-xs bg-light"
                    />
                    <Search className="w-3.5 h-3.5 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
                  </div>

                  <button
                    onClick={() => {
                      setEditingFood(null);
                      setFoodForm({
                        restaurantId: restaurants[0]?.id || 1,
                        name: '',
                        category: 'Pizzas',
                        price: '14.99',
                        description: '',
                        isVeg: false,
                        imageUrl: '',
                        isAvailable: true,
                      });
                      setShowAddFood(true);
                    }}
                    className="btn btn-sm btn-dark rounded-pill px-3 py-1.5 text-xs fw-bold text-nowrap d-inline-flex align-items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dish</span>
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-xs">
                  <thead className="table-light text-uppercase text-[10px] text-muted">
                    <tr>
                      <th className="ps-4">Dish</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Dietary</th>
                      <th>Stock Availability</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFoods.map(f => (
                      <tr key={f.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <img src={f.imageUrl} alt={f.name} className="rounded-2 object-fit-cover" style={{ width: '40px', height: '40px' }} />
                            <div>
                              <span className="fw-bold text-dark d-block">{f.name}</span>
                              <span className="text-muted text-[11px] text-truncate d-block" style={{ maxWidth: '240px' }}>
                                {f.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="fw-semibold text-dark">{f.category}</td>
                        <td className="fw-black text-dark font-heading">${f.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge rounded-pill text-[10px] ${
                            f.isVeg ? 'bg-success text-white' : 'bg-danger text-white'
                          }`}>
                            {f.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleFoodAvailability(f)}
                            className={`btn btn-sm rounded-pill text-xs fw-bold px-3 py-1 ${
                              f.isAvailable ? 'btn-success text-white' : 'btn-secondary text-white'
                            }`}
                          >
                            {f.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              onClick={() => {
                                setEditingFood(f);
                                setFoodForm({
                                  restaurantId: f.restaurantId,
                                  name: f.name,
                                  category: f.category,
                                  price: String(f.price),
                                  description: f.description,
                                  isVeg: f.isVeg,
                                  imageUrl: f.imageUrl,
                                  isAvailable: f.isAvailable,
                                });
                                setShowAddFood(true);
                              }}
                              className="btn btn-sm btn-outline-dark rounded-circle p-1.5"
                              title="Edit dish"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFood(f.id)}
                              className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                              title="Delete dish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: ORDERS (FILTER BY STATUS, DATE, TRANSITION RULES)
              ======================================================== */}
          {activeTab === 'orders' && (
            <div className="card rounded-4 border shadow-2xs overflow-hidden bg-white">
              <div className="p-3 px-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h3 className="fs-6 fw-black text-dark font-heading mb-0">Platform Orders ({filteredOrders.length})</h3>
                  <span className="text-muted text-[11px]">
                    Status updates enforce allowed transitions: Placed &rarr; Confirmed &rarr; Preparing &rarr; Out For Delivery &rarr; Delivered
                  </span>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                  {/* Status Filter */}
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="form-select form-select-sm text-xs rounded-pill"
                    style={{ width: '150px' }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PLACED">PLACED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  {/* Date Filter */}
                  <select
                    value={orderDateFilter}
                    onChange={e => setOrderDateFilter(e.target.value)}
                    className="form-select form-select-sm text-xs rounded-pill"
                    style={{ width: '130px' }}
                  >
                    <option value="ALL">All Dates</option>
                    <option value="TODAY">Today</option>
                    <option value="APRIL">April 2026</option>
                    <option value="MARCH">March 2026</option>
                  </select>

                  {/* Search bar */}
                  <div className="position-relative" style={{ maxWidth: '240px', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Search order ID..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className="form-control form-control-sm rounded-pill ps-5 text-xs bg-light"
                    />
                    <Search className="w-3.5 h-3.5 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-xs">
                  <thead className="table-light text-uppercase text-[10px] text-muted">
                    <tr>
                      <th className="ps-4">ID & Date</th>
                      <th>Customer & Address</th>
                      <th>Restaurant Partner</th>
                      <th>Items & Amount</th>
                      <th>Payment Status</th>
                      <th>Status Transition</th>
                      <th className="text-end pe-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          No orders found matching the chosen filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(o => {
                        const allowedNext = ALLOWED_TRANSITIONS[o.orderStatus] || [];
                        return (
                          <tr key={o.id}>
                            <td className="ps-4">
                              <span className="fw-bold text-dark d-block">#{o.id}</span>
                              <span className="text-[10px] text-muted">
                                {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td>
                              <div className="fw-bold text-dark">{o.userName}</div>
                              <div className="text-[10px] text-muted text-truncate" style={{ maxWidth: '200px' }}>
                                {o.deliveryAddress}
                              </div>
                            </td>
                            <td className="text-secondary fw-semibold">{o.restaurantName}</td>
                            <td>
                              <div className="text-muted text-[11px]">{o.items.length} items</div>
                              <div className="fw-black text-dark font-heading">${o.totalAmount.toFixed(2)}</div>
                            </td>
                            <td>
                              <span className={`badge rounded-pill text-[10px] fw-bold ${
                                o.paymentStatus === 'PAID' ? 'bg-success text-white' : 'bg-warning text-dark'
                              }`}>
                                {o.paymentMethod.replace(/_/g, ' ')} ({o.paymentStatus})
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1.5">
                                <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill text-[10px] fw-bold">
                                  {o.orderStatus}
                                </span>
                                {allowedNext.length > 0 && (
                                  <select
                                    defaultValue=""
                                    onChange={e => {
                                      if (e.target.value) {
                                        handleUpdateOrderStatus(o.id, e.target.value as OrderStatus);
                                      }
                                    }}
                                    className="form-select form-select-sm text-[11px] rounded-3 py-0.5 px-2"
                                    style={{ width: '130px' }}
                                  >
                                    <option value="" disabled>
                                      Advance &rarr;
                                    </option>
                                    {allowedNext.map(ns => (
                                      <option key={ns} value={ns}>
                                        {ns.replace(/_/g, ' ')}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </td>
                            <td className="text-end pe-4">
                              <button
                                onClick={() => onViewOrder(o)}
                                className="btn btn-sm btn-outline-dark rounded-pill py-1 px-3 text-xs fw-bold"
                              >
                                View Order
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: PAYMENTS (TRANSACTIONS, METHOD, AUDIT LOG)
              ======================================================== */}
          {activeTab === 'payments' && (
            <div className="card rounded-4 border shadow-2xs overflow-hidden bg-white">
              <div className="p-3 px-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h3 className="fs-6 fw-black text-dark font-heading mb-0">Payment Records & Audit Logs</h3>
                  <span className="text-muted text-[11px]">
                    Track settlement transactions, instant UPI references, and COD receipts.
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <select
                    value={paymentMethodFilter}
                    onChange={e => setPaymentMethodFilter(e.target.value)}
                    className="form-select form-select-sm text-xs rounded-pill"
                    style={{ width: '140px' }}
                  >
                    <option value="ALL">All Methods</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="UPI">UPI Instant</option>
                    <option value="CASH_ON_DELIVERY">Cash On Delivery</option>
                  </select>

                  <div className="position-relative" style={{ maxWidth: '240px', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Search txn ID or order..."
                      value={paymentSearch}
                      onChange={e => setPaymentSearch(e.target.value)}
                      className="form-control form-control-sm rounded-pill ps-5 text-xs bg-light"
                    />
                    <Search className="w-3.5 h-3.5 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-xs">
                  <thead className="table-light text-uppercase text-[10px] text-muted">
                    <tr>
                      <th className="ps-4">Txn ID</th>
                      <th>Order Reference</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Transaction Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          No payment transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map(p => (
                        <tr key={p.id}>
                          <td className="ps-4 font-mono fw-bold text-dark">{p.transactionId}</td>
                          <td>
                            <button
                              onClick={() => {
                                const ord = orders.find(o => o.id === p.orderId);
                                if (ord) onViewOrder(ord);
                              }}
                              className="btn btn-link btn-sm p-0 text-[#FF5A1F] text-xs fw-bold text-decoration-none"
                            >
                              Order #{p.orderId}
                            </button>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border text-[10px] rounded-pill">
                              {p.paymentMethod.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="fw-black text-dark font-heading">${p.amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge rounded-pill text-[10px] fw-bold ${
                              p.paymentStatus === 'PAID' ? 'bg-success text-white' : 'bg-warning text-dark'
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td className="text-muted text-[11px]">
                            {new Date(p.paymentDate).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: REPORTS (REVENUE, ORDERS, POPULAR ITEMS, PARTNERS)
              ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {/* Reports Header with Export Button */}
              <div className="card rounded-4 border p-4 bg-gradient-to-r from-orange-500 to-[#FF5A1F] text-white shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h3 className="fs-5 fw-black text-white font-heading mb-1">
                    System Intelligence & Analytics Reports
                  </h3>
                  <p className="text-light opacity-90 text-xs mb-0">
                    Aggregated business reports generated directly from relational MySQL order data.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      'Order_ID,Customer,Restaurant,Total_Amount,Payment_Method,Status\n' +
                      orders.map(o => `${o.id},"${o.userName}","${o.restaurantName}",${o.totalAmount},${o.paymentMethod},${o.orderStatus}`).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `foodhub_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    onShowToast('CSV sales report downloaded', 'success');
                  }}
                  className="btn btn-sm btn-light rounded-pill px-4 py-2 text-xs fw-bold text-[#FF5A1F] d-inline-flex align-items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sales Report (CSV)</span>
                </button>
              </div>

              {/* Reports Grid */}
              <div className="row g-4">
                {/* 1. Popular Food Items */}
                <div className="col-12 col-md-6">
                  <div className="card rounded-4 border p-4 bg-white shadow-2xs h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="fs-6 fw-black text-dark font-heading mb-0">Popular Food Items</h4>
                        <span className="text-muted text-[11px]">Ranked by total units ordered</span>
                      </div>
                      <UtensilsCrossed className="w-4 h-4 text-warning" />
                    </div>

                    <div className="space-y-3">
                      {(stats?.popularDishes || [
                        { name: 'Margherita Burrata Pizza', count: 8, revenue: 148.0, restaurant: 'The Golden Spoon' },
                        { name: 'Royal Hyderabadi Dum Biryani', count: 6, revenue: 105.0, restaurant: 'Spice Route' },
                        { name: 'Tokyo Shoyu Black Truffle Ramen', count: 5, revenue: 87.5, restaurant: 'Tokyo Ramen' },
                        { name: 'Truffle Tagliatelle', count: 4, revenue: 88.0, restaurant: 'The Golden Spoon' },
                      ]).map((item: any, idx: number) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between pb-2 border-bottom">
                          <div className="d-flex align-items-center gap-2.5">
                            <span className="w-6 h-6 rounded-circle bg-orange-100 text-[#FF5A1F] text-xs fw-black d-flex align-items-center justify-content-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="fw-bold text-dark text-xs d-block">{item.name}</span>
                              <span className="text-muted text-[10px]">{item.restaurant}</span>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="fw-black text-dark text-xs d-block">${item.revenue.toFixed(2)}</span>
                            <span className="text-muted text-[10px]">{item.count} sold</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Popular Restaurants */}
                <div className="col-12 col-md-6">
                  <div className="card rounded-4 border p-4 bg-white shadow-2xs h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="fs-6 fw-black text-dark font-heading mb-0">Top Performing Restaurants</h4>
                        <span className="text-muted text-[11px]">Ranked by total platform revenue generated</span>
                      </div>
                      <Store className="w-4 h-4 text-[#FF5A1F]" />
                    </div>

                    <div className="space-y-3">
                      {(stats?.popularRestaurants || [
                        { name: 'The Golden Spoon', count: 4, revenue: 142.0 },
                        { name: 'Spice Route Delights', count: 3, revenue: 78.5 },
                        { name: 'Tokyo Ramen & Gyoza Bar', count: 2, revenue: 53.0 },
                        { name: 'BurgerCraft Artisan Burgers', count: 2, revenue: 42.0 },
                      ]).map((item: any, idx: number) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between pb-2 border-bottom">
                          <div className="d-flex align-items-center gap-2.5">
                            <span className="w-6 h-6 rounded-circle bg-emerald-100 text-emerald-700 text-xs fw-black d-flex align-items-center justify-content-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="fw-bold text-dark text-xs d-block">{item.name}</span>
                              <span className="text-muted text-[10px]">{item.count} orders fulfilled</span>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="fw-black text-emerald-700 text-xs d-block">${item.revenue.toFixed(2)}</span>
                            <span className="badge bg-emerald-50 text-emerald-600 text-[10px] rounded-pill">Top Kitchen</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL: ADD / EDIT RESTAURANT
          ======================================================== */}
      {showAddRestaurant && (
        <div className="position-fixed inset-0 z-50 d-flex align-items-center justify-content-center p-3 bg-dark/70 backdrop-blur-xs">
          <div className="bg-white rounded-4 p-4 shadow-2xl border w-100 animate-in zoom-in-95" style={{ maxWidth: '500px' }}>
            <h3 className="fs-5 fw-black text-dark font-heading mb-3">
              {editingRestaurant ? 'Edit Restaurant Partner' : 'Add New Restaurant Partner'}
            </h3>
            <form onSubmit={handleSaveRestaurant} className="space-y-2.5 text-xs">
              <div>
                <label className="fw-bold mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={restForm.name}
                  onChange={e => setRestForm({ ...restForm, name: e.target.value })}
                  className="form-control form-control-sm text-xs rounded-2"
                  placeholder="e.g. Napoli Stone Oven"
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="fw-bold mb-1">Cuisine</label>
                  <input
                    type="text"
                    required
                    value={restForm.cuisine}
                    onChange={e => setRestForm({ ...restForm, cuisine: e.target.value })}
                    className="form-control form-control-sm text-xs rounded-2"
                    placeholder="e.g. Italian & Pizza"
                  />
                </div>
                <div className="col-6">
                  <label className="fw-bold mb-1">Delivery Time</label>
                  <input
                    type="text"
                    value={restForm.deliveryTime}
                    onChange={e => setRestForm({ ...restForm, deliveryTime: e.target.value })}
                    className="form-control form-control-sm text-xs rounded-2"
                    placeholder="e.g. 25-35 min"
                  />
                </div>
              </div>
              <div>
                <label className="fw-bold mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={restForm.address}
                  onChange={e => setRestForm({ ...restForm, address: e.target.value })}
                  className="form-control form-control-sm text-xs rounded-2"
                  placeholder="Street address, city..."
                />
              </div>
              <div>
                <label className="fw-bold mb-1">Phone</label>
                <input
                  type="text"
                  value={restForm.phone}
                  onChange={e => setRestForm({ ...restForm, phone: e.target.value })}
                  className="form-control form-control-sm text-xs rounded-2"
                  placeholder="+1 555-0188"
                />
              </div>
              <div>
                <label className="fw-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={restForm.description}
                  onChange={e => setRestForm({ ...restForm, description: e.target.value })}
                  className="form-control text-xs rounded-2"
                  placeholder="Culinary specialties and chef signature..."
                />
              </div>
              <div>
                <label className="fw-bold mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={restForm.imageUrl}
                  onChange={e => setRestForm({ ...restForm, imageUrl: e.target.value })}
                  className="form-control form-control-sm text-xs rounded-2"
                  placeholder="https://..."
                />
              </div>
              <div className="d-flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRestaurant(false)}
                  className="btn btn-sm btn-light rounded-pill flex-grow-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-pill flex-grow-1"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT FOOD ITEM
          ======================================================== */}
      {showAddFood && (
        <div className="position-fixed inset-0 z-50 d-flex align-items-center justify-content-center p-3 bg-dark/70 backdrop-blur-xs">
          <div className="bg-white rounded-4 p-4 shadow-2xl border w-100 animate-in zoom-in-95" style={{ maxWidth: '500px' }}>
            <h3 className="fs-5 fw-black text-dark font-heading mb-3">
              {editingFood ? 'Edit Dish in Catalog' : 'Add Dish to Catalog'}
            </h3>
            <form onSubmit={handleSaveFood} className="space-y-2.5 text-xs">
              <div>
                <label className="fw-bold mb-1">Restaurant Partner</label>
                <select
                  value={foodForm.restaurantId}
                  onChange={e => setFoodForm({ ...foodForm, restaurantId: Number(e.target.value) })}
                  className="form-select form-select-sm text-xs rounded-2"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="fw-bold mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={e => setFoodForm({ ...foodForm, name: e.target.value })}
                  className="form-control form-control-sm text-xs rounded-2"
                  placeholder="e.g. Quattro Formaggi Pizza"
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="fw-bold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={foodForm.category}
                    onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="form-control form-control-sm text-xs rounded-2"
                  />
                </div>
                <div className="col-6">
                  <label className="fw-bold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={foodForm.price}
                    onChange={e => setFoodForm({ ...foodForm, price: e.target.value })}
                    className="form-control form-control-sm text-xs rounded-2"
                  />
                </div>
              </div>
              <div>
                <label className="fw-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodForm.description}
                  onChange={e => setFoodForm({ ...foodForm, description: e.target.value })}
                  className="form-control text-xs rounded-2"
                />
              </div>
              <div className="d-flex align-items-center gap-4 pt-1">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="adminVegCheck"
                    checked={foodForm.isVeg}
                    onChange={e => setFoodForm({ ...foodForm, isVeg: e.target.checked })}
                    className="form-check-input"
                  />
                  <label htmlFor="adminVegCheck" className="form-check-label fw-bold text-dark">
                    Pure Vegetarian Dish
                  </label>
                </div>
                {editingFood && (
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="adminAvailCheck"
                      checked={foodForm.isAvailable}
                      onChange={e => setFoodForm({ ...foodForm, isAvailable: e.target.checked })}
                      className="form-check-input"
                    />
                    <label htmlFor="adminAvailCheck" className="form-check-label fw-bold text-dark">
                      Available In Stock
                    </label>
                  </div>
                )}
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

      {/* ========================================================
          MODAL: CUSTOMER DETAILS INSPECTOR
          ======================================================== */}
      {selectedCustomer && (
        <div className="position-fixed inset-0 z-50 d-flex align-items-center justify-content-center p-3 bg-dark/70 backdrop-blur-xs">
          <div className="bg-white rounded-4 p-4 shadow-2xl border w-100 animate-in zoom-in-95" style={{ maxWidth: '480px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div className="w-9 h-9 rounded-circle bg-orange-100 text-[#FF5A1F] fw-black d-flex align-items-center justify-content-center">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="fs-6 fw-bold text-dark font-heading mb-0">{selectedCustomer.name}</h4>
                  <span className="text-muted text-[10px]">Customer ID #{selectedCustomer.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn btn-sm btn-light rounded-circle p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-light rounded-3">
                <div className="d-flex align-items-center gap-2 text-muted mb-1">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>Email Address:</span>
                </div>
                <div className="fw-bold text-dark ps-4">{selectedCustomer.email}</div>
              </div>

              <div className="p-3 bg-light rounded-3">
                <div className="d-flex align-items-center gap-2 text-muted mb-1">
                  <Phone className="w-3.5 h-3.5 text-success" />
                  <span>Contact Phone:</span>
                </div>
                <div className="fw-bold text-dark ps-4">{selectedCustomer.phone || 'Not provided'}</div>
              </div>

              <div className="p-3 bg-light rounded-3">
                <div className="d-flex align-items-center gap-2 text-muted mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>Default Delivery Address:</span>
                </div>
                <div className="fw-bold text-dark ps-4">{selectedCustomer.address || 'Not configured'}</div>
              </div>

              <div className="p-3 bg-light rounded-3">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-muted">Account State:</span>
                  <span className={`badge rounded-pill ${
                    selectedCustomer.isActive !== false ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {selectedCustomer.isActive !== false ? 'Active Account' : 'Deactivated'}
                  </span>
                </div>
                <div className="d-flex align-items-center justify-content-between mt-1">
                  <span className="text-muted">Registered On:</span>
                  <span className="text-dark fw-bold">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-top d-flex gap-2">
              <button
                onClick={() => {
                  handleToggleCustomerStatus(selectedCustomer);
                  setSelectedCustomer({
                    ...selectedCustomer,
                    isActive: selectedCustomer.isActive === false ? true : false,
                  });
                }}
                className={`btn btn-sm rounded-pill flex-grow-1 ${
                  selectedCustomer.isActive !== false ? 'btn-outline-warning text-dark' : 'btn-outline-success'
                }`}
              >
                {selectedCustomer.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn btn-sm btn-dark rounded-pill flex-grow-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
