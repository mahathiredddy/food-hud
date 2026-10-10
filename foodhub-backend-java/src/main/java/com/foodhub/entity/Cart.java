package com.foodhub.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @JsonProperty("total")
    public BigDecimal getTotal() {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal subtotal = items.stream()
                .filter(i -> i.getPrice() != null && i.getQuantity() != null)
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryFee = BigDecimal.valueOf(2.99);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.08)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discount = subtotal.compareTo(BigDecimal.valueOf(40.0)) > 0 ? BigDecimal.valueOf(5.00) : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(deliveryFee).add(tax).subtract(discount);
        return total.compareTo(BigDecimal.ZERO) > 0 ? total : BigDecimal.ZERO;
    }

    @JsonProperty("itemCount")
    public Integer getItemCount() {
        if (items == null || items.isEmpty()) return 0;
        return items.stream()
                .filter(i -> i.getQuantity() != null)
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    @JsonProperty("restaurantId")
    public Long getRestaurantId() {
        if (items == null || items.isEmpty()) return null;
        CartItem first = items.get(0);
        return (first != null && first.getFoodItem() != null && first.getFoodItem().getRestaurant() != null)
                ? first.getFoodItem().getRestaurant().getId()
                : null;
    }

    @JsonProperty("restaurantName")
    public String getRestaurantName() {
        if (items == null || items.isEmpty()) return null;
        CartItem first = items.get(0);
        return (first != null && first.getFoodItem() != null && first.getFoodItem().getRestaurant() != null)
                ? first.getFoodItem().getRestaurant().getName()
                : null;
    }
}
