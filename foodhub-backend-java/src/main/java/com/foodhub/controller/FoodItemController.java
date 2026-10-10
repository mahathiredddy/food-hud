package com.foodhub.controller;

import com.foodhub.entity.FoodItem;
import com.foodhub.service.FoodItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodItemController {

    private final FoodItemService foodItemService;

    @GetMapping
    public ResponseEntity<List<FoodItem>> getFoods(
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(foodItemService.getFoods(restaurantId, category, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodById(id));
    }

    @PostMapping
    public ResponseEntity<FoodItem> createFood(
            @RequestParam(required = false) Long restaurantId,
            @RequestBody FoodItem foodItem) {
        Long targetRestId = restaurantId != null ? restaurantId : foodItem.getRestaurantId();
        if (targetRestId == null) {
            throw new RuntimeException("Restaurant ID is required to create a food item");
        }
        return new ResponseEntity<>(foodItemService.createFoodItem(targetRestId, foodItem), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateFood(@PathVariable Long id, @RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, foodItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFood(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok(Map.of("message", "Food item deleted successfully"));
    }
}
