package com.foodhub.repository;

import com.foodhub.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByIsActiveTrue();
    List<Restaurant> findByOwnerId(Long ownerId);

    @Query("SELECT r FROM Restaurant r WHERE (:cuisine IS NULL OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :cuisine, '%'))) " +
           "AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Restaurant> searchRestaurants(@Param("cuisine") String cuisine, @Param("search") String search);
}
