import { User, Restaurant, FoodItem, Cart, Order, OrderStatus, PaymentMethod, Payment, AuthResponse } from './types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;
  private currentUserId: number | null = null;

  constructor() {
    this.token = localStorage.getItem('foodhub_token');
    const savedUser = localStorage.getItem('foodhub_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        this.currentUserId = u.id;
      } catch {
        // ignore
      }
    }
  }

  setAuth(token: string | null, user: User | null) {
    this.token = token;
    this.currentUserId = user ? user.id : null;
    if (token) {
      localStorage.setItem('foodhub_token', token);
    } else {
      localStorage.removeItem('foodhub_token');
    }
    if (user) {
      localStorage.setItem('foodhub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('foodhub_user');
    }
  }

  getSavedUser(): User | null {
    const saved = localStorage.getItem('foodhub_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.currentUserId) {
      headers['x-user-id'] = String(this.currentUserId);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMessage = 'Request failed';
      try {
        const errorJson = await response.json();
        errMessage = errorJson.message || errorJson.error || errMessage;
      } catch {
        errMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errMessage);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  async register(data: { name: string; email: string; password: string; phone?: string; address?: string; role?: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setAuth(res.token, res.user);
    return res;
  }

  logout() {
    this.setAuth(null, null);
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/users/profile');
  }

  async updateProfile(data: Partial<User> & { password?: string }): Promise<User> {
    const updated = await this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const current = this.getSavedUser();
    if (current) {
      this.setAuth(this.token, { ...current, ...updated });
    }
    return updated;
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async updateUserStatus(id: number, isActive?: boolean): Promise<User> {
    return this.request<User>(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
  }

  // Restaurants
  async getRestaurants(params?: { cuisine?: string; search?: string }): Promise<Restaurant[]> {
    const q = new URLSearchParams();
    if (params?.cuisine) q.append('cuisine', params.cuisine);
    if (params?.search) q.append('search', params.search);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return this.request<Restaurant[]>(`/restaurants${queryString}`);
  }

  async getRestaurant(id: number): Promise<Restaurant> {
    return this.request<Restaurant>(`/restaurants/${id}`);
  }

  async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    return this.request<Restaurant>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: number, data: Partial<Restaurant>): Promise<Restaurant> {
    return this.request<Restaurant>(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRestaurant(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/restaurants/${id}`, { method: 'DELETE' });
  }

  async getRestaurantMenu(id: number, category?: string): Promise<FoodItem[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<FoodItem[]>(`/restaurants/${id}/menu${q}`);
  }

  // Foods
  async getFoods(params?: { restaurantId?: number; category?: string; search?: string }): Promise<FoodItem[]> {
    const q = new URLSearchParams();
    if (params?.restaurantId) q.append('restaurantId', String(params.restaurantId));
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return this.request<FoodItem[]>(`/foods${queryString}`);
  }

  async createFood(data: Partial<FoodItem>): Promise<FoodItem> {
    return this.request<FoodItem>('/foods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFood(id: number, data: Partial<FoodItem>): Promise<FoodItem> {
    return this.request<FoodItem>(`/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFood(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/foods/${id}`, { method: 'DELETE' });
  }

  // Cart
  async getCart(): Promise<Cart> {
    return this.request<Cart>('/cart');
  }

  async addToCart(foodItemId: number, quantity: number = 1): Promise<Cart> {
    return this.request<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ foodItemId, quantity }),
    });
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<Cart> {
    return this.request<Cart>(`/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(cartItemId: number): Promise<Cart> {
    return this.request<Cart>(`/cart/items/${cartItemId}`, { method: 'DELETE' });
  }

  // Orders
  async createOrder(data: {
    restaurantId?: number;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
  }): Promise<{ order: Order; payment: any; message: string }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(restaurantId?: number): Promise<Order[]> {
    const q = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return this.request<Order[]>(`/orders${q}`);
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Payments
  async getPayments(orderId?: number): Promise<Payment[]> {
    const q = orderId ? `?orderId=${orderId}` : '';
    return this.request<Payment[]>(`/payments${q}`);
  }

  async getPayment(id: number): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}`);
  }

  // Stats
  async getAdminStats() {
    return this.request<{
      totalCustomers: number;
      totalRestaurants: number;
      totalFoodItems: number;
      totalOrders: number;
      totalRevenue: number;
      dailyRevenue: number;
      monthlyRevenue: number;
      pendingOrders: number;
      ordersByDay: { day: string; orders: number; revenue: number }[];
      revenueByMonth: { month: string; revenue: number }[];
      statusDistribution: { status: string; count: number }[];
      popularDishes: { name: string; count: number; revenue: number; restaurant: string }[];
      popularRestaurants: { name: string; count: number; revenue: number }[];
    }>('/admin/stats');
  }

  async getOwnerStats(restaurantId: number = 1) {
    return this.request<{
      restaurantId: number;
      totalOrders: number;
      activeOrders: number;
      totalRevenue: number;
      totalFoodItems: number;
    }>(`/owner/stats?restaurantId=${restaurantId}`);
  }
}

export const api = new ApiClient();
