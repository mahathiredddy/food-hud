package com.foodhub.controller;

import com.foodhub.dto.AuthDTOs.*;
import com.foodhub.entity.User;
import com.foodhub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.registerUser(req);
        String token = "fht_" + Base64.getEncoder().encodeToString(
                ("{\"userId\":" + user.getId() + ",\"email\":\"" + user.getEmail() + "\"}").getBytes()
        );

        AuthResponse resp = AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .address(user.getAddress())
                .phone(user.getPhone())
                .build();

        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        User user = userService.findByEmail(req.getEmail());
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new RuntimeException("Your account is deactivated. Please contact support.");
        }

        String token = "fht_" + Base64.getEncoder().encodeToString(
                ("{\"userId\":" + user.getId() + ",\"email\":\"" + user.getEmail() + "\"}").getBytes()
        );

        AuthResponse resp = AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .address(user.getAddress())
                .phone(user.getPhone())
                .build();

        return ResponseEntity.ok(resp);
    }
}
