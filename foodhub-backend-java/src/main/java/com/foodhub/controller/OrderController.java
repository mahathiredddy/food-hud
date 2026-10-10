package com.foodhub.controller;

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
        if (restaurantId != null) {
            return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId));
        }
        if (userId != null) {
            return ResponseEntity.ok(orderService.getUserOrders(userId));
        }
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
}
