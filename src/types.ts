export type UserRole = 'CUSTOMER' | 'ADMIN' | 'RESTAURANT_OWNER';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  imageUrl: string;
  rating: number;
  deliveryTime: string;
  isActive: boolean;
  cuisine: string;
  ownerId?: number;
}

export interface FoodItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isVeg: boolean;
}

export interface CartItem {
  id: number;
  cartId: number;
  foodItemId: number;
  quantity: number;
  price: number;
  foodItem?: FoodItem;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  restaurantId?: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'CARD' | 'UPI';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface OrderItem {
  id: number;
  orderId: number;
  foodItemId: number;
  quantity: number;
  price: number;
  foodItemName?: string;
  foodItemImage?: string;
}

export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  restaurantName?: string;
  userName?: string;
  userPhone?: string;
  estimatedDeliveryMinutes?: number;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paymentDate: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
