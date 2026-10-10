package com.foodhub.service;

import com.foodhub.dto.AuthDTOs.PaymentRequest;
import com.foodhub.entity.Order;
import com.foodhub.entity.Payment;
import com.foodhub.repository.OrderRepository;
import com.foodhub.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Payment processPayment(PaymentRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + req.getOrderId()));

        String txnPrefix = req.getPaymentMethod() == Order.PaymentMethod.CARD ? "TXN_CARD_" :
                           req.getPaymentMethod() == Order.PaymentMethod.UPI ? "TXN_UPI_" : "TXN_COD_";
        String txnId = txnPrefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .order(order)
                .amount(req.getAmount())
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(req.getPaymentMethod() == Order.PaymentMethod.CASH_ON_DELIVERY ? Order.PaymentStatus.PENDING : Order.PaymentStatus.PAID)
                .transactionId(txnId)
                .build();

        Payment saved = paymentRepository.save(payment);
        order.setPaymentStatus(saved.getPaymentStatus());
        orderRepository.save(order);

        return saved;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order ID: " + orderId));
    }
}
