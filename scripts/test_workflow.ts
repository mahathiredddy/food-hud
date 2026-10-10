// Automated test script for FoodHub full-stack debugging and workflow verification
import { db } from '../server/db.ts';

async function runTests() {
  console.log('=====================================================');
  console.log(' STARTING FOODHUB WORKFLOW & DEBUGGING TESTS');
  console.log('=====================================================');

  const BASE_URL = 'http://localhost:3000/api';
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failedCount++;
    }
  }

  try {
    // 1. Invalid Login Handling
    console.log('\n--- 1. Testing Invalid Login Handling ---');
    const invRes1 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrong' }),
    });
    assert(invRes1.status === 401, 'Non-existent user login rejected with 401');

    const invRes2 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john.doe@example.com', password: 'WrongPassword!' }),
    });
    assert(invRes2.status === 401, 'Incorrect password login rejected with 401');

    const invRes3 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' }),
    });
    assert(invRes3.status === 400, 'Missing password rejected with 400');

    // 2. Duplicate Registration Handling
    console.log('\n--- 2. Testing Duplicate Registration Handling ---');
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Clone',
        email: 'john.doe@example.com',
        password: 'Password123!',
      }),
    });
    assert(dupRes.status === 400, 'Duplicate email registration rejected with 400');

    // 3. Register New Customer
    console.log('\n--- 3. Testing New Customer Registration ---');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Wonder',
        email: testEmail,
        password: 'SecurePass123!',
        phone: '+1 555-8888',
        address: '123 Wonderland Ave',
        role: 'CUSTOMER',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'New customer successfully registered with 201');
    assert(!!regData.token, 'Registration returns auth token');
    assert(!regData.user.passwordHash, 'Password hash is NOT exposed in response');
    const customerToken = regData.token;
    const customerId = regData.user.id;

    // 4. Login with newly registered customer
    console.log('\n--- 4. Testing Login with New Customer ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePass123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'New customer logged in successfully with 200');
    assert(loginData.user.email === testEmail, 'Logged in user email matches');

    // 5. Browse Restaurants
    console.log('\n--- 5. Testing Browse Restaurants ---');
    const restRes = await fetch(`${BASE_URL}/restaurants`);
    const restaurants = await restRes.json();
    assert(restRes.status === 200 && Array.isArray(restaurants) && restaurants.length > 0, 'Fetched active restaurants list');

    // 6. View Menu
    console.log('\n--- 6. Testing View Menu ---');
    const menuRes = await fetch(`${BASE_URL}/restaurants/1/menu`);
    const menuItems = await menuRes.json();
    assert(menuRes.status === 200 && Array.isArray(menuItems) && menuItems.length > 0, 'Fetched restaurant menu items');

    // 7. Test Invalid Quantity Rejection
    console.log('\n--- 7. Testing Invalid Quantity and Unavailable Food Items ---');
    const invQtyRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
      body: JSON.stringify({ foodItemId: menuItems[0].id, quantity: 0 }),
    });
    assert(invQtyRes.status === 400, 'Adding item with quantity <= 0 rejected with 400');

    // 8. Test Unavailable Food Item Rejection
    // Temporarily mark dish unavailable on server via Admin API
    const targetFood = menuItems[0];
    await fetch(`${BASE_URL}/foods/${targetFood.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: false }),
    });

    const unavailRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
      body: JSON.stringify({ foodItemId: targetFood.id, quantity: 1 }),
    });
    assert(unavailRes.status === 400, 'Adding unavailable food item rejected with 400');

    // Restore item availability on server
    await fetch(`${BASE_URL}/foods/${targetFood.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: true }),
    });

    // 9. Test Empty Cart Checkout Rejection
    console.log('\n--- 8. Testing Empty Cart Checkout Rejection ---');
    const emptyOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
      body: JSON.stringify({
        restaurantId: 1,
        deliveryAddress: '123 Wonderland Ave',
        paymentMethod: 'CASH_ON_DELIVERY',
      }),
    });
    assert(emptyOrderRes.status === 400, 'Placing order with empty cart rejected with 400');

    // 10. Add Items to Cart and Verify Calculation
    console.log('\n--- 9. Testing Add Items to Cart & Calculations ---');
    const addCartRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
      body: JSON.stringify({ foodItemId: targetFood.id, quantity: 2 }),
    });
    const cartData = await addCartRes.json();
    assert(addCartRes.status === 201, 'Successfully added 2 items to cart');
    assert(cartData.items.length === 1, 'Cart contains 1 item entry');
    assert(cartData.itemCount === 2, 'Cart item count is 2');
    const expectedSubtotal = targetFood.price * 2;
    assert(Math.abs(cartData.subtotal - expectedSubtotal) < 0.01, 'Cart subtotal matches exact item price * qty');
    assert(cartData.deliveryFee === 2.99, 'Cart delivery fee is $2.99');
    assert(cartData.total > cartData.subtotal, 'Cart total includes fees & taxes');

    // 11. Checkout & Place Order
    console.log('\n--- 10. Testing Checkout & Place Order ---');
    const placeOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
      body: JSON.stringify({
        restaurantId: 1,
        deliveryAddress: '123 Wonderland Ave',
        paymentMethod: 'CASH_ON_DELIVERY',
      }),
    });
    const placeOrderData = await placeOrderRes.json();
    assert(placeOrderRes.status === 201, 'Order placed successfully with 201');
    const order = placeOrderData.order;
    const payment = placeOrderData.payment;
    assert(order.orderStatus === 'PLACED', 'Initial order status is PLACED');
    assert(order.paymentStatus === 'PENDING', 'Initial COD payment status is PENDING');
    assert(payment.paymentStatus === 'PENDING', 'Payment record status is PENDING');
    assert(order.totalAmount > 0, 'Order total amount is recorded accurately');

    // Verify user cart was cleared
    const postCartRes = await fetch(`${BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
    });
    const postCart = await postCartRes.json();
    assert(postCart.items.length === 0, 'Customer cart cleared after placing order');

    // 12. View Order by Authorized Customer
    console.log('\n--- 11. Testing View Order by Authorized Customer ---');
    const viewOrderRes = await fetch(`${BASE_URL}/orders/${order.id}`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
    });
    const viewedOrder = await viewOrderRes.json();
    assert(viewOrderRes.status === 200, 'Customer can view their own order');
    assert(viewedOrder.id === order.id, 'Viewed order ID matches');

    // 13. Unauthorized Order Access Protection
    console.log('\n--- 12. Testing Unauthorized Order Access Protection ---');
    // Customer with user ID 5 attempting to access customer's order
    const unauthOrderRes = await fetch(`${BASE_URL}/orders/${order.id}`, {
      headers: {
        'x-user-id': '5',
      },
    });
    assert(unauthOrderRes.status === 403, 'Unauthorized customer access blocked with 403 Forbidden');

    // 14. Invalid Order ID Handling
    console.log('\n--- 13. Testing Invalid Order ID Handling ---');
    const invOrderRes = await fetch(`${BASE_URL}/orders/999999`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
    });
    assert(invOrderRes.status === 404, 'Non-existent order ID returns 404 Not Found');

    // 15. Customer Attempting Status Update Rejection
    console.log('\n--- 14. Testing Customer Cannot Update Order Status ---');
    const custUpdateRes = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    assert(custUpdateRes.status === 403, 'Customer status update attempt blocked with 403 Forbidden');

    // 16. Admin Updates Order Status (Lifecycle Transitions)
    console.log('\n--- 15. Testing Admin Order Status Transitions ---');
    // Admin login token or headers
    const adminHeaders = {
      'Content-Type': 'application/json',
      'x-user-id': '1', // Admin ID
    };

    // Transition 1: PLACED -> CONFIRMED
    const tr1 = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    const orderConf = await tr1.json();
    assert(tr1.status === 200 && orderConf.orderStatus === 'CONFIRMED', 'Admin advanced status to CONFIRMED');

    // Transition 2: CONFIRMED -> PREPARING
    const tr2 = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'PREPARING' }),
    });
    const orderPrep = await tr2.json();
    assert(tr2.status === 200 && orderPrep.orderStatus === 'PREPARING', 'Admin advanced status to PREPARING');

    // Transition 3: PREPARING -> OUT_FOR_DELIVERY
    const tr3 = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
    });
    const orderOut = await tr3.json();
    assert(tr3.status === 200 && orderOut.orderStatus === 'OUT_FOR_DELIVERY', 'Admin advanced status to OUT_FOR_DELIVERY');

    // Transition 4: OUT_FOR_DELIVERY -> DELIVERED
    const tr4 = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    const orderDeliv = await tr4.json();
    assert(tr4.status === 200 && orderDeliv.orderStatus === 'DELIVERED', 'Admin advanced status to DELIVERED');
    assert(orderDeliv.paymentStatus === 'PAID', 'COD Payment status automatically synchronized to PAID upon delivery');

    // Transition 5: Attempting invalid transition on DELIVERED order
    const invTr = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'PREPARING' }),
    });
    assert(invTr.status === 400, 'Transition on terminal DELIVERED status rejected with 400');

    // 17. Customer Sees Updated Status
    console.log('\n--- 16. Testing Customer Sees Updated Status ---');
    const custPollRes = await fetch(`${BASE_URL}/orders/${order.id}`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'x-user-id': String(customerId),
      },
    });
    const finalCustomerOrder = await custPollRes.json();
    assert(finalCustomerOrder.orderStatus === 'DELIVERED', 'Customer retrieved verified DELIVERED status from backend');
    assert(finalCustomerOrder.paymentStatus === 'PAID', 'Customer sees PAID payment status');

    // 18. Customer Deactivation and Login Block
    console.log('\n--- 17. Testing Customer Deactivation & Security ---');
    const deactRes = await fetch(`${BASE_URL}/users/${customerId}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ isActive: false }),
    });
    const deactUser = await deactRes.json();
    assert(deactRes.status === 200 && deactUser.isActive === false, 'Admin deactivated customer account');

    const blockedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePass123!',
      }),
    });
    assert(blockedLoginRes.status === 403, 'Deactivated customer login blocked with 403 Forbidden');

    console.log('\n=====================================================');
    console.log(` ALL TESTS COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('=====================================================');

  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  }
}

runTests();
