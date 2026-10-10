import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Percent,
  Sparkles,
  Info
} from 'lucide-react';
import { Cart } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onUpdateQuantity: (cartItemId: number, newQty: number) => void;
  onRemoveItem: (cartItemId: number) => void;
  onProceedToCheckout: () => void;
  onBrowseMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onBrowseMenu,
}) => {
  const [promoCode, setPromoCode] = useState('FOODHUB50');
  const [promoApplied, setPromoApplied] = useState(true);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;
  const subtotal = cart?.subtotal || 0;
  const freeDeliveryThreshold = 40;
  const neededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="position-fixed inset-0 z-50 overflow-hidden" style={{ zIndex: 1060 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="position-fixed inset-0 bg-dark opacity-50 transition-opacity animate-in fade-in"
      />

      <div className="position-fixed top-0 bottom-0 end-0 d-flex" style={{ maxWidth: '100%', width: '480px' }}>
        <div className="w-100 bg-white shadow-2xl d-flex flex-column animate-in slide-in-from-right">
          {/* Header */}
          <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between position-sticky top-0 z-10">
            <div className="d-flex align-items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5A1F] d-flex align-items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5 text-[#FF5A1F]" />
              </div>
              <div>
                <h2 className="fs-5 fw-black text-dark font-heading mb-0">Your Order Cart</h2>
                <p className="text-xs text-muted mb-0">
                  {items.length} {items.length === 1 ? 'dish' : 'dishes'} in cart
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn btn-sm btn-light rounded-circle p-2 text-secondary hover:text-dark"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Goal Bar */}
          {!isEmpty && (
            <div className="px-4 py-3 bg-orange-50/60 border-bottom border-orange-100 text-xs">
              <div className="d-flex justify-content-between align-items-center mb-1.5 fw-bold">
                <span className="text-[#FF5A1F] d-flex align-items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  {neededForFreeDelivery === 0 ? (
                    <span>🎉 Free delivery unlocked!</span>
                  ) : (
                    <span>Add ${neededForFreeDelivery.toFixed(2)} more for $5 discount!</span>
                  )}
                </span>
                <span className="text-muted text-[11px]">{freeDeliveryProgress}%</span>
              </div>
              <div className="progress" style={{ height: '6px', borderRadius: '4px' }}>
                <div
                  className="progress-bar bg-[#FF5A1F]"
                  role="progressbar"
                  style={{ width: `${freeDeliveryProgress}%` }}
                  aria-valuenow={freeDeliveryProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-grow-1 overflow-y-auto p-4 space-y-3">
            {isEmpty ? (
              <div className="h-100 d-flex flex-col align-items-center justify-content-center text-center p-4">
                <div className="w-24 h-24 rounded-circle bg-orange-50 text-[#FF5A1F] d-flex align-items-center justify-center mb-3 shadow-inner">
                  <ShoppingBag className="w-12 h-12 stroke-[1.2] text-[#FF5A1F]" />
                </div>
                <h3 className="fs-5 fw-black text-dark font-heading mb-1">Your Cart is Empty</h3>
                <p className="text-xs text-muted max-w-xs mb-4">
                  Satisfy your hunger! Explore top Italian pizzas, authentic biryanis, ramen bowls, and smash burgers.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onBrowseMenu();
                  }}
                  className="btn btn-primary px-4 py-2.5 rounded-pill text-xs fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="card border border-light-subtle rounded-4 p-3 shadow-xs hover:border-orange-200 transition bg-white"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.foodItem?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                        alt={item.foodItem?.name}
                        className="rounded-3 object-fit-cover flex-shrink-0"
                        style={{ width: '64px', height: '64px' }}
                      />

                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-1.5 mb-1">
                          <span
                            className={`d-inline-block rounded-circle ${
                              item.foodItem?.isVeg ? 'bg-success' : 'bg-danger'
                            }`}
                            style={{ width: '8px', height: '8px' }}
                            title={item.foodItem?.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          />
                          <h4 className="fs-6 fw-bold text-dark mb-0 text-truncate font-heading">
                            {item.foodItem?.name || 'Food item'}
                          </h4>
                        </div>
                        <p className="text-xs text-muted mb-2">
                          ${item.price.toFixed(2)} each
                        </p>

                        {/* Quantity Controls Stepper */}
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-inline-flex align-items-center bg-light border rounded-pill px-1 py-0.5 shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="btn btn-sm btn-link text-secondary hover:text-[#FF5A1F] p-0 px-1 text-decoration-none"
                              title="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs fw-black text-dark">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="btn btn-sm btn-link text-secondary hover:text-[#FF5A1F] p-0 px-1 text-decoration-none"
                              title="Increase"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="btn btn-sm btn-light rounded-circle p-1.5 text-muted hover:text-danger hover:bg-danger-subtle ms-auto"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-end ps-2">
                        <span className="fs-6 fw-black text-dark font-heading">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Pricing Summary Footer */}
          {!isEmpty && cart && (
            <div className="p-4 border-top bg-light/70">
              {/* Promo code badge */}
              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-white border border-warning-subtle mb-3 text-xs">
                <div className="d-flex align-items-center gap-2">
                  <Tag className="w-4 h-4 text-warning" />
                  <div>
                    <span className="fw-bold text-dark">Coupon FOODHUB50</span>
                    <span className="text-muted d-block text-[11px]">
                      {cart.discount > 0 ? '$5 Discount applied!' : 'Add more items to get $5 discount'}
                    </span>
                  </div>
                </div>
                {cart.discount > 0 ? (
                  <span className="badge bg-success text-white rounded-pill px-2 py-1 font-bold">
                    SAVED $5.00
                  </span>
                ) : (
                  <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1">
                    APPLIES &gt; $40
                  </span>
                )}
              </div>

              {/* Bill Details */}
              <div className="d-flex flex-column gap-1.5 text-xs text-muted mb-3">
                <div className="d-flex justify-content-between">
                  <span>Item Subtotal</span>
                  <span className="fw-bold text-dark">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery Partner Fee</span>
                  <span className="fw-bold text-dark">${cart.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Estimated Taxes & Platform Charges (8%)</span>
                  <span className="fw-bold text-dark">${cart.tax.toFixed(2)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="d-flex justify-content-between text-success fw-bold">
                    <span>Discount Savings</span>
                    <span>-${cart.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="dropdown-divider my-1"></div>
                <div className="d-flex justify-content-between fs-5 fw-black text-dark font-heading pt-1">
                  <span>To Pay</span>
                  <span className="text-[#FF5A1F]">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-100 btn btn-primary py-3 rounded-4 fs-6 fw-bold shadow-md d-flex align-items-center justify-content-center gap-2 text-white"
              >
                <span>Proceed to Checkout</span>
                <span className="badge bg-white text-[#FF5A1F] rounded-pill px-2 py-1 fw-black">
                  ${cart.total.toFixed(2)}
                </span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="d-flex align-items-center justify-content-center gap-1.5 text-[11px] text-muted pt-2 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>Simulated Safe Checkout with COD, Card & UPI</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
