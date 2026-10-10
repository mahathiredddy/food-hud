-- Seed Data for FoodHub

-- 1. Users (Passwords hashed using BCrypt for 'Password123!', 'Admin123!', 'Owner123!')
-- $2a$10$7vU0... standard BCrypt hashes
INSERT INTO users (id, name, email, password, phone, address, role) VALUES
(1, 'System Admin', 'admin@foodhub.com', '$2a$10$w09Ocv29QJpL8.pW.F3J4.sCg3pY/QYhEsk44mH12sK2yv5g9Kzcq', '+1 555-0100', '100 FoodHub HQ, Silicon Valley, CA', 'ADMIN'),
(2, 'Marco Rossi', 'owner.goldenspoon@foodhub.com', '$2a$10$9q3jVn.7gN20x/z5Zf1B8.N/9l0v1V2c3B4n5M6q7w8E9r0t1Y2u3', '+1 555-0101', '42 Via Bella, Little Italy, NY', 'RESTAURANT_OWNER'),
(3, 'Aarav Sharma', 'owner.spiceroute@foodhub.com', '$2a$10$9q3jVn.7gN20x/z5Zf1B8.N/9l0v1V2c3B4n5M6q7w8E9r0t1Y2u3', '+1 555-0102', '88 Curry Mile, Jersey City, NJ', 'RESTAURANT_OWNER'),
(4, 'John Doe', 'john.doe@example.com', '$2a$10$G0Nq2nL83k9H8.9/7e6r5u4t3y2i1o0p9a8s7d6f5g4h3j2k1l0z9', '+1 555-0201', '742 Evergreen Terrace, Springfield, OR', 'CUSTOMER'),
(5, 'Emily Smith', 'emily.smith@example.com', '$2a$10$G0Nq2nL83k9H8.9/7e6r5u4t3y2i1o0p9a8s7d6f5g4h3j2k1l0z9', '+1 555-0202', '124 Conch Street, Pacific Grove, CA', 'CUSTOMER'),
(6, 'Michael Brown', 'michael.brown@example.com', '$2a$10$G0Nq2nL83k9H8.9/7e6r5u4t3y2i1o0p9a8s7d6f5g4h3j2k1l0z9', '+1 555-0203', '221B Baker Street, Boston, MA', 'CUSTOMER'),
(7, 'Sarah Connor', 'sarah.connor@example.com', '$2a$10$G0Nq2nL83k9H8.9/7e6r5u4t3y2i1o0p9a8s7d6f5g4h3j2k1l0z9', '+1 555-0204', '500 Skyline Blvd, Los Angeles, CA', 'CUSTOMER'),
(8, 'David Miller', 'david.miller@example.com', '$2a$10$G0Nq2nL83k9H8.9/7e6r5u4t3y2i1o0p9a8s7d6f5g4h3j2k1l0z9', '+1 555-0205', '350 5th Avenue, New York, NY', 'CUSTOMER')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Restaurants
INSERT INTO restaurants (id, name, description, address, phone, image_url, rating, delivery_time, cuisine, is_active, owner_id) VALUES
(1, 'The Golden Spoon', 'Authentic handmade Italian artisanal pizzas, fresh truffle pastas, and handcrafted desserts.', '42 Via Bella, Little Italy, New York, NY', '+1 212-555-0199', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', 4.8, '25-35 min', 'Italian & Woodfired Pizza', TRUE, 2),
(2, 'Spice Route Delights', 'Rich royal Hyderabadi biryanis, aromatic curries, clay-oven tandoori breads, and street-style chaats.', '88 Curry Mile, Jersey City, NJ', '+1 201-555-0142', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 4.9, '30-45 min', 'North & South Indian Specialities', TRUE, 3),
(3, 'Tokyo Ramen & Sushi Bar', 'Silky rich 18-hour tonkotsu broth, handcrafted ramen noodles, sashimi grade nigiri, and gyoza.', '15 Sakura Lane, Downtown, NY', '+1 212-555-0188', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', 4.7, '20-30 min', 'Japanese Ramen & Sushi', TRUE, NULL),
(4, 'Burger Craze & Shakes', 'Prime Angus smash patties, brioche buns, loaded seasoned waffle fries, and thick malt milkshakes.', '77 Broadway Blvd, Midtown, NY', '+1 212-555-0163', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80', 4.6, '15-25 min', 'American Burgers & Shakes', TRUE, NULL),
(5, 'Green Garden Bowl & Café', 'Fresh organic nutrient-dense superfood grain bowls, vibrant salads, cold pressed juices, and gluten-free wraps.', '102 Eco Way, Greenpoint, Brooklyn, NY', '+1 718-555-0174', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', 4.9, '20-35 min', 'Healthy Bowls & Vegan Salads', TRUE, NULL)
ON DUPLICATE KEY UPDATE id=id;

-- 3. Food Items
INSERT INTO food_items (id, restaurant_id, name, description, category, price, image_url, is_available, is_veg) VALUES
(1, 1, 'Margherita Burrata Pizza', 'San Marzano tomato sauce, creamy whole burrata, fresh basil, and extra virgin olive oil.', 'Pizzas', 18.50, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(2, 1, 'Truffle & Wild Mushroom Tagliatelle', 'Handmade fresh egg pasta tossed with black summer truffles and porcini mushrooms.', 'Pasta', 22.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(3, 1, 'Spicy Diavola Pepperoni Pizza', 'Crispy spicy calabrese salami, crushed tomatoes, fiore di latte mozzarella.', 'Pizzas', 19.50, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(4, 1, 'Slow-Cooked Beef Ragù Lasagna', 'Layered house-made pasta sheets, rich 6-hour Bolognese ragù, creamy béchamel.', 'Pasta', 20.00, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(5, 1, 'Crispy Calamari Fritti', 'Lightly cornstarch-dusted calamari rings, pickled cherry peppers, lemon garlic aioli.', 'Appetizers', 14.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(6, 1, 'Classic Venetian Tiramisù', 'Espresso-soaked Savoiardi ladyfingers, velvety mascarpone cream, dark cocoa.', 'Desserts', 9.50, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(7, 1, 'Italian Sparkling San Pellegrino', 'Chilled natural mineral water with blood orange or lemon.', 'Beverages', 4.00, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),

(8, 2, 'Hyderabadi Dum Chicken Biryani', 'Fragrant aged basmati rice cooked on slow steam with tender spiced bone-in chicken.', 'Biryani', 17.50, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(9, 2, 'Butter Chicken Masala', 'Charcoal-grilled tandoori chicken tikka simmered in silky tomato cashew makhani gravy.', 'Curries', 18.00, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(10, 2, 'Paneer Tikka Masala', 'Smoky grilled cottage cheese cubes in spiced onion-tomato curry with bell peppers.', 'Curries', 16.50, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(11, 2, 'Garlic Butter Naan (2 pcs)', 'Clay tandoor oven baked leavened flatbread brushed with crushed garlic butter.', 'Breads', 4.50, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(12, 2, 'Crispy Samosa Platter (4 pcs)', 'Golden spiced potato and green pea pastries served with tamarind and mint chutneys.', 'Appetizers', 7.50, 'https://images.unsplash.com/photo-1601050690187-897c45831626?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(13, 2, 'Gulab Jamun with Rabri', 'Warm milk solid dumplings soaked in cardamom rose syrup topped with rabri milk.', 'Desserts', 6.50, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(14, 2, 'Mango Lassi', 'Refreshing churned Greek yogurt beverage blended with sweet Alphonso mango pulp.', 'Beverages', 4.50, 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),

(15, 3, 'Signature Tonkotsu Black Garlic Ramen', 'Rich creamy pork bone broth, chashu pork belly, ajitsuke egg, black garlic oil.', 'Ramen', 17.50, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(16, 3, 'Spicy Miso Ramen', 'Hokkaido miso blend broth, spicy minced chicken, bamboo shoots, corn, nori.', 'Ramen', 16.50, 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(17, 3, 'Dragon Roll (8 pcs)', 'Crispy shrimp tempura, cucumber inside, layered with avocado, unagi eel sauce.', 'Sushi Rolls', 18.00, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(18, 3, 'Salmon & Tuna Nigiri Combo (6 pcs)', 'Chef selection of Atlantic salmon and yellowfin tuna over seasoned sushi rice.', 'Sushi Rolls', 19.50, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(19, 3, 'Pan-Fried Pork Gyoza (6 pcs)', 'Crisp bottom dumplings stuffed with seasoned pork, cabbage, and ponzu dip.', 'Appetizers', 8.50, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(20, 3, 'Steamed Edamame with Sea Salt', 'Fresh soybean pods tossed in flaked Maldon sea salt and togarashi chili.', 'Appetizers', 6.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(21, 3, 'Matcha Green Tea Mochi Ice Cream (3 pcs)', 'Sweet chewy Japanese rice cake filled with Kyoto matcha green tea ice cream.', 'Desserts', 7.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),

(22, 4, 'Double Truffle Smash Burger', 'Two crispy edged Angus beef patties, aged cheddar, onion jam, truffle aioli.', 'Burgers', 14.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(23, 4, 'Nashville Hot Crispy Chicken Burger', 'Fried chicken breast in spicy Cayenne glaze, dill pickles, comeback sauce.', 'Burgers', 13.50, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(24, 4, 'Beyond Smokehouse Veggie Burger', 'Plant-based patty, smoked Gouda, crispy onion rings, chipotle BBQ sauce.', 'Burgers', 14.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(25, 4, 'Loaded Bacon Cheese Fries', 'Crispy fries with warm cheddar sauce, bacon bits, scallions, jalapeños.', 'Sides', 8.50, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(26, 4, 'Crispy Onion Rings with Garlic Mayo', 'Beer-battered thick cut sweet onions fried until crunchy and golden.', 'Sides', 6.50, 'https://images.unsplash.com/photo-1639024471287-035186f555dd?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(27, 4, 'Nutella Brownie Thick Shake', 'Vanilla ice cream, fudge brownies, Italian Nutella, whipped cream.', 'Beverages', 7.50, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(28, 4, 'Salted Caramel Pretzel Shake', 'Creamy caramel syrup, sea salt flakes, crunchy pretzel bits.', 'Beverages', 7.50, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),

(29, 5, 'Rainbow Quinoa Power Bowl', 'Tri-color quinoa, roasted sweet potatoes, avocado, kale, lemon tahini dressing.', 'Bowls', 14.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(30, 5, 'Grilled Salmon Superfood Salad', 'Wild salmon over organic arugula, blueberries, goat cheese, balsamic glaze.', 'Salads', 18.00, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80', TRUE, FALSE),
(31, 5, 'Avocado Sourdough Toast with Egg', 'Artisan sourdough, mashed avocado, hemp seeds, poached eggs.', 'Toast & Wraps', 12.50, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(32, 5, 'Mediterranean Falafel Hummus Wrap', 'Crispy falafel, garlic hummus, tomatoes, pickled onions, tahini.', 'Toast & Wraps', 11.50, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(33, 5, 'Organic Açaí Berry Bliss Bowl', 'Frozen açaí puree, granola, banana, strawberries, chia seeds, raw honey.', 'Bowls', 12.00, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(34, 5, 'Detox Cold-Pressed Green Glow Juice', 'Fresh green apple, celery, cucumber, kale, ginger, and lime.', 'Beverages', 7.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(35, 5, 'Immunity Citrus Turmeric Booster', 'Valencia orange, carrot, fresh Hawaiian turmeric root, black pepper, lemon.', 'Beverages', 6.50, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80', TRUE, TRUE)
ON DUPLICATE KEY UPDATE id=id;
