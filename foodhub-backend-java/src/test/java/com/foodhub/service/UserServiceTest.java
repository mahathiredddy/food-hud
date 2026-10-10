package com.foodhub.service;

import com.foodhub.dto.AuthDTOs.RegisterRequest;
import com.foodhub.entity.Cart;
import com.foodhub.entity.User;
import com.foodhub.repository.CartRepository;
import com.foodhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .name("Alex Johnson")
                .email("alex@example.com")
                .password("SecretPass123!")
                .phone("+1 555-0300")
                .address("123 Maple Street")
                .role(User.Role.CUSTOMER)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user and initialize a cart")
    void testRegisterUser_Success() {
        when(userRepository.existsByEmail("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedHash");

        User savedUser = User.builder()
                .id(10L)
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password("$2a$10$encodedHash")
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(cartRepository.save(any(Cart.class))).thenReturn(Cart.builder().id(1L).user(savedUser).build());

        User result = userService.registerUser(registerRequest);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("alex@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with already existing email")
    void testRegisterUser_DuplicateEmail() {
        when(userRepository.existsByEmail("alex@example.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.registerUser(registerRequest);
        });

        assertEquals("Email is already registered!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    @DisplayName("Should retrieve existing user by ID")
    void testFindById_Found() {
        User user = User.builder().id(1L).email("admin@foodhub.com").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.findById(1L);
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("Should throw exception when user ID is not found")
    void testFindById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.findById(999L));
    }
}
