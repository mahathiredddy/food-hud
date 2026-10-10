package com.foodhub.service;

import com.foodhub.dto.AuthDTOs.*;
import com.foodhub.entity.Cart;
import com.foodhub.entity.User;
import com.foodhub.repository.CartRepository;
import com.foodhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .address(req.getAddress())
                .role(req.getRole() != null ? req.getRole() : User.Role.CUSTOMER)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);

        // Auto-initialize shopping cart for user
        Cart cart = Cart.builder().user(saved).build();
        cartRepository.save(cart);

        return saved;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateProfile(Long id, String name, String phone, String address, String newPassword) {
        User user = findById(id);
        if (name != null) user.setName(name);
        if (phone != null) user.setPhone(phone);
        if (address != null) user.setAddress(address);
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserStatus(Long id, Boolean isActive) {
        User user = findById(id);
        if (isActive != null) {
            user.setIsActive(isActive);
        } else {
            user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);
        userRepository.delete(user);
    }
}
