package com.foodhub.service;

import com.foodhub.entity.Restaurant;
import com.foodhub.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<Restaurant> getAllActiveRestaurants(String cuisine, String search) {
        if (cuisine != null || search != null) {
            return restaurantRepository.searchRestaurants(cuisine, search);
        }
        return restaurantRepository.findByIsActiveTrue();
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with ID: " + id));
    }

    @Transactional
    public Restaurant createRestaurant(Restaurant restaurant) {
        if (restaurant.getRating() == null) restaurant.setRating(4.5);
        if (restaurant.getIsActive() == null) restaurant.setIsActive(true);
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant updateRestaurant(Long id, Restaurant updated) {
        Restaurant existing = getRestaurantById(id);
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        if (updated.getImageUrl() != null) existing.setImageUrl(updated.getImageUrl());
        if (updated.getCuisine() != null) existing.setCuisine(updated.getCuisine());
        if (updated.getDeliveryTime() != null) existing.setDeliveryTime(updated.getDeliveryTime());
        if (updated.getIsActive() != null) existing.setIsActive(updated.getIsActive());
        return restaurantRepository.save(existing);
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant existing = getRestaurantById(id);
        restaurantRepository.delete(existing);
    }
}
