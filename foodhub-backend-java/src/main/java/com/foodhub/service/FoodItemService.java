package com.foodhub.service;

import com.foodhub.entity.FoodItem;
import com.foodhub.entity.Restaurant;
import com.foodhub.repository.FoodItemRepository;
import com.foodhub.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    public List<FoodItem> getFoods(Long restaurantId, String category, String search) {
        if (restaurantId != null || category != null || search != null) {
            return foodItemRepository.searchFoodItems(restaurantId, category, search);
        }
        return foodItemRepository.findAll();
    }

    public List<FoodItem> getMenuByRestaurant(Long restaurantId, String category) {
        if (category != null && !category.equalsIgnoreCase("All")) {
            return foodItemRepository.findByRestaurantIdAndCategory(restaurantId, category);
        }
        return foodItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
    }

    public FoodItem getFoodById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found with ID: " + id));
    }

    @Transactional
    public FoodItem createFoodItem(Long restaurantId, FoodItem item) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with ID: " + restaurantId));
        item.setRestaurant(restaurant);
        if (item.getIsAvailable() == null) item.setIsAvailable(true);
        if (item.getIsVeg() == null) item.setIsVeg(false);
        return foodItemRepository.save(item);
    }

    @Transactional
    public FoodItem updateFoodItem(Long id, FoodItem updated) {
        FoodItem existing = getFoodById(id);
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getPrice() != null) existing.setPrice(updated.getPrice());
        if (updated.getImageUrl() != null) existing.setImageUrl(updated.getImageUrl());
        if (updated.getIsAvailable() != null) existing.setIsAvailable(updated.getIsAvailable());
        if (updated.getIsVeg() != null) existing.setIsVeg(updated.getIsVeg());
        return foodItemRepository.save(existing);
    }

    @Transactional
    public void deleteFoodItem(Long id) {
        FoodItem existing = getFoodById(id);
        foodItemRepository.delete(existing);
    }
}
