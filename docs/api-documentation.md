# REST API Specification

## FoodHub – Online Food Ordering System

---

## 1. API Architecture & Standards

* **Base URL**: `http://localhost:8080/api` (Spring Boot) or `/api` (React Frontend proxy)
* **Data Format**: `application/json; charset=UTF-8`
* **Authentication Header**: `Authorization: Bearer <token>`
* **User Context Header**: `x-user-id: <numeric_user_id>` (supplemental identification header)
* **Error Handling**: Standardized error response model emitted by `GlobalExceptionHandler`.

### Standard Error Response Format
```json
{
  "timestamp": "2026-10-09T14:32:10.123",
  "status": 400,
  "error": "Bad Request",
  "message": "Item 'Margherita Burrata Pizza' is currently out of stock."
}
```

### Validation Error Response Format (HTTP 400)
```json
{
  "timestamp": "2026-10-09T14:32:10.123",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input validation failed. Please check required fields.",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1. Register New User
* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "Password123!",
  "phone": "+1 555-0199",
  "address": "456 Innovation Way, Austin, TX",
  "role": "CUSTOMER"
}
```
* **Validation Constraints**:
  - `name`: `@NotBlank(message = "Name is required")`
  - `email`: `@NotBlank`, `@Email(message = "Invalid email format")`
  - `password`: `@NotBlank`, `@Size(min = 6, message = "Password must be at least 6 characters")`
  - `role`: Optional enum (`CUSTOMER`, `ADMIN`, `RESTAURANT_OWNER`). Defaults to `CUSTOMER`.
* **Success Response (`201 Created`)**:
```json
{
  "token": "fht_eyJ1c2VySWQiOjksImVtYWlsIjoiamFuZUBleGFtcGxlLmNvbSJ9",
  "userId": 9,
  "name": "Jane Developer",
  "email": "jane@example.com",
  "role": "CUSTOMER",
  "address": "456 Innovation Way, Austin, TX",
  "phone": "+1 555-0199"
}
```
* **Error Responses**:
  - `400 Bad Request`: `{"error": "Bad Request", "message": "Email is already registered!"}`

---

### 2.2. User Login
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```
* **Success Response (`200 OK`)**:
```json
{
  "token": "fht_eyJ1c2VySWQiOjQsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20ifQ==",
  "userId": 4,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "CUSTOMER",
  "address": "742 Evergreen Terrace, Springfield, OR",
  "phone": "+1 555-0201"
}
```
* **Error Responses**:
  - `401 Unauthorized`: `{"error": "Unauthorized", "message": "Invalid email or password"}`
  - `403 Forbidden`: `{"error": "Forbidden", "message": "Your account is deactivated. Please contact support."}`

---

## 3. Restaurant Endpoints (`/api/restaurants`)

### 3.1. List All Active Restaurants
* **Method**: `GET`
* **Endpoint**: `/api/restaurants`
* **Query Parameters**:
  - `cuisine` (optional, string): Filters by cuisine (e.g., `Italian`, `Indian`).
  - `search` (optional, string): Text search matching restaurant name or description.
* **Success Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "name": "The Golden Spoon",
    "description": "Authentic handmade Italian artisanal pizzas, fresh truffle pastas, and handcrafted desserts.",
    "address": "42 Via Bella, Little Italy, New York, NY",
    "phone": "+1 212-555-0199",
    "imageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "deliveryTime": "25-35 min",
    "cuisine": "Italian & Woodfired Pizza",
    "isActive": true
  }
]
```

---

### 3.2. Get Restaurant by ID
* **Method**: `GET`
* **Endpoint**: `/api/restaurants/{id}`
* **Success Response (`200 OK`)**: Returns single restaurant object.
* **Error Response (`404 Not Found`)**: `{"error": "Not Found", "message": "Restaurant not found with ID: 99"}`

---

### 3.3. Create Restaurant
* **Method**: `POST`
* **Endpoint**: `/api/restaurants`
* **Access**: `ADMIN` or `RESTAURANT_OWNER`
* **Request Body**:
```json
{
  "name": "Tokyo Robata Grill",
  "description": "Authentic charcoal-grilled robatayaki skewers and fresh sashimi.",
  "address": "88 Sakura Way, Midtown, NY",
  "phone": "+1 212-555-0177",
  "cuisine": "Japanese & Grill",
  "deliveryTime": "25-40 min",
  "imageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
  "rating": 4.7
}
```
* **Success Response (`201 Created`)**: Returns newly created restaurant object with generated `id`.

---

### 3.4. Update Restaurant
* **Method**: `PUT`
* **Endpoint**: `/api/restaurants/{id}`
* **Access**: `ADMIN` or authorized Owner
* **Success Response (`200 OK`)**: Returns updated restaurant object.

---

### 3.5. Delete Restaurant
* **Method**: `DELETE`
* **Endpoint**: `/api/restaurants/{id}`
* **Access**: `ADMIN`
* **Success Response (`200 OK`)**: `{"message": "Restaurant deleted successfully"}`

---

### 3.6. Get Restaurant Menu
* **Method**: `GET`
* **Endpoint**: `/api/restaurants/{id}/menu`
* **Query Parameters**:
  - `category` (optional, string): Filters food items by category (e.g., `Pizzas`, `Desserts`).
* **Success Response (`200 OK`)**: Array of available `FoodItem` objects for that restaurant.

---

## 4. Food Item Endpoints (`/api/foods`)

### 4.1. List Food Items
* **Method**: `GET`
* **Endpoint**: `/api/foods`
* **Query Parameters**:
  - `restaurantId` (optional, Long)
  - `category` (optional, string)
  - `search` (optional, string)
* **Success Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "name": "Margherita Burrata Pizza",
    "description": "San Marzano tomato sauce, creamy whole burrata, fresh basil, and extra virgin olive oil.",
    "category": "Pizzas",
    "price": 18.50,
    "imageUrl": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143",
    "isAvailable": true,
    "isVeg": true
  }
]
```

---

### 4.2. Create Food Item
* **Method**: `POST`
* **Endpoint**: `/api/foods?restaurantId={restaurantId}`
* **Request Body**:
```json
{
  "restaurantId": 1,
  "name": "Penne all'Arrabbiata",
  "description": "Artisan penne pasta with spicy garlic tomato chili sauce.",
  "category": "Pasta",
  "price": 16.50,
  "imageUrl": "https://images.unsplash.com/photo-1621996346565",
  "isAvailable": true,
  "isVeg": true
}
```
* **Success Response (`201 Created`)**: Returns newly created `FoodItem`.

---

### 4.3. Update Food Item (Stock Availability / Price / Title)
* **Method**: `PUT`
* **Endpoint**: `/api/foods/{id}`
* **Request Body**: Partial or full fields (e.g., `{"isAvailable": false, "price": 17.50}`)
* **Success Response (`200 OK`)**: Returns updated `FoodItem`.

---

### 4.4. Delete Food Item
* **Method**: `DELETE`
* **Endpoint**: `/api/foods/{id}`
* **Success Response (`200 OK`)**: `{"message": "Food item deleted successfully"}`

---

## 5. Shopping Cart Endpoints (`/api/cart`)

### 5.1. Get User Shopping Cart
* **Method**: `GET`
* **Endpoint**: `/api/cart`
* **Headers**: `x-user-id: <userId>`
* **Success Response (`200 OK`)**:
```json
{
  "id": 1,
  "itemCount": 2,
  "restaurantId": 1,
  "total": 42.97,
  "items": [
    {
      "id": 10,
      "quantity": 2,
      "price": 18.50,
      "foodItem": {
        "id": 1,
        "restaurantId": 1,
        "name": "Margherita Burrata Pizza",
        "category": "Pizzas",
        "price": 18.50,
        "isAvailable": true,
        "isVeg": true
      }
    }
  ]
}
```

---

### 5.2. Add Item to Cart
* **Method**: `POST`
* **Endpoint**: `/api/cart/items`
* **Headers**: `x-user-id: <userId>`
* **Request Body**:
```json
{
  "foodItemId": 1,
  "quantity": 2
}
```
* **Validation Constraints**: `foodItemId` (`@NotNull`), `quantity` (`@NotNull`, positive).
* **Behavior Note**: If user previously held items from Restaurant A, and adds a dish from Restaurant B, the system automatically purges items from Restaurant A to prevent multi-restaurant checkout conflicts.
* **Success Response (`201 Created`)**: Returns updated `Cart`.

---

### 5.3. Update Cart Item Quantity
* **Method**: `PUT`
* **Endpoint**: `/api/cart/items/{id}`
* **Headers**: `x-user-id: <userId>`
* **Request Body**:
```json
{
  "quantity": 3
}
```
* **Behavior Note**: If `quantity <= 0`, item is automatically purged from the cart.
* **Success Response (`200 OK`)**: Returns updated `Cart`.

---

### 5.4. Remove Item from Cart
* **Method**: `DELETE`
* **Endpoint**: `/api/cart/items/{id}`
* **Success Response (`200 OK`)**: Returns updated `Cart`.

---

### 5.5. Clear Entire Cart
* **Method**: `DELETE`
* **Endpoint**: `/api/cart`
* **Success Response (`204 No Content`)**

---

## 6. Order Endpoints (`/api/orders`)

### 6.1. Place Order
* **Method**: `POST`
* **Endpoint**: `/api/orders`
* **Headers**: `x-user-id: <userId>`
* **Request Body**:
```json
{
  "restaurantId": 1,
  "deliveryAddress": "742 Evergreen Terrace, Springfield, OR",
  "paymentMethod": "CASH_ON_DELIVERY"
}
```
* **Validation Constraints**:
  - `deliveryAddress`: `@NotBlank(message = "Delivery address is required")`
  - `paymentMethod`: `@NotNull` (`CASH_ON_DELIVERY`, `CARD`, `UPI`)
* **Business Logic Enforced**:
  - Cart must contain at least 1 item (`RuntimeException: Shopping cart is empty!`).
  - All items must be in stock (`Boolean.FALSE.equals(ci.getFoodItem().getIsAvailable())` causes rejection).
  - Automatically generates Payment transaction ID and clears user cart.
* **Success Response (`201 Created`)**:
```json
{
  "id": 101,
  "totalAmount": 42.97,
  "deliveryAddress": "742 Evergreen Terrace, Springfield, OR",
  "paymentMethod": "CASH_ON_DELIVERY",
  "paymentStatus": "PENDING",
  "orderStatus": "PLACED",
  "createdAt": "2026-10-09T14:40:00",
  "items": [
    {
      "id": 201,
      "quantity": 2,
      "price": 18.50,
      "foodItem": {
        "id": 1,
        "name": "Margherita Burrata Pizza"
      }
    }
  ],
  "payment": {
    "id": 85,
    "amount": 42.97,
    "paymentMethod": "CASH_ON_DELIVERY",
    "paymentStatus": "PENDING",
    "transactionId": "TXN_COD_9A7B3C1F"
  }
}
```

---

### 6.2. Get Orders (Filtered by Role / Restaurant / User)
* **Method**: `GET`
* **Endpoint**: `/api/orders`
* **Headers**: `x-user-id: <userId>`
* **Query Parameters**:
  - `restaurantId` (optional, Long): Used by Restaurant Owners to inspect incoming queue.
* **Success Response (`200 OK`)**: List of orders sorted chronologically descending.

---

### 6.3. Get Order Details by ID
* **Method**: `GET`
* **Endpoint**: `/api/orders/{id}`
* **Headers**: `Authorization: Bearer <token>`, `x-user-id: <userId>`
* **Security Check**: Enforces ownership isolation. Customers can only fetch orders where `order.userId == currentUser.id`. Unauthorized access returns `403 Forbidden`.
* **Success Response (`200 OK`)**: Single `Order` record with items, restaurant, and payment details.

---

### 6.4. Update Order Status
* **Method**: `PUT`
* **Endpoint**: `/api/orders/{id}/status`
* **Access**: Authorized `ADMIN` or Restaurant Owner
* **Request Body**:
```json
{
  "status": "PREPARING"
}
```
* **Allowed Statuses**: `PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`
* **Success Response (`200 OK`)**: Returns updated `Order`. When status transitions to `DELIVERED` for COD orders, payment status is automatically updated to `PAID`.

---

## 7. Payment Endpoints (`/api/payments`)

### 7.1. Process Payment
* **Method**: `POST`
* **Endpoint**: `/api/payments`
* **Request Body**:
```json
{
  "orderId": 101,
  "amount": 42.97,
  "paymentMethod": "CARD"
}
```
* **Success Response (`201 Created`)**:
```json
{
  "id": 86,
  "amount": 42.97,
  "paymentMethod": "CARD",
  "paymentStatus": "PAID",
  "transactionId": "TXN_CARD_E4A9B28C",
  "paymentDate": "2026-10-09T14:41:15"
}
```

---

### 7.2. Get Payment by Order ID
* **Method**: `GET`
* **Endpoint**: `/api/payments/order/{orderId}`
* **Success Response (`200 OK`)**: Returns `Payment` entity.

---

## 8. User Management Endpoints (`/api/users`)

### 8.1. Get Current User Profile
* **Method**: `GET`
* **Endpoint**: `/api/users/profile`
* **Headers**: `x-user-id: <userId>`
* **Success Response (`200 OK`)**: Returns profile object (password hash omitted).

---

### 8.2. Update Profile
* **Method**: `PUT`
* **Endpoint**: `/api/users/profile`
* **Headers**: `x-user-id: <userId>`
* **Request Body**:
```json
{
  "name": "John Doe",
  "phone": "+1 555-9876",
  "address": "900 Sunset Boulevard, Los Angeles, CA",
  "password": "NewSecretPassword123!"
}
```
* **Success Response (`200 OK`)**: Returns updated `User` object.

---

### 8.3. Admin: List All Users
* **Method**: `GET`
* **Endpoint**: `/api/users`
* **Access**: `ADMIN`
* **Success Response (`200 OK`)**: List of all registered users with their account status and role.

---

### 8.4. Admin: Toggle User Account Status
* **Method**: `PUT`
* **Endpoint**: `/api/users/{id}/status`
* **Access**: `ADMIN`
* **Request Body**:
```json
{
  "isActive": false
}
```
* **Success Response (`200 OK`)**: Returns updated `User` object.

---

## 9. Example cURL Test Invocations

### Register:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@example.com","password":"Password123!","role":"CUSTOMER"}'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodhub.com","password":"Admin123!"}'
```

### Fetch Active Restaurants:
```bash
curl -X GET "http://localhost:8080/api/restaurants?cuisine=Italian"
```

### Place Order:
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: 4" \
  -d '{"restaurantId":1,"deliveryAddress":"742 Evergreen Terrace","paymentMethod":"CASH_ON_DELIVERY"}'
```
