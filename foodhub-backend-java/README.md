# FoodHub – Online Food Ordering System (Java Spring Boot Backend)

A complete, modern, production-grade Spring Boot REST API backend for the **FoodHub Online Food Ordering System**.

---

## 1. Complete Project Structure

```
foodhub-backend/
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── foodhub/
        │           ├── FoodHubApplication.java
        │           ├── config/
        │           │   ├── SecurityConfig.java
        │           │   └── WebConfig.java
        │           ├── controller/
        │           │   ├── AuthController.java
        │           │   ├── CartController.java
        │           │   ├── FoodItemController.java
        │           │   ├── OrderController.java
        │           │   ├── PaymentController.java
        │           │   ├── RestaurantController.java
        │           │   └── UserController.java
        │           ├── dto/
        │           │   └── AuthDTOs.java
        │           ├── entity/
        │           │   ├── Cart.java
        │           │   ├── CartItem.java
        │           │   ├── FoodItem.java
        │           │   ├── Order.java
        │           │   ├── OrderItem.java
        │           │   ├── Payment.java
        │           │   ├── Restaurant.java
        │           │   └── User.java
        │           ├── exception/
        │           │   └── GlobalExceptionHandler.java
        │           ├── repository/
        │           │   ├── CartItemRepository.java
        │           │   ├── CartRepository.java
        │           │   ├── FoodItemRepository.java
        │           │   ├── OrderItemRepository.java
        │           │   ├── OrderRepository.java
        │           │   ├── PaymentRepository.java
        │           │   ├── RestaurantRepository.java
        │           │   └── UserRepository.java
        │           └── service/
        │               ├── CartService.java
        │               ├── FoodItemService.java
        │               ├── OrderService.java
        │               ├── PaymentService.java
        │               ├── RestaurantService.java
        │               └── UserService.java
        └── resources/
            ├── application.properties
            ├── data.sql
            └── schema.sql
```

---

## 2. MySQL Database Setup

1. Open your terminal or MySQL Workbench:
```bash
mysql -u root -p
```
2. Create the database:
```sql
CREATE DATABASE foodhub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
3. Grant permissions (if using a custom user):
```sql
CREATE USER 'foodhub_user'@'localhost' IDENTIFIED BY 'foodhub_pass';
GRANT ALL PRIVILEGES ON foodhub_db.* TO 'foodhub_user'@'localhost';
FLUSH PRIVILEGES;
```
4. Schema & Data scripts will automatically execute via `spring.sql.init.mode=always`, or you can manually execute:
```bash
mysql -u root -p foodhub_db < src/main/resources/schema.sql
mysql -u root -p foodhub_db < src/main/resources/data.sql
```

---

## 3. Configuration (`application.properties`)

Edit `src/main/resources/application.properties`:
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/foodhub_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=rootpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 4. Maven Dependencies Included

- `spring-boot-starter-web`: Spring MVC RESTful APIs
- `spring-boot-starter-data-jpa`: Hibernate ORM persistence
- `spring-boot-starter-security`: BCrypt hashing & endpoint security
- `spring-boot-starter-validation`: Bean Validation (`@Valid`, `@NotBlank`, etc.)
- `mysql-connector-j`: MySQL 8.x database driver
- `lombok`: Automated getters, setters, builders
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson`: JWT token generation & verification

---

## 5. Sample Login Credentials

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Admin** | `admin@foodhub.com` | `Admin123!` | System administrator (full access) |
| **Restaurant Owner** | `owner.goldenspoon@foodhub.com` | `Owner123!` | Owner of *The Golden Spoon* |
| **Restaurant Owner** | `owner.spiceroute@foodhub.com` | `Owner123!` | Owner of *Spice Route Delights* |
| **Customer** | `john.doe@example.com` | `Password123!` | Customer account with existing orders |
| **Customer** | `emily.smith@example.com` | `Password123!` | Customer account |
| **Customer** | `michael.brown@example.com` | `Password123!` | Customer account |
| **Customer** | `sarah.connor@example.com` | `Password123!` | Customer account |
| **Customer** | `david.miller@example.com` | `Password123!` | Customer account |

---

## 6. REST API Documentation

### Authentication
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate user & get token

### Restaurants
- `GET /api/restaurants` - List active restaurants (supports `?cuisine=Italian&search=Spoon`)
- `GET /api/restaurants/{id}` - Get restaurant by ID
- `POST /api/restaurants` - Add new restaurant [Admin/Owner]
- `PUT /api/restaurants/{id}` - Update restaurant details
- `DELETE /api/restaurants/{id}` - Delete restaurant
- `GET /api/restaurants/{id}/menu` - Get food items categorized for this restaurant

### Food Items
- `GET /api/foods` - List all foods (supports `?restaurantId=1&category=Pizzas&search=Truffle`)
- `GET /api/foods/{id}` - Food item details
- `POST /api/foods?restaurantId=1` - Create food item [Owner/Admin]
- `PUT /api/foods/{id}` - Update food item
- `DELETE /api/foods/{id}` - Delete food item

### Cart
- `GET /api/cart` - Retrieve authenticated user's cart (with subtotals, tax, discount)
- `POST /api/cart/items` - Add food item (`foodItemId`, `quantity`)
- `PUT /api/cart/items/{id}` - Update item quantity
- `DELETE /api/cart/items/{id}` - Remove item from cart

### Orders & Tracking
- `POST /api/orders` - Place order from cart (`deliveryAddress`, `paymentMethod`)
- `GET /api/orders` - View order history (filtered by user or restaurant)
- `GET /api/orders/{id}` - Order details & timeline status
- `PUT /api/orders/{id}/status` - Update status (`PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`)

### Payments
- `POST /api/payments` - Process simulated transaction (`CASH_ON_DELIVERY`, `CARD`, `UPI`)
- `GET /api/payments/order/{orderId}` - View payment receipt

### User Profile & Management
- `GET /api/users/profile` - Current user profile
- `PUT /api/users/profile` - Update profile, phone, address, or password
- `GET /api/users` - List all system users [Admin]
- `DELETE /api/users/{id}` - Remove customer/user [Admin]

---

## 7. Instructions to Run

1. Verify Java 17+ and Maven:
```bash
java -version
mvn -version
```
2. Navigate to project root:
```bash
cd foodhub-backend-java
```
3. Build the application:
```bash
mvn clean package -DskipTests
```
4. Run Spring Boot application:
```bash
mvn spring-boot:run
```
Or execute the JAR:
```bash
java -jar target/foodhub-backend-1.0.0.jar
```
5. Verify health:
Visit `http://localhost:8080/api/restaurants` in your browser or Postman.

---

## 8. Troubleshooting Instructions

1. **Access denied for user 'root'@'localhost'**:
   - Double check your password in `application.properties`.
   - Update `spring.datasource.password=YOUR_ACTUAL_PASSWORD`.
2. **Table doesn't exist error**:
   - Set `spring.jpa.hibernate.ddl-auto=create-drop` once, run, then switch back to `update`.
3. **CORS issues when connecting from frontend**:
   - `WebConfig.java` allows `*` origins by default. Ensure request headers include `x-user-id` or `Authorization`.
4. **Port 8080 already in use**:
   - Change `server.port=8081` in `application.properties`.
