package com.foodhub.service;

import com.foodhub.dto.AuthDTOs.OrderRequest;
import com.foodhub.entity.*;
import com.foodhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public Order placeOrder(Long userId, OrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Cart cart = cartService.getOrCreateCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Shopping cart is empty! Cannot place order.");
        }

        // Validate item availability
        for (CartItem ci : cart.getItems()) {
            if (Boolean.FALSE.equals(ci.getFoodItem().getIsAvailable())) {
                throw new RuntimeException("Item '" + ci.getFoodItem().getName() + "' is currently out of stock. Please remove it from your cart.");
            }
        }

        Restaurant restaurant = null;
        if (req.getRestaurantId() != null) {
            restaurant = restaurantRepository.findById(req.getRestaurantId()).orElse(null);
        }
        if (restaurant == null) {
            restaurant = cart.getItems().get(0).getFoodItem().getRestaurant();
        }

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

        Order savedOrder = orderRepository.save(order);

        for (CartItem ci : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .foodItem(ci.getFoodItem())
                    .quantity(ci.getQuantity())
                    .price(ci.getPrice())
                    .build();
            savedOrder.getItems().add(orderItem);
        }

        // Create Payment record
        String txnPrefix = req.getPaymentMethod() == Order.PaymentMethod.CARD ? "TXN_CARD_" :
                           req.getPaymentMethod() == Order.PaymentMethod.UPI ? "TXN_UPI_" : "TXN_COD_";
        String txnId = txnPrefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .order(savedOrder)
                .amount(total)
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(savedOrder.getPaymentStatus())
                .transactionId(txnId)
                .build();

        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // Clear user cart
        cartService.clearCart(userId);

        return savedOrder;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getRestaurantOrders(Long restaurantId) {
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = getOrderById(orderId);
        order.setOrderStatus(newStatus);

        if (newStatus == Order.OrderStatus.DELIVERED && order.getPaymentMethod() == Order.PaymentMethod.CASH_ON_DELIVERY) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            if (order.getPayment() != null) {
                order.getPayment().setPaymentStatus(Order.PaymentStatus.PAID);
            }
        }

        if (newStatus == Order.OrderStatus.CANCELLED) {
            if (order.getPayment() != null) {
                order.getPayment().setPaymentStatus(Order.PaymentStatus.FAILED);
            }
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
        }

        return orderRepository.save(order);
    }
}
