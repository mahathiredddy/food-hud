package com.foodhub.controller;

import com.foodhub.dto.AuthDTOs.UserStatusUpdateRequest;
import com.foodhub.entity.User;
import com.foodhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader(value = "x-user-id", defaultValue = "4") Long userId) {
        return ResponseEntity.ok(userService.findById(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @RequestHeader(value = "x-user-id", defaultValue = "4") Long userId,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        String phone = body.get("phone");
        String address = body.get("address");
        String password = body.get("password");
        return ResponseEntity.ok(userService.updateProfile(userId, name, phone, address, password));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long id,
            @RequestBody(required = false) UserStatusUpdateRequest req) {
        Boolean targetStatus = (req != null && req.getIsActive() != null) ? req.getIsActive() : null;
        return ResponseEntity.ok(userService.updateUserStatus(id, targetStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
