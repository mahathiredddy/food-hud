package com.foodhub.service;

import com.foodhub.entity.Cart;
import com.foodhub.entity.CartItem;
import com.foodhub.entity.FoodItem;
import com.foodhub.entity.User;
import com.foodhub.repository.CartItemRepository;
import com.foodhub.repository.CartRepository;
import com.foodhub.repository.FoodItemRepository;
import com.foodhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });
    }

    @Transactional
    public Cart addToCart(Long userId, Long foodItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new RuntimeException("Food item not found with ID: " + foodItemId));

        // If items are from different restaurant, clear cart
        if (!cart.getItems().isEmpty()) {
            Long existingRestId = cart.getItems().get(0).getFoodItem().getRestaurant().getId();
            if (!existingRestId.equals(foodItem.getRestaurant().getId())) {
                cart.getItems().clear();
                cartItemRepository.deleteByCartId(cart.getId());
            }
        }

        CartItem existingItem = cart.getItems().stream()
                .filter(ci -> ci.getFoodItem().getId().equals(foodItemId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(quantity)
                    .price(foodItem.getPrice())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return cart;
    }

    @Transactional
    public Cart updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with ID: " + cartItemId));

        if (quantity <= 0) {
            Cart cart = cartItem.getCart();
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
            return cart;
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return cartItem.getCart();
    }

    @Transactional
    public Cart removeCartItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with ID: " + cartItemId));
        Cart cart = cartItem.getCart();
        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        return cart;
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
    }
}
