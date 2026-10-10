import React from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  Eye,
  Store,
  Sparkles,
  Receipt,
  X,
  Share2
} from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onTrackOrder: (order: Order) => void;
  onViewOrderHistory: () => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onTrackOrder,
  onViewOrderHistory,
  onContinueShopping,
}) => {
  if (!isOpen || !order) return null;

  const isCOD = order.paymentMethod === 'CASH_ON_DELIVERY';

  return (
    <div
      className="position-fixed inset-0 z-50 overflow-y-auto d-flex align-items-center justify-content-center p-2 p-md-4"
      style={{ zIndex: 1065 }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="position-fixed inset-0 bg-dark opacity-60 backdrop-blur-xs animate-in fade-in"
      />

      {/* Confirmation Card */}
      <div
        className="position-relative w-100 bg-white rounded-4 shadow-2xl overflow-hidden my-3 animate-in zoom-in-95"
        style={{ maxWidth: '640px', zIndex: 1 }}
      >
        {/* Header celebration banner */}
        <div className="bg-gradient-to-r from-orange-500 via-[#FF5A1F] to-[#FF8A00] p-4 text-white text-center position-relative">
          <button
            onClick={onClose}
            className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 p-1.5 bg-white/20 hover:bg-white/40 text-white border-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="w-16 h-16 rounded-circle bg-white text-success d-flex align-items-center justify-center mx-auto mb-2 shadow-lg animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-success fill-success/15" />
          </div>

          <span className="badge bg-white/20 text-white rounded-pill px-3 py-1 text-xs fw-bold text-uppercase mb-1">
            Order Placed Successfully
          </span>

          <h2 className="fs-3 fw-black text-white font-heading mb-0">
            Thank You for Your Order!
          </h2>
          <p className="text-light opacity-90 text-xs mb-0 mt-1">
            Order <span className="fw-bold">#{order.id}</span> has been transmitted to the kitchen.
          </p>
        </div>

        <div className="p-4 p-md-5 space-y-4">
          {/* Restaurant & ETA Highlight */}
          <div className="card rounded-4 border border-warning-subtle bg-orange-50/70 p-3 shadow-xs">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="w-12 h-12 rounded-3 bg-[#FF5A1F] text-white d-flex align-items-center justify-center shadow-xs">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="fs-6 fw-bold text-dark font-heading mb-0">
                    {order.restaurantName || 'FoodHub Restaurant'}
                  </h4>
                  <p className="text-muted text-xs mb-0">
                    Kitchen is currently preparing your meal
                  </p>
                </div>
              </div>

              <div className="text-end">
                <span className="text-[11px] fw-bold text-muted text-uppercase d-block">
                  Estimated Delivery
                </span>
                <span className="badge bg-[#FF5A1F] text-white rounded-pill px-2.5 py-1 text-xs fw-black d-inline-flex align-items-center gap-1 shadow-2xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>25 - 35 Mins</span>
                </span>
              </div>
            </div>
          </div>

          {/* Complete Itemized Order Summary */}
          <div className="card rounded-4 border p-3.5 bg-white shadow-2xs">
            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-2">
              <span className="text-xs fw-black text-dark text-uppercase tracking-wider d-flex align-items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#FF5A1F]" />
                <span>Order Summary ({order.items.length} items)</span>
              </span>
              <span className="badge bg-light text-secondary border rounded-pill text-[10px] font-bold">
                Order #{order.id}
              </span>
            </div>

            <div className="space-y-2 py-1 max-h-48 overflow-y-auto">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="d-flex align-items-center justify-content-between text-xs py-1"
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill fw-bold px-2 py-0.5">
                      {item.quantity}x
                    </span>
                    <span className="text-dark fw-semibold">
                      {item.foodItemName || 'Dish'}
                    </span>
                  </div>
                  <span className="fw-bold text-dark font-heading">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="dropdown-divider my-2"></div>

            {/* Bill Details */}
            <div className="space-y-1.5 text-xs text-muted pt-1">
              <div className="d-flex justify-content-between">
                <span>Payment Mode</span>
                <span className="fw-bold text-dark">
                  {order.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Payment Status</span>
                <span
                  className={`badge rounded-pill text-[10px] fw-bold px-2 py-0.5 ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-success text-white'
                      : 'bg-warning text-dark'
                  }`}
                >
                  {order.paymentStatus === 'PAID' ? '✓ Paid Successfully' : 'Pending Payment on Delivery'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Delivery Address</span>
                <span
                  className="fw-bold text-dark text-truncate text-end"
                  style={{ maxWidth: '320px' }}
                >
                  {order.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="dropdown-divider my-2"></div>

            <div className="d-flex justify-content-between align-items-center pt-1 fs-5 fw-black text-dark font-heading">
              <span>Total Paid</span>
              <span className="text-[#FF5A1F]">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons: 3 Connected Journey Next Steps */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order);
              }}
              className="w-100 btn btn-primary py-3 rounded-4 fs-6 fw-bold shadow-md d-flex align-items-center justify-content-center gap-2"
            >
              <Eye className="w-5 h-5 text-white" />
              <span>Track Live Delivery Timeline</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            <div className="row g-2">
              <div className="col-6">
                <button
                  onClick={() => {
                    onClose();
                    onViewOrderHistory();
                  }}
                  className="w-100 btn btn-outline-dark py-2.5 rounded-4 text-xs fw-bold d-flex align-items-center justify-content-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders History</span>
                </button>
              </div>

              <div className="col-6">
                <button
                  onClick={() => {
                    onClose();
                    onContinueShopping();
                  }}
                  className="w-100 btn btn-light border py-2.5 rounded-4 text-xs fw-bold text-secondary hover:text-dark d-flex align-items-center justify-content-center gap-1.5"
                >
                  <Store className="w-4 h-4" />
                  <span>Order More Food</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
