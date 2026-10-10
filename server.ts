import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword } from './server/db.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Helper auth token generator & parser
function generateToken(userId: number, email: string, role: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, email, role, exp: Date.now() + 86400000 })).toString('base64');
  return `fht_${payload}`;
}

function parseToken(authHeader?: string, userIdHeader?: string | string[]): { userId: number; role?: string } | null {
  if (userIdHeader) {
    const uid = parseInt(Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader);
    if (!isNaN(uid)) {
      const u = db.findUserById(uid);
      if (u) return { userId: u.id, role: u.role };
    }
  }

  if (authHeader && authHeader.startsWith('Bearer fht_')) {
    try {
      const base64 = authHeader.replace('Bearer fht_', '');
      const parsed = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
      if (parsed.userId) {
        return { userId: parsed.userId, role: parsed.role };
      }
    } catch {
      return null;
    }
  }
  return null;
}

// Global Exception / Error response wrapper
function errorResponse(res: Response, status: number, message: string, details?: any) {
  return res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    error: status === 404 ? 'Not Found' : status === 400 ? 'Bad Request' : status === 401 ? 'Unauthorized' : 'Error',
    message,
    details,
  });
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. AUTH
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, address, role } = req.body;
  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Name, email, and password are required.');
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return errorResponse(res, 400, 'An account with this email already exists.');
  }

  const user = db.createUser({
    name,
    email,
    password,
    phone: phone || '',
    address: address || '',
    role: role || 'CUSTOMER',
  });

  const token = generateToken(user.id, user.email, user.role);
  return res.status(201).json({
    token,
    user,
    message: 'User registered successfully',
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (user.isActive === false) {
    return errorResponse(res, 403, 'Your account is deactivated. Please contact support.');
  }

  const inputHash = hashPassword(password);
  if (user.passwordHash !== inputHash) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  const token = generateToken(user.id, user.email, user.role);
  const { passwordHash, ...cleanUser } = user;
  return res.json({
    token,
    user: cleanUser,
    message: 'Login successful',
  });
});

// 2. USERS
app.get('/api/users/profile', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  if (!auth) return errorResponse(res, 401, 'Unauthorized');

  const user = db.findUserById(auth.userId);
  if (!user) return errorResponse(res, 404, 'User not found');

  const { passwordHash, ...cleanUser } = user;
  return res.json(cleanUser);
});

app.put('/api/users/profile', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  if (!auth) return errorResponse(res, 401, 'Unauthorized');

  const { name, phone, address, password } = req.body;
  const user = db.findUserById(auth.userId);
  if (!user) return errorResponse(res, 404, 'User not found');

  if (password && password.trim().length >= 6) {
    user.passwordHash = hashPassword(password);
  }

  const updated = db.updateUser(auth.userId, { name, phone, address });
  return res.json(updated);
});

app.get('/api/users', (req: Request, res: Response) => {
  const cleanUsers = db.users.map(({ passwordHash, ...u }) => u);
  return res.json(cleanUsers);
});

app.put('/api/users/:id/status', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = db.findUserById(id);
  if (!user) return errorResponse(res, 404, 'User not found');
  const { isActive } = req.body;
  user.isActive = isActive !== undefined ? Boolean(isActive) : !user.isActive;
  const { passwordHash, ...cleanUser } = user;
  return res.json(cleanUser);
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const deleted = db.deleteUser(id);
  if (!deleted) return errorResponse(res, 404, 'User not found');
  return res.json({ message: 'User deleted successfully' });
});

// 3. RESTAURANTS
app.get('/api/restaurants', (req: Request, res: Response) => {
  const cuisine = req.query.cuisine as string;
  const search = req.query.search as string;
  const restaurants = db.getRestaurants(cuisine, search);
  return res.json(restaurants);
});

app.get('/api/restaurants/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const rest = db.getRestaurantById(id);
  if (!rest) return errorResponse(res, 404, `Restaurant with ID ${id} not found`);
  return res.json(rest);
});

app.post('/api/restaurants', (req: Request, res: Response) => {
  const { name, description, address, phone, imageUrl, cuisine, deliveryTime } = req.body;
  if (!name || !address) return errorResponse(res, 400, 'Name and address are required');

  const newRest = db.createRestaurant({
    name,
    description: description || '',
    address,
    phone: phone || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    cuisine: cuisine || 'Multi-Cuisine',
    deliveryTime: deliveryTime || '25-35 min',
    rating: 4.8,
    isActive: true,
  });
  return res.status(201).json(newRest);
});

app.put('/api/restaurants/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updated = db.updateRestaurant(id, req.body);
  if (!updated) return errorResponse(res, 404, `Restaurant with ID ${id} not found`);
  return res.json(updated);
});

app.delete('/api/restaurants/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteRestaurant(id);
  if (!success) return errorResponse(res, 404, `Restaurant with ID ${id} not found`);
  return res.json({ message: 'Restaurant deleted successfully' });
});

app.get('/api/restaurants/:id/menu', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const rest = db.getRestaurantById(id);
  if (!rest) return errorResponse(res, 404, `Restaurant with ID ${id} not found`);

  const category = req.query.category as string;
  const items = db.getFoodItems(id, category);
  return res.json(items);
});

// 4. FOOD ITEMS
app.get('/api/foods', (req: Request, res: Response) => {
  const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const items = db.getFoodItems(restaurantId, category, search);
  return res.json(items);
});

app.get('/api/foods/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.getFoodItemById(id);
  if (!item) return errorResponse(res, 404, `Food item with ID ${id} not found`);
  return res.json(item);
});

app.post('/api/foods', (req: Request, res: Response) => {
  const { restaurantId, name, description, category, price, imageUrl, isVeg, isAvailable } = req.body;
  if (!restaurantId || !name || price === undefined) {
    return errorResponse(res, 400, 'Restaurant ID, name, and price are required');
  }

  const newItem = db.createFoodItem({
    restaurantId: Number(restaurantId),
    name,
    description: description || '',
    category: category || 'Main Course',
    price: Number(price),
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isVeg: Boolean(isVeg),
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
  });
  return res.status(201).json(newItem);
});

app.put('/api/foods/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updated = db.updateFoodItem(id, req.body);
  if (!updated) return errorResponse(res, 404, `Food item with ID ${id} not found`);
  return res.json(updated);
});

app.delete('/api/foods/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteFoodItem(id);
  if (!success) return errorResponse(res, 404, `Food item with ID ${id} not found`);
  return res.json({ message: 'Food item deleted successfully' });
});

// 5. CART
app.get('/api/cart', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const userId = auth?.userId || 4; // fallback to John Doe for quick exploration
  const cart = db.getUserCart(userId);
  return res.json(cart);
});

app.post('/api/cart/items', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const userId = auth?.userId || 4;
  const { foodItemId, quantity } = req.body;

  if (!foodItemId) {
    return errorResponse(res, 400, 'Food item ID is required');
  }

  const parsedQty = quantity !== undefined ? Number(quantity) : 1;
  if (isNaN(parsedQty) || parsedQty <= 0) {
    return errorResponse(res, 400, 'Quantity must be at least 1');
  }

  try {
    const cart = db.addToCart(userId, Number(foodItemId), parsedQty);
    return res.status(201).json(cart);
  } catch (err: any) {
    return errorResponse(res, 400, err.message);
  }
});

app.put('/api/cart/items/:id', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const userId = auth?.userId || 4;
  const cartItemId = parseInt(req.params.id);
  const { quantity } = req.body;

  const parsedQty = Number(quantity);
  if (isNaN(parsedQty)) {
    return errorResponse(res, 400, 'Valid quantity is required');
  }

  try {
    const cart = db.updateCartItem(userId, cartItemId, parsedQty);
    return res.json(cart);
  } catch (err: any) {
    return errorResponse(res, 400, err.message);
  }
});

app.delete('/api/cart/items/:id', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const userId = auth?.userId || 4;
  const cartItemId = parseInt(req.params.id);

  const cart = db.removeCartItem(userId, cartItemId);
  return res.json(cart);
});

// 6. ORDERS
app.post('/api/orders', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const userId = auth?.userId || 4;
  const { restaurantId, deliveryAddress, paymentMethod } = req.body;

  if (!deliveryAddress || !paymentMethod) {
    return errorResponse(res, 400, 'Delivery address and payment method are required');
  }

  try {
    const cart = db.getUserCart(userId);
    if (!cart.items || cart.items.length === 0) {
      return errorResponse(res, 400, 'Shopping cart is empty. Please add items before checking out.');
    }

    // Check if any items in cart are out of stock
    for (const ci of cart.items) {
      if (ci.foodItem && ci.foodItem.isAvailable === false) {
        return errorResponse(res, 400, `Item "${ci.foodItem.name}" is currently unavailable. Please remove it from your cart.`);
      }
    }

    const targetRestaurantId = restaurantId || cart.restaurantId;
    if (!targetRestaurantId) {
      return errorResponse(res, 400, 'Restaurant is not specified or cart is empty');
    }

    const { order, payment } = db.createOrder({
      userId,
      restaurantId: Number(targetRestaurantId),
      deliveryAddress,
      paymentMethod,
    });

    return res.status(201).json({
      order,
      payment,
      message: 'Order placed successfully',
    });
  } catch (err: any) {
    return errorResponse(res, 400, err.message);
  }
});

app.get('/api/orders', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const userId = auth?.userId;
  const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined;

  if (restaurantId) {
    const orders = db.getOrdersByRestaurant(restaurantId);
    return res.json(orders);
  }

  if (auth && auth.role === 'ADMIN') {
    return res.json(db.getAllOrders());
  }

  if (userId) {
    return res.json(db.getOrdersByUser(userId));
  }

  // fallback to all orders for admin preview
  return res.json(db.getAllOrders());
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const id = parseInt(req.params.id);
  const order = db.getOrderById(id);
  if (!order) return errorResponse(res, 404, `Order #${id} not found`);

  // Role authorization checks
  if (auth) {
    if (auth.role === 'ADMIN') {
      return res.json(order);
    }
    if (auth.role === 'RESTAURANT_OWNER') {
      const rest = db.getRestaurantById(order.restaurantId);
      if (rest && rest.ownerId && rest.ownerId !== auth.userId) {
        return errorResponse(res, 403, 'Access denied: You are only authorized to view orders from your restaurant');
      }
      return res.json(order);
    }
    if (auth.role === 'CUSTOMER') {
      if (order.userId !== auth.userId) {
        return errorResponse(res, 403, 'Access denied: You are only authorized to track your own orders');
      }
      return res.json(order);
    }
  }

  return res.json(order);
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!status) return errorResponse(res, 400, 'Status is required');

  const order = db.getOrderById(id);
  if (!order) return errorResponse(res, 404, `Order #${id} not found`);

  // Enforce customer restriction
  if (auth && auth.role === 'CUSTOMER') {
    return errorResponse(res, 403, 'Permission denied: Customers cannot update order status');
  }

  // Restaurant Owner validation
  if (auth && auth.role === 'RESTAURANT_OWNER') {
    const rest = db.getRestaurantById(order.restaurantId);
    if (rest && rest.ownerId && rest.ownerId !== auth.userId) {
      return errorResponse(res, 403, 'Permission denied: You can only update orders for your restaurant');
    }
  }

  // Allowed transitions
  const allowedTransitions: Record<string, string[]> = {
    'PLACED': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['OUT_FOR_DELIVERY', 'CANCELLED'],
    'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': [],
    'CANCELLED': []
  };

  const validNext = allowedTransitions[order.orderStatus] || [];
  if (order.orderStatus === 'DELIVERED') {
    return errorResponse(res, 400, 'Cannot change status of an already delivered order');
  }
  if (order.orderStatus === 'CANCELLED') {
    return errorResponse(res, 400, 'Cannot change status of a cancelled order');
  }

  if (auth?.role !== 'ADMIN' && !validNext.includes(status)) {
    return errorResponse(res, 400, `Invalid status transition from ${order.orderStatus} to ${status}. Allowed: ${validNext.join(', ')}`);
  }

  const updated = db.updateOrderStatus(id, status);
  if (!updated) return errorResponse(res, 404, `Order #${id} not found`);
  return res.json(updated);
});

// 7. PAYMENTS
app.get('/api/payments', (req: Request, res: Response) => {
  const auth = parseToken(req.headers.authorization, req.headers['x-user-id']);
  const orderId = req.query.orderId ? parseInt(req.query.orderId as string) : undefined;
  
  let allPayments = db.getAllPayments();
  if (orderId) {
    allPayments = allPayments.filter(p => p.orderId === orderId);
  }
  return res.json(allPayments);
});

app.get('/api/payments/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const payment = db.getPaymentById(id);
  if (!payment) return errorResponse(res, 404, `Payment #${id} not found`);
  return res.json(payment);
});

app.post('/api/payments', (req: Request, res: Response) => {
  const { orderId, amount, paymentMethod } = req.body;
  if (!orderId || !paymentMethod) {
    return errorResponse(res, 400, 'Order ID and payment method are required');
  }

  const prefix = paymentMethod === 'CARD' ? 'TXN_CARD_' : paymentMethod === 'UPI' ? 'TXN_UPI_' : 'TXN_COD_';
  const payment = {
    id: Date.now(),
    orderId,
    amount,
    paymentMethod,
    paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
    transactionId: prefix + Math.floor(100000 + Math.random() * 900000),
    paymentDate: new Date().toISOString(),
  };

  return res.status(201).json(payment);
});

// 8. STATS
app.get('/api/admin/stats', (req: Request, res: Response) => {
  return res.json(db.getAdminStats());
});

app.get('/api/owner/stats', (req: Request, res: Response) => {
  const restId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : 1;
  return res.json(db.getRestaurantOwnerStats(restId));
});

// ----------------------------------------------------
// SERVER STARTUP WITH VITE INTEGRATION
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodHub Server is live on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
