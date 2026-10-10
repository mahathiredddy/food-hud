package com.foodhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FoodHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodHubApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" FoodHub Online Food Ordering System Started!   ");
        System.out.println(" REST API Base URL: http://localhost:8080/api    ");
        System.out.println("=================================================");
    }
}
