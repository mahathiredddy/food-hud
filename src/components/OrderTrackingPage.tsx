import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  ChefHat,
  Bike,
  Home,
  Check,
  Clock,
  RefreshCw,
  AlertCircle,
  MapPin,
  CreditCard,
  ArrowLeft,
  Calendar,
  Store,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  Receipt
} from 'lucide-react';
import { Order, OrderStatus, User } from '../types';
import { api } from '../api';

interface OrderTrackingPageProps {
  orderId?: number;
  initialOrder?: Order | null;
  currentUser: User | null;
  onNavigateHome: () => void;
  onNavigateOrders?: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface TimelineStage {
  status: OrderStatus;
  label: string;
  shortDesc: string;
  longDesc: string;
  icon: React.ElementType;
}

const ORDER_STAGES: TimelineStage[] = [
  {
    status: 'PLACED',
    label: 'Order Placed',
    shortDesc: 'Order confirmed with FoodHub',
    longDesc: 'Your order was successfully sent to the restaurant and is awaiting kitchen confirmation.',
    icon: ShoppingBag,
  },
  {
    status: 'CONFIRMED',
    label: 'Order Confirmed',
    shortDesc: 'Accepted by kitchen',
    longDesc: 'The kitchen has accepted your ticket and scheduled preparation time.',
    icon: CheckCircle2,
  },
  {
    status: 'PREPARING',
    label: 'Preparing Food',
    shortDesc: 'Chef is cooking your dishes',
    longDesc: 'Fresh ingredients are being prepared and cooked to perfection.',
    icon: ChefHat,
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    shortDesc: 'Courier is on the way',
    longDesc: 'Your meal is securely packed in an insulated thermal bag and the driver is heading your way.',
    icon: Bike,
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    shortDesc: 'Arrived at your doorstep',
    longDesc: 'Your order has been safely delivered to your address. Enjoy your meal!',
    icon: Home,
  },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orderId: propOrderId,
  initialOrder,
  currentUser,
  onNavigateHome,
  onNavigateOrders,
  onShowToast,
}) => {
  const [currentOrderId, setCurrentOrderId] = useState<number | undefined>(
    propOrderId || initialOrder?.id
  );
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState<boolean>(!initialOrder && !!currentOrderId);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [orderSearchInput, setOrderSearchInput] = useState<string>(
    currentOrderId ? String(currentOrderId) : ''
  );
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Polling ref
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrderDetails = useCallback(
    async (idToFetch: number, isSilent: boolean = false) => {
      if (!isSilent) {
        setRefreshing(true);
      }
      setError(null);
      try {
        const fetched = await api.getOrder(idToFetch);
        setOrder(fetched);
        setLastRefreshedAt(new Date());
      } catch (err: any) {
        const errorMsg =
          err.message || `Unable to fetch details for Order #${idToFetch}`;
        setError(errorMsg);
        if (!isSilent) {
          onShowToast(errorMsg, 'error');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [onShowToast]
  );

  // Initial fetch when currentOrderId changes
  useEffect(() => {
    if (currentOrderId) {
      fetchOrderDetails(currentOrderId, false);
    } else {
      setLoading(false);
    }
  }, [currentOrderId, fetchOrderDetails]);

  // Periodic polling only if appropriate (active order not delivered or cancelled)
  useEffect(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }

    const isOrderActive =
      order &&
      order.orderStatus !== 'DELIVERED' &&
      order.orderStatus !== 'CANCELLED';

    if (autoRefresh && isOrderActive && currentOrderId) {
      pollingTimerRef.current = setInterval(() => {
        fetchOrderDetails(currentOrderId, true);
      }, 10000); // 10 seconds interval
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [autoRefresh, order, currentOrderId, fetchOrderDetails]);

  const handleManualRefresh = () => {
    if (currentOrderId) {
      fetchOrderDetails(currentOrderId, false);
      onShowToast('Refreshed order status from backend', 'info');
    }
  };

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(orderSearchInput.trim(), 10);
    if (isNaN(parsed) || parsed <= 0) {
      onShowToast('Please enter a valid numeric Order ID', 'error');
      return;
    }
    setCurrentOrderId(parsed);
    setLoading(true);
  };

  // Status updating for authorized Admin or Restaurant Owner
  const canUpdateStatus =
    currentUser &&
    (currentUser.role === 'ADMIN' ||
      (currentUser.role === 'RESTAURANT_OWNER' && order));

  const getAllowedTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PLACED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    return transitions[currentStatus] || [];
  };

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const updated = await api.updateOrderStatus(order.id, nextStatus);
      setOrder(updated);
      setLastRefreshedAt(new Date());
      onShowToast(
        `Order #${order.id} status updated to ${nextStatus.replace(/_/g, ' ')}`,
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Determine stage indices
  const currentStageIndex = order
    ? ORDER_STAGES.findIndex(s => s.status === order.orderStatus)
    : -1;

  // Format delivery estimate
  const getEstimatedDeliveryDisplay = () => {
    if (!order) return null;
    if (order.orderStatus === 'DELIVERED') {
      return {
        label: 'Delivered',
        timeText: 'Order Completed & Delivered',
        isAvailable: true,
      };
    }
    if (order.orderStatus === 'CANCELLED') {
      return {
        label: 'Cancelled',
        timeText: 'Order was cancelled',
        isAvailable: false,
      };
    }

    if (
      order.estimatedDeliveryMinutes &&
      order.estimatedDeliveryMinutes > 0
    ) {
      const orderDate = new Date(order.createdAt);
      const estDate = new Date(
        orderDate.getTime() + order.estimatedDeliveryMinutes * 60000
      );
      const estFormatted = estDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        label: `Approx. ${order.estimatedDeliveryMinutes} mins`,
        timeText: `Expected by ${estFormatted}`,
        isAvailable: true,
      };
    }

    return {
      label: 'Unavailable',
      timeText: 'Delivery estimate not calculated',
      isAvailable: false,
    };
  };

  const deliveryEst = getEstimatedDeliveryDisplay();

  return (
    <div className="min-vh-100 bg-[#F9FAFB] py-4 py-md-5 animate-in fade-in">
      <div className="container-xl" style={{ maxWidth: '1040px' }}>
        {/* Navigation Breadcrumb & Lookup Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="btn btn-sm btn-light border bg-white rounded-pill px-3 py-1.5 text-xs fw-bold text-secondary hover:text-dark d-inline-flex align-items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Menu</span>
            </button>

            {onNavigateOrders && (
              <button
                onClick={onNavigateOrders}
                className="btn btn-sm btn-light border bg-white rounded-pill px-3 py-1.5 text-xs fw-bold text-secondary hover:text-dark d-inline-flex align-items-center gap-1.5 shadow-2xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>My Orders</span>
              </button>
            )}
          </div>

          {/* Quick Search Lookup Bar */}
          <form
            onSubmit={handleSearchOrder}
            className="d-flex align-items-center gap-2"
          >
            <div className="position-relative">
              <input
                type="number"
                placeholder="Track by Order #..."
                value={orderSearchInput}
                onChange={e => setOrderSearchInput(e.target.value)}
                className="form-control form-control-sm rounded-pill ps-4 pe-3 py-1.5 text-xs bg-white border shadow-2xs"
                style={{ width: '180px' }}
                min="1"
              />
              <Search className="w-3.5 h-3.5 text-muted position-absolute start-0 top-50 translate-middle-y ms-2.5" />
            </div>
            <button
              type="submit"
              className="btn btn-sm btn-dark rounded-pill px-3 py-1.5 text-xs fw-bold shadow-2xs"
            >
              Track
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card rounded-4 border-0 p-5 bg-white shadow-sm text-center my-4">
            <div
              className="spinner-border text-primary mx-auto mb-3"
              style={{ width: '2.5rem', height: '2.5rem' }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h3 className="fs-5 fw-bold text-dark font-heading">
              Fetching Order Details...
            </h3>
            <p className="text-muted text-xs mb-0">
              Connecting to Spring Boot REST backend to retrieve live order data.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="card rounded-4 border-danger-subtle bg-danger-subtle/20 p-4 p-md-5 my-4 text-center">
            <div className="w-14 h-14 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="fs-5 fw-bold text-danger font-heading mb-1">
              Unable to Track Order
            </h3>
            <p className="text-secondary text-xs max-w-md mx-auto mb-4">
              {error}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                onClick={() => currentOrderId && fetchOrderDetails(currentOrderId, false)}
                className="btn btn-sm btn-danger rounded-pill px-4 py-2 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              {onNavigateOrders && (
                <button
                  onClick={onNavigateOrders}
                  className="btn btn-sm btn-outline-dark rounded-pill px-4 py-2 text-xs fw-bold"
                >
                  View My Authorized Orders
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State when no order specified */}
        {!loading && !error && !order && (
          <div className="card rounded-4 border p-5 bg-white shadow-sm text-center my-4">
            <div className="w-16 h-16 bg-orange-50 text-[#FF5A1F] rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
              <Search className="w-8 h-8 text-[#FF5A1F]" />
            </div>
            <h3 className="fs-5 fw-bold text-dark font-heading mb-1">
              Enter an Order ID to Track
            </h3>
            <p className="text-muted text-xs max-w-sm mx-auto mb-4">
              Track live preparation and delivery status directly from our kitchen partner.
            </p>
            <div className="d-flex justify-content-center gap-2">
              {onNavigateOrders && (
                <button
                  onClick={onNavigateOrders}
                  className="btn btn-sm btn-primary rounded-pill px-4 py-2 text-xs fw-bold shadow-xs"
                >
                  Browse My Orders
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Order Tracking Display */}
        {!loading && !error && order && (
          <div className="space-y-4">
            {/* Top Overview Header Card */}
            <div className="card rounded-4 border-0 shadow-sm bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-[#212529] via-[#2D3136] to-[#1C1E22] text-white p-4 p-md-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-white/20 text-white rounded-pill px-3 py-1 text-xs fw-black tracking-wider">
                        ORDER #{order.id}
                      </span>
                      <span className="text-light opacity-80 text-xs d-flex align-items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted" />
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h1 className="fs-3 fw-black text-white font-heading mb-0 d-flex align-items-center gap-2">
                      <span>{order.restaurantName || 'FoodHub Kitchen'}</span>
                    </h1>
                  </div>

                  {/* Refresh and Auto-poll Controls */}
                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={handleManualRefresh}
                      disabled={refreshing}
                      className="btn btn-sm btn-light rounded-pill px-3 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs"
                      title="Fetch latest status from backend"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-dark ${refreshing ? 'animate-spin' : ''}`}
                      />
                      <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
                    </button>

                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`btn btn-sm rounded-pill px-2.5 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1 border transition ${
                        autoRefresh
                          ? 'bg-success/20 text-success border-success/40'
                          : 'bg-white/10 text-light border-white/20'
                      }`}
                      title={autoRefresh ? 'Live updates enabled (every 10s)' : 'Auto-refresh paused'}
                    >
                      <span
                        className={`d-inline-block rounded-circle me-1 ${
                          autoRefresh ? 'bg-success animate-pulse' : 'bg-secondary'
                        }`}
                        style={{ width: '6px', height: '6px' }}
                      />
                      <span>{autoRefresh ? 'Live Poll Active' : 'Auto-poll Paused'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Banner and Estimated Delivery Bar */}
              <div className="p-3.5 bg-orange-50/50 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="w-10 h-10 rounded-3 bg-[#FF5A1F] text-white d-flex align-items-center justify-content-center shadow-2xs">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] fw-bold text-muted text-uppercase tracking-wider d-block">
                      Estimated Delivery Time
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-6 fw-black text-dark font-heading">
                        {deliveryEst?.label}
                      </span>
                      <span className="text-muted text-xs">
                        ({deliveryEst?.timeText})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[11px] fw-bold text-muted text-uppercase tracking-wider d-block">
                    Current Stage
                  </span>
                  <span
                    className={`badge rounded-pill px-3 py-1.5 text-xs fw-black ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-success text-white'
                        : order.orderStatus === 'CANCELLED'
                        ? 'bg-danger text-white'
                        : 'bg-[#FF5A1F] text-white shadow-xs'
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancelled Banner if applicable */}
            {order.orderStatus === 'CANCELLED' && (
              <div className="card rounded-4 border-danger bg-danger-subtle/30 p-4 text-center">
                <div className="w-12 h-12 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="fs-6 fw-bold text-danger font-heading mb-1">
                  Order Cancelled
                </h4>
                <p className="text-muted text-xs mb-0">
                  This order was cancelled. Any pre-authorized charges will be refunded.
                </p>
              </div>
            )}

            {/* TIMELINE SECTION */}
            {order.orderStatus !== 'CANCELLED' && (
              <div className="card rounded-4 border-0 shadow-sm bg-white p-4 p-md-5">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                  <div>
                    <h2 className="fs-5 fw-black text-dark font-heading mb-0">
                      Live Delivery Progress
                    </h2>
                    <p className="text-muted text-xs mb-0">
                      Synchronized in real-time with our restaurant kitchen and delivery drivers
                    </p>
                  </div>
                  <span className="text-[11px] text-muted d-none d-sm-inline">
                    Last updated: {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* 1. DESKTOP TIMELINE (Horizontal, visible on md and up) */}
                <div className="d-none d-md-block my-4">
                  <div className="position-relative">
                    {/* Background Connecting Bar */}
                    <div
                      className="position-absolute top-6 start-0 end-0 h-1 bg-gray-200"
                      style={{ transform: 'translateY(-50%)', zIndex: 0 }}
                    />
                    {/* Active Filled Progress Bar */}
                    <div
                      className="position-absolute top-6 start-0 h-1 bg-success transition-all duration-500"
                      style={{
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        width:
                          currentStageIndex <= 0
                            ? '0%'
                            : `${(currentStageIndex / (ORDER_STAGES.length - 1)) * 100}%`,
                      }}
                    />

                    {/* Stage Nodes */}
                    <div className="d-flex justify-content-between position-relative z-2">
                      {ORDER_STAGES.map((stage, idx) => {
                        const Icon = stage.icon;
                        const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && order.orderStatus === 'DELIVERED');
                        const isCurrent = idx === currentStageIndex && order.orderStatus !== 'DELIVERED';
                        const isFuture = idx > currentStageIndex;

                        return (
                          <div
                            key={stage.status}
                            className="d-flex flex-column align-items-center text-center"
                            style={{ width: '130px' }}
                          >
                            {/* Circle Node */}
                            <div
                              className={`w-12 h-12 rounded-circle d-flex align-items-center justify-content-center transition-all ${
                                isCompleted
                                  ? 'bg-success text-white shadow-md'
                                  : isCurrent
                                  ? 'bg-[#FF5A1F] text-white shadow-lg ring-4 ring-orange-200 animate-pulse'
                                  : 'bg-white text-gray-400 border-2 border-gray-300'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-6 h-6 text-white stroke-[2.5]" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>

                            {/* Stage Label */}
                            <div className="mt-3">
                              <span
                                className={`d-block text-xs font-heading fw-bold ${
                                  isCompleted
                                    ? 'text-success'
                                    : isCurrent
                                    ? 'text-[#FF5A1F] fw-black'
                                    : 'text-gray-400'
                                }`}
                              >
                                {stage.label}
                              </span>
                              <span
                                className={`text-[11px] d-block mt-0.5 leading-tight ${
                                  isCurrent ? 'text-dark fw-medium' : 'text-muted'
                                }`}
                              >
                                {stage.shortDesc}
                              </span>

                              {isCurrent && (
                                <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill text-[10px] fw-bold mt-1.5 px-2 py-0.5">
                                  Current Stage
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. MOBILE TIMELINE (Vertical, visible on screens < md) */}
                <div className="d-block d-md-none my-2">
                  <div className="position-relative ps-4 space-y-4 before:position-absolute before:top-3 before:bottom-3 before:start-2 before:w-0.5 before:bg-gray-200">
                    {ORDER_STAGES.map((stage, idx) => {
                      const Icon = stage.icon;
                      const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && order.orderStatus === 'DELIVERED');
                      const isCurrent = idx === currentStageIndex && order.orderStatus !== 'DELIVERED';
                      const isFuture = idx > currentStageIndex;

                      return (
                        <div
                          key={stage.status}
                          className="position-relative d-flex align-items-start gap-3"
                        >
                          {/* Circle Node */}
                          <div
                            className={`position-absolute d-flex align-items-center justify-content-center rounded-circle transition-all ${
                              isCompleted
                                ? 'bg-success text-white shadow-sm'
                                : isCurrent
                                ? 'bg-[#FF5A1F] text-white ring-4 ring-orange-200 shadow-sm animate-pulse'
                                : 'bg-white text-gray-400 border'
                            }`}
                            style={{
                              width: '28px',
                              height: '28px',
                              left: '-30px',
                              top: '2px',
                            }}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-white stroke-[2.5]" />
                            ) : (
                              <Icon className="w-3.5 h-3.5" />
                            )}
                          </div>

                          {/* Text Description */}
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <h3
                                className={`fs-6 mb-0 font-heading ${
                                  isCompleted
                                    ? 'text-success fw-bold'
                                    : isCurrent
                                    ? 'text-[#FF5A1F] fw-black'
                                    : 'text-gray-400 fw-semibold'
                                }`}
                              >
                                {stage.label}
                              </h3>
                              {isCurrent && (
                                <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill text-[10px] fw-bold">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted mb-0 mt-0.5">
                              {stage.longDesc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current Stage Detailed Narrative Box */}
                {currentStageIndex >= 0 && (
                  <div className="mt-4 p-3.5 rounded-3 bg-light border border-light-subtle d-flex align-items-center gap-3">
                    <div className="w-10 h-10 rounded-circle bg-white border d-flex align-items-center justify-content-center text-[#FF5A1F] flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-[#FF5A1F]" />
                    </div>
                    <div>
                      <h4 className="fs-6 fw-bold text-dark font-heading mb-0">
                        {ORDER_STAGES[currentStageIndex]?.label}
                      </h4>
                      <p className="text-xs text-secondary mb-0">
                        {ORDER_STAGES[currentStageIndex]?.longDesc}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AUTHORIZED STATUS UPDATES (For Admins and Restaurant Owners only per Rule 6) */}
            {canUpdateStatus && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
              <div className="card rounded-4 border-warning-subtle bg-warning-subtle/10 p-4 shadow-2xs">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <div className="w-10 h-10 rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold">
                      <ShieldCheck className="w-5 h-5 text-dark" />
                    </div>
                    <div>
                      <h3 className="fs-6 fw-bold text-dark font-heading mb-0">
                        Management Controls ({currentUser?.role.replace(/_/g, ' ')})
                      </h3>
                      <p className="text-muted text-xs mb-0">
                        Advance order according to backend allowed state transitions
                      </p>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-2">
                    {getAllowedTransitions(order.orderStatus).map(nextStat => (
                      <button
                        key={nextStat}
                        onClick={() => handleUpdateStatus(nextStat)}
                        disabled={updatingStatus}
                        className={`btn btn-sm rounded-pill px-3 py-1.5 text-xs fw-bold transition ${
                          nextStat === 'CANCELLED'
                            ? 'btn-outline-danger'
                            : 'btn-dark'
                        }`}
                      >
                        {updatingStatus ? 'Updating...' : `Transition to ${nextStat.replace(/_/g, ' ')}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TWO-COLUMN DETAILS SECTION */}
            <div className="row g-4">
              {/* Left Column: Ordered Food Items & Total */}
              <div className="col-12 col-lg-7">
                <div className="card rounded-4 border-0 shadow-sm bg-white p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#FF5A1F]" />
                      <h3 className="fs-6 fw-black text-dark font-heading mb-0">
                        Ordered Food Items ({(order.items || []).reduce((s, it) => s + it.quantity, 0)})
                      </h3>
                    </div>
                    <span className="badge bg-light text-secondary border rounded-pill text-[10px]">
                      Ticket #{order.id}
                    </span>
                  </div>

                  {/* Food Items List */}
                  <div className="space-y-3 mb-4">
                    {(order.items || []).map(item => (
                      <div
                        key={item.id}
                        className="d-flex align-items-center justify-content-between py-2 border-bottom border-light-subtle"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-orange-100 text-[#FF5A1F] rounded-pill px-2.5 py-1 text-xs fw-black">
                            {item.quantity}x
                          </span>
                          <div>
                            <h4 className="fs-6 fw-bold text-dark font-heading mb-0">
                              {item.foodItemName || `Dish #${item.foodItemId}`}
                            </h4>
                            <span className="text-muted text-xs">
                              ${item.price.toFixed(2)} each
                            </span>
                          </div>
                        </div>

                        <span className="fs-6 fw-black text-dark font-heading">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-auto pt-3 border-top space-y-2 text-xs">
                    {(() => {
                      const itemsSubtotal = (order.items || []).reduce((sum, it) => sum + it.price * it.quantity, 0);
                      const deliveryFee = 2.99;
                      const tax = Math.round(itemsSubtotal * 0.08 * 100) / 100;
                      return (
                        <>
                          <div className="d-flex justify-content-between text-muted">
                            <span>Items Subtotal</span>
                            <span className="fw-semibold text-dark">${itemsSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between text-muted">
                            <span>Delivery Fee</span>
                            <span className="fw-semibold text-dark">${deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between text-muted">
                            <span>Estimated Tax (8%)</span>
                            <span className="fw-semibold text-dark">${tax.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center pt-2 border-top fs-5 fw-black text-dark font-heading">
                            <span>Order Total</span>
                            <span className="text-[#FF5A1F]">${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Column: Delivery Address & Payment Summary */}
              <div className="col-12 col-lg-5">
                <div className="space-y-4">
                  {/* Delivery Address Card */}
                  <div className="card rounded-4 border-0 shadow-sm bg-white p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-[#FF5A1F]" />
                      <h3 className="fs-6 fw-black text-dark font-heading mb-0">
                        Delivery Destination
                      </h3>
                    </div>

                    <div className="p-3 bg-light rounded-3">
                      <span className="text-[11px] fw-bold text-muted text-uppercase d-block mb-1">
                        Address on File
                      </span>
                      <p className="fs-6 fw-semibold text-dark mb-0 leading-snug">
                        {order.deliveryAddress || 'Standard Delivery Address'}
                      </p>
                    </div>

                    <div className="mt-3 text-xs text-muted d-flex align-items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Contactless doorstep drop-off requested</span>
                    </div>
                  </div>

                  {/* Payment Details Card */}
                  <div className="card rounded-4 border-0 shadow-sm bg-white p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#FF5A1F]" />
                        <h3 className="fs-6 fw-black text-dark font-heading mb-0">
                          Payment Details
                        </h3>
                      </div>
                      <span
                        className={`badge rounded-pill text-xs fw-bold px-2.5 py-1 ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-success text-white'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="d-flex justify-content-between py-1.5 border-bottom">
                        <span className="text-muted">Payment Method</span>
                        <span className="fw-bold text-dark">
                          {order.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1.5 border-bottom">
                        <span className="text-muted">Customer Name</span>
                        <span className="fw-bold text-dark">
                          {order.userName || currentUser?.name || 'Customer'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1.5">
                        <span className="text-muted">Customer Phone</span>
                        <span className="fw-bold text-dark">
                          {order.userPhone || currentUser?.phone || 'Confidential'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
