package com.foodhub.controller;

import com.foodhub.dto.AuthDTOs.CartItemQuantityRequest;
import com.foodhub.dto.AuthDTOs.CartItemRequest;
import com.foodhub.entity.Cart;
import com.foodhub.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader(value = "x-user-id", defaultValue = "4") Long userId) {
        return ResponseEntity.ok(cartService.getOrCreateCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addToCart(
            @RequestHeader(value = "x-user-id", defaultValue = "4") Long userId,
            @Valid @RequestBody CartItemRequest req) {
        Cart cart = cartService.addToCart(userId, req.getFoodItemId(), req.getQuantity());
        return new ResponseEntity<>(cart, HttpStatus.CREATED);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Cart> updateCartItem(
            @RequestHeader(value = "x-user-id", defaultValue = "4") Long userId,
            @PathVariable Long id,
            @RequestBody(required = false) CartItemQuantityRequest body,
            @RequestParam(required = false) Integer quantity) {
        Integer targetQty = (body != null && body.getQuantity() != null) ? body.getQuantity() : quantity;
        if (targetQty == null) {
            targetQty = 1;
        }
        return ResponseEntity.ok(cartService.updateCartItemQuantity(userId, id, targetQty));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Cart> removeCartItem(
            @RequestHeader(value = "x-user-id", defaultValue = "4") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(cartService.removeCartItem(userId, id));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestHeader(value = "x-user-id", defaultValue = "4") Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
