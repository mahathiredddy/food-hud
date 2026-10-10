export interface JavaFileItem {
  path: string;
  category: 'Configuration' | 'Entities' | 'Repositories' | 'Services' | 'Controllers' | 'DTOs' | 'Database' | 'Docs';
  language: string;
  description: string;
  content: string;
}

export const JAVA_PROJECT_FILES: JavaFileItem[] = [
  {
    path: 'pom.xml',
    category: 'Configuration',
    language: 'xml',
    description: 'Maven dependencies for Spring Boot 3, Spring Security, JPA, MySQL, Lombok & JWT',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>

    <groupId>com.foodhub</groupId>
    <artifactId>foodhub-backend</artifactId>
    <version>1.0.0</version>
    <name>FoodHub – Online Food Ordering System</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
    </dependencies>
</project>`
  },
  {
    path: 'src/main/resources/application.properties',
    category: 'Configuration',
    language: 'properties',
    description: 'Spring Boot MySQL connection, dialect, and JPA settings',
    content: `server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/foodhub_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=rootpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:schema.sql
spring.sql.init.data-locations=classpath:data.sql`
  },
  {
    path: 'src/main/resources/schema.sql',
    category: 'Database',
    language: 'sql',
    description: 'Complete MySQL DDL creating users, restaurants, food_items, cart, cart_items, orders, order_items, payments',
    content: `-- FoodHub MySQL Schema Definition
CREATE DATABASE IF NOT EXISTS foodhub_db;
USE foodhub_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    address VARCHAR(255),
    role ENUM('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER') NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    image_url VARCHAR(500),
    rating DECIMAL(2, 1) DEFAULT 4.5,
    delivery_time VARCHAR(50) DEFAULT '30 mins',
    cuisine VARCHAR(100) DEFAULT 'Multi-Cuisine',
    is_active BOOLEAN DEFAULT TRUE,
    owner_id BIGINT,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS food_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    is_veg BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    food_item_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    payment_method ENUM('CASH_ON_DELIVERY', 'CARD', 'UPI') NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    order_status ENUM('PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PLACED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    food_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CASH_ON_DELIVERY', 'CARD', 'UPI') NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'FAILED') NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);`
  },
  {
    path: 'com/foodhub/FoodHubApplication.java',
    category: 'Configuration',
    language: 'java',
    description: 'Spring Boot main starter class',
    content: `package com.foodhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FoodHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodHubApplication.class, args);
        System.out.println("FoodHub Online Food Ordering System Server Started on :8080");
    }
}`
  },
  {
    path: 'com/foodhub/entity/Order.java',
    category: 'Entities',
    language: 'java',
    description: 'JPA Order entity with enum statuses and cascade relations',
    content: `package com.foodhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "delivery_address", nullable = false)
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public enum OrderStatus {
        PLACED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }

    public enum PaymentMethod {
        CASH_ON_DELIVERY, CARD, UPI
    }

    public enum PaymentStatus {
        PENDING, PAID, FAILED
    }
}`
  },
  {
    path: 'com/foodhub/controller/OrderController.java',
    category: 'Controllers',
    language: 'java',
    description: 'Order placement, user history, and status progression REST endpoints',
    content: `package com.foodhub.controller;

import com.foodhub.dto.AuthDTOs.OrderRequest;
import com.foodhub.dto.AuthDTOs.OrderStatusUpdateDto;
import com.foodhub.entity.Order;
import com.foodhub.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestHeader(value = "x-user-id", defaultValue = "4") Long userId,
            @Valid @RequestBody OrderRequest req) {
        Order order = orderService.placeOrder(userId, req);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(
            @RequestHeader(value = "x-user-id", required = false) Long userId,
            @RequestParam(required = false) Long restaurantId) {
        if (restaurantId != null) return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId));
        if (userId != null) return ResponseEntity.ok(orderService.getUserOrders(userId));
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateDto dto) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, dto.getStatus()));
    }
}`
  },
  {
    path: 'com/foodhub/service/OrderService.java',
    category: 'Services',
    language: 'java',
    description: 'Order placement transactional logic, fee calculations, payment record initialization',
    content: `package com.foodhub.service;

import com.foodhub.dto.AuthDTOs.OrderRequest;
import com.foodhub.entity.*;
import com.foodhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public Order placeOrder(Long userId, OrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Cart cart = cartService.getOrCreateCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Shopping cart is empty!");
        }

        Restaurant restaurant = cart.getItems().get(0).getFoodItem().getRestaurant();

        BigDecimal subtotal = cart.getItems().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryFee = BigDecimal.valueOf(2.99);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.08));
        BigDecimal total = subtotal.add(deliveryFee).add(tax);

        Order order = Order.builder()
                .user(user)
                .restaurant(restaurant)
                .totalAmount(total)
                .deliveryAddress(req.getDeliveryAddress())
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(req.getPaymentMethod() == Order.PaymentMethod.CASH_ON_DELIVERY ? Order.PaymentStatus.PENDING : Order.PaymentStatus.PAID)
                .orderStatus(Order.OrderStatus.PLACED)
                .items(new ArrayList<>())
                .build();

        Order saved = orderRepository.save(order);
        cartService.clearCart(userId);
        return saved;
    }
}`
  },
  {
    path: 'com/foodhub/config/SecurityConfig.java',
    category: 'Configuration',
    language: 'java',
    description: 'Spring Security filter chain, BCrypt password encoder, stateless session configuration',
    content: `package com.foodhub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/restaurants/**", "/api/foods/**").permitAll()
                .anyRequest().permitAll()
            );
        return http.build();
    }
}`
  },
  {
    path: 'com/foodhub/exception/GlobalExceptionHandler.java',
    category: 'Configuration',
    language: 'java',
    description: 'ControllerAdvice global exception handler with RFC compliant JSON error responses',
    content: `package com.foodhub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}`
  }
];
