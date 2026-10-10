import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Home,
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  Check,
  Maximize2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, User } from '../types';
import { api } from '../api';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  currentUser?: User | null;
  onOrderUpdated: (updatedOrder: Order) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onViewOrderHistory?: () => void;
  onOpenFullTrackingPage?: (order: Order) => void;
}

interface StepInfo {
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: StepInfo[] = [
  {
    status: 'PLACED',
    label: 'Order Placed',
    description: 'Received by kitchen & confirmed.',
    icon: ShoppingBag,
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmed',
    description: 'Kitchen partner confirmed ticket.',
    icon: CheckCircle2,
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    description: 'Chefs cooking fresh meal.',
    icon: ChefHat,
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    description: 'Courier en route to address.',
    icon: Bike,
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    description: 'Safely dropped off at door.',
    icon: Home,
  },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order: initialOrder,
  currentUser,
  onOrderUpdated,
  onShowToast,
  onViewOrderHistory,
  onOpenFullTrackingPage,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  // Periodic polling for active orders
  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (
      isOpen &&
      autoRefresh &&
      currentOrder &&
      currentOrder.orderStatus !== 'DELIVERED' &&
      currentOrder.orderStatus !== 'CANCELLED'
    ) {
      pollingRef.current = setInterval(async () => {
        try {
          const fresh = await api.getOrder(currentOrder.id);
          setCurrentOrder(fresh);
          onOrderUpdated(fresh);
        } catch {
          // silent error in background polling
        }
      }, 10000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen, autoRefresh, currentOrder, onOrderUpdated]);

  if (!isOpen || !currentOrder) return null;

  const currentStepIndex = STEPS.findIndex(s => s.status === currentOrder.orderStatus);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await api.getOrder(currentOrder.id);
      setCurrentOrder(fresh);
      onOrderUpdated(fresh);
      onShowToast(`Order #${fresh.id} status synced with backend`, 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to refresh order status', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const canAdvanceStatus =
    currentUser &&
    (currentUser.role === 'ADMIN' || currentUser.role === 'RESTAURANT_OWNER');

  const handleAdvanceStatus = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextStatus = STEPS[currentStepIndex + 1].status;
      try {
        const updated = await api.updateOrderStatus(currentOrder.id, nextStatus);
        setCurrentOrder(updated);
        onOrderUpdated(updated);
        onShowToast(
          `Order #${currentOrder.id} status updated to: ${STEPS[currentStepIndex + 1].label}`,
          'success'
        );
      } catch (err: any) {
        onShowToast(err.message || 'Failed to update order status', 'error');
      }
    }
  };

  // ETA Calculation
  const getEtaText = () => {
    if (currentOrder.orderStatus === 'DELIVERED') return 'Order Completed & Delivered';
    if (currentOrder.orderStatus === 'CANCELLED') return 'Order Cancelled';
    if (currentOrder.estimatedDeliveryMinutes) {
      return `Approx. ${currentOrder.estimatedDeliveryMinutes} mins remaining`;
    }
    return 'Delivery estimate unavailable';
  };

  return (
    <div
      className="position-fixed inset-0 z-50 overflow-y-auto d-flex align-items-center justify-content-center p-2 p-md-4"
      style={{ zIndex: 1060 }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="position-fixed inset-0 bg-dark opacity-60 backdrop-blur-xs animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div
        className="position-relative w-100 bg-white rounded-4 shadow-2xl overflow-hidden my-3 animate-in zoom-in-95"
        style={{ maxWidth: '680px', zIndex: 1 }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#212529] via-[#2A2E33] to-[#1C1E22] text-white d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-white/20 text-white rounded-pill px-2.5 py-1 text-xs fw-bold">
                ORDER #{currentOrder.id}
              </span>
              <span className="text-light opacity-80 text-xs d-flex align-items-center gap-1">
                <Calendar className="w-3 h-3 text-muted" />
                {new Date(currentOrder.createdAt).toLocaleDateString()} at{' '}
                {new Date(currentOrder.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h2 className="fs-4 fw-black text-white font-heading mb-0">
              {currentOrder.restaurantName || 'FoodHub Restaurant'}
            </h2>
          </div>

          <div className="d-flex align-items-center gap-2">
            {onOpenFullTrackingPage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullTrackingPage(currentOrder);
                }}
                className="btn btn-sm btn-light rounded-circle p-2 text-white bg-white/15 hover:bg-white/30 border-0"
                title="Expand to Full Tracking Page"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-sm btn-light rounded-circle p-2 text-white bg-white/15 hover:bg-white/30 border-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 p-md-5 space-y-4">
          {/* Estimated ETA Banner with Refresh Button */}
          <div className="card rounded-4 border border-warning-subtle bg-orange-50/70 p-3 shadow-xs">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="w-11 h-11 rounded-3 bg-[#FF5A1F] text-white d-flex align-items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] fw-bold text-muted text-uppercase tracking-wider d-block">
                    Estimated Delivery
                  </span>
                  <span className="fs-6 fw-black text-dark font-heading">
                    {getEtaText()}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="btn btn-sm btn-light border bg-white rounded-pill px-3 py-1.5 text-xs fw-bold text-dark hover:bg-light shadow-2xs d-inline-flex align-items-center gap-1.5"
                  title="Fetch current status from backend"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                </button>

                {canAdvanceStatus &&
                  currentOrder.orderStatus !== 'DELIVERED' &&
                  currentOrder.orderStatus !== 'CANCELLED' && (
                    <button
                      onClick={handleAdvanceStatus}
                      className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 text-xs fw-bold shadow-xs d-inline-flex align-items-center gap-1.5"
                      title="Advance status (Authorized)"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Cancelled Alert if applicable */}
          {currentOrder.orderStatus === 'CANCELLED' && (
            <div className="alert alert-danger rounded-4 text-xs py-2 px-3 mb-0 d-flex align-items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <span>This order was cancelled. Status updates have ceased.</span>
            </div>
          )}

          {/* TIMELINE: DESKTOP (Horizontal) */}
          <div className="card rounded-4 border p-4 bg-white shadow-2xs">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 className="text-xs fw-black text-muted text-uppercase tracking-wider mb-0">
                Order Timeline
              </h3>
              <span className="badge bg-light text-secondary border rounded-pill text-[10px]">
                {currentOrder.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Desktop Horizontal View */}
            <div className="d-none d-md-block my-3">
              <div className="position-relative">
                {/* Background Connecting Line */}
                <div
                  className="position-absolute top-5 start-0 end-0 h-1 bg-gray-200"
                  style={{ transform: 'translateY(-50%)', zIndex: 0 }}
                />
                {/* Active Progress Line */}
                <div
                  className="position-absolute top-5 start-0 h-1 bg-success transition-all duration-300"
                  style={{
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    width:
                      currentStepIndex <= 0
                        ? '0%'
                        : `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                  }}
                />

                <div className="d-flex justify-content-between position-relative z-2">
                  {STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted =
                      index < currentStepIndex ||
                      (index === currentStepIndex && currentOrder.orderStatus === 'DELIVERED');
                    const isCurrent =
                      index === currentStepIndex && currentOrder.orderStatus !== 'DELIVERED';

                    return (
                      <div
                        key={step.status}
                        className="d-flex flex-column align-items-center text-center"
                        style={{ width: '90px' }}
                      >
                        <div
                          className={`w-10 h-10 rounded-circle d-flex align-items-center justify-content-center transition-all ${
                            isCompleted
                              ? 'bg-success text-white shadow-sm'
                              : isCurrent
                              ? 'bg-[#FF5A1F] text-white shadow-md ring-4 ring-orange-200 animate-pulse'
                              : 'bg-white text-gray-400 border-2 border-gray-300'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-white stroke-[2.5]" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>

                        <span
                          className={`text-[11px] font-heading mt-2 fw-bold ${
                            isCompleted
                              ? 'text-success'
                              : isCurrent
                              ? 'text-[#FF5A1F] fw-black'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Vertical View */}
            <div className="d-block d-md-none my-2">
              <div className="position-relative ps-4 space-y-3 before:position-absolute before:top-2 before:bottom-2 before:start-2 before:w-0.5 before:bg-gray-200">
                {STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted =
                    index < currentStepIndex ||
                    (index === currentStepIndex && currentOrder.orderStatus === 'DELIVERED');
                  const isCurrent =
                    index === currentStepIndex && currentOrder.orderStatus !== 'DELIVERED';

                  return (
                    <div
                      key={step.status}
                      className="position-relative d-flex align-items-start gap-3"
                    >
                      <div
                        className={`position-absolute d-flex align-items-center justify-content-center rounded-circle transition ${
                          isCompleted
                            ? 'bg-success text-white'
                            : isCurrent
                            ? 'bg-[#FF5A1F] text-white ring-4 ring-orange-200 animate-pulse'
                            : 'bg-white text-gray-400 border'
                        }`}
                        style={{
                          width: '24px',
                          height: '24px',
                          left: '-28px',
                          top: '1px',
                        }}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                        ) : (
                          <StepIcon className="w-3 h-3" />
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <h4
                            className={`fs-6 fw-bold mb-0 font-heading ${
                              isCompleted
                                ? 'text-success'
                                : isCurrent
                                ? 'text-[#FF5A1F]'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill text-[10px] fw-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mb-0 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delivery Courier Partner Banner if Out for Delivery */}
          {currentOrder.orderStatus === 'OUT_FOR_DELIVERY' && (
            <div className="card rounded-4 border border-info-subtle bg-info-subtle/20 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="w-10 h-10 rounded-circle bg-info text-white d-flex align-items-center justify-center font-bold shadow-2xs">
                    <Bike className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="fs-6 fw-bold text-dark mb-0">Alex M. (FoodHub Courier)</h5>
                    <p className="text-muted text-xs mb-0">Electric Scooter • 0.8 miles away</p>
                  </div>
                </div>

                <button
                  onClick={() => onShowToast('Contacting assigned courier...', 'info')}
                  className="btn btn-sm btn-outline-info rounded-pill px-3 py-1 text-xs fw-bold d-inline-flex align-items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Driver</span>
                </button>
              </div>
            </div>
          )}

          {/* Order Details & Summary Breakdown */}
          <div className="card rounded-4 border p-3 bg-light/50 text-xs">
            <div className="d-flex justify-content-between align-items-center py-1.5 border-bottom">
              <span className="fw-bold text-muted">Delivery Address</span>
              <span className="fw-bold text-dark text-truncate text-end" style={{ maxWidth: '300px' }}>
                {currentOrder.deliveryAddress}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center py-1.5 border-bottom">
              <span className="fw-bold text-muted">Payment Mode & Status</span>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark">
                  {currentOrder.paymentMethod.replace(/_/g, ' ')}
                </span>
                <span
                  className={`badge rounded-pill text-[10px] fw-bold px-2 py-0.5 ${
                    currentOrder.paymentStatus === 'PAID'
                      ? 'bg-success text-white'
                      : 'bg-warning text-dark'
                  }`}
                >
                  {currentOrder.paymentStatus}
                </span>
              </div>
            </div>

            <div className="py-2 border-bottom">
              <span className="d-block fw-bold text-muted mb-1">
                Dishes in Order ({currentOrder.items.length})
              </span>
              <div className="space-y-1">
                {currentOrder.items.map(it => (
                  <div key={it.id} className="d-flex justify-content-between text-secondary">
                    <span>
                      {it.quantity}x {it.foodItemName || 'Dish'}
                    </span>
                    <span className="fw-bold text-dark">
                      ${(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-2 fs-6 fw-black text-dark font-heading">
              <span>Grand Total</span>
              <span className="text-[#FF5A1F]">
                ${currentOrder.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Close & Action Buttons */}
          <div className="d-flex flex-column gap-2">
            {onOpenFullTrackingPage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullTrackingPage(currentOrder);
                }}
                className="w-100 btn btn-primary py-2.5 rounded-4 fs-6 fw-bold shadow-xs d-flex align-items-center justify-content-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Open Dedicated Tracking Page</span>
              </button>
            )}

            {onViewOrderHistory && (
              <button
                onClick={() => {
                  onClose();
                  onViewOrderHistory();
                }}
                className="w-100 btn btn-outline-dark py-2.5 rounded-4 fs-6 fw-bold shadow-2xs d-flex align-items-center justify-content-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View All My Orders</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-100 btn btn-light border py-2.5 rounded-4 fs-6 fw-bold text-secondary hover:text-dark"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
