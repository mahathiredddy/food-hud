package com.foodhub.service;

import com.foodhub.dto.AuthDTOs.OrderRequest;
import com.foodhub.entity.*;
import com.foodhub.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartService cartService;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Restaurant testRestaurant;
    private FoodItem testFoodItem;
    private Cart testCart;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(4L).name("John Doe").email("john@example.com").build();
        testRestaurant = Restaurant.builder().id(1L).name("The Golden Spoon").build();
        testFoodItem = FoodItem.builder()
                .id(1L)
                .name("Margherita Pizza")
                .price(BigDecimal.valueOf(18.50))
                .restaurant(testRestaurant)
                .isAvailable(true)
                .build();

        CartItem cartItem = CartItem.builder()
                .id(1L)
                .foodItem(testFoodItem)
                .quantity(2)
                .price(testFoodItem.getPrice())
                .build();

        testCart = Cart.builder()
                .id(1L)
                .user(testUser)
                .items(new ArrayList<>(List.of(cartItem)))
                .build();
    }

    @Test
    @DisplayName("Should successfully place an order and empty the user cart")
    void testPlaceOrder_Success() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(testUser));
        when(cartService.getOrCreateCart(4L)).thenReturn(testCart);
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(testRestaurant));

        Order savedMock = Order.builder()
                .id(101L)
                .user(testUser)
                .restaurant(testRestaurant)
                .totalAmount(BigDecimal.valueOf(42.97))
                .orderStatus(Order.OrderStatus.PLACED)
                .paymentMethod(Order.PaymentMethod.CASH_ON_DELIVERY)
                .items(new ArrayList<>())
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(savedMock);

        OrderRequest request = OrderRequest.builder()
                .restaurantId(1L)
                .deliveryAddress("742 Evergreen Terrace")
                .paymentMethod(Order.PaymentMethod.CASH_ON_DELIVERY)
                .build();

        Order result = orderService.placeOrder(4L, request);

        assertNotNull(result);
        assertEquals(101L, result.getId());
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(paymentRepository, times(1)).save(any(Payment.class));
        verify(cartService, times(1)).clearCart(4L);
    }

    @Test
    @DisplayName("Should reject order placement when cart is empty")
    void testPlaceOrder_EmptyCart() {
        testCart.getItems().clear();
        when(userRepository.findById(4L)).thenReturn(Optional.of(testUser));
        when(cartService.getOrCreateCart(4L)).thenReturn(testCart);

        OrderRequest request = OrderRequest.builder()
                .restaurantId(1L)
                .deliveryAddress("742 Evergreen Terrace")
                .paymentMethod(Order.PaymentMethod.CASH_ON_DELIVERY)
                .build();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.placeOrder(4L, request));
        assertTrue(ex.getMessage().contains("Shopping cart is empty"));
    }

    @Test
    @DisplayName("Should reject order placement when cart contains unavailable food item")
    void testPlaceOrder_UnavailableItem() {
        testFoodItem.setIsAvailable(false);
        when(userRepository.findById(4L)).thenReturn(Optional.of(testUser));
        when(cartService.getOrCreateCart(4L)).thenReturn(testCart);

        OrderRequest request = OrderRequest.builder()
                .restaurantId(1L)
                .deliveryAddress("742 Evergreen Terrace")
                .paymentMethod(Order.PaymentMethod.CASH_ON_DELIVERY)
                .build();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.placeOrder(4L, request));
        assertTrue(ex.getMessage().contains("out of stock"));
    }

    @Test
    @DisplayName("Should correctly update order status to DELIVERED and update COD payment status to PAID")
    void testUpdateOrderStatus_Delivered_COD() {
        Payment payment = Payment.builder()
                .id(1L)
                .paymentMethod(Order.PaymentMethod.CASH_ON_DELIVERY)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();

        Order order = Order.builder()
                .id(50L)
                .orderStatus(Order.OrderStatus.OUT_FOR_DELIVERY)
                .paymentMethod(Order.PaymentMethod.CASH_ON_DELIVERY)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .payment(payment)
                .build();

        when(orderRepository.findById(50L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        Order updated = orderService.updateOrderStatus(50L, Order.OrderStatus.DELIVERED);

        assertEquals(Order.OrderStatus.DELIVERED, updated.getOrderStatus());
        assertEquals(Order.PaymentStatus.PAID, updated.getPaymentStatus());
        assertEquals(Order.PaymentStatus.PAID, updated.getPayment().getPaymentStatus());
    }
}
