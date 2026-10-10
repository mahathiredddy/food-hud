package com.foodhub.repository;

import com.foodhub.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByRestaurantId(Long restaurantId);
    List<FoodItem> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);
    List<FoodItem> findByRestaurantIdAndCategory(Long restaurantId, String category);

    @Query("SELECT f FROM FoodItem f WHERE (:restaurantId IS NULL OR f.restaurant.id = :restaurantId) " +
           "AND (:category IS NULL OR LOWER(f.category) = LOWER(:category)) " +
           "AND (:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<FoodItem> searchFoodItems(@Param("restaurantId") Long restaurantId,
                                   @Param("category") String category,
                                   @Param("search") String search);
}
