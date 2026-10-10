package com.foodhub.controller;

import com.foodhub.entity.FoodItem;
import com.foodhub.entity.Restaurant;
import com.foodhub.service.FoodItemService;
import com.foodhub.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final FoodItemService foodItemService;

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants(
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(restaurantService.getAllActiveRestaurants(cuisine, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @PostMapping
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        return new ResponseEntity<>(restaurantService.createRestaurant(restaurant), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, restaurant));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.ok(Map.of("message", "Restaurant deleted successfully"));
    }

    @GetMapping("/{id}/menu")
    public ResponseEntity<List<FoodItem>> getRestaurantMenu(
            @PathVariable Long id,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(foodItemService.getMenuByRestaurant(id, category));
    }
}
