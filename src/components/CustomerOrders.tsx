import React from 'react';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  Repeat,
  CheckCircle2,
  Bike,
  Home,
  MapPin,
  Eye,
  Store,
  Calendar
} from 'lucide-react';
import { Order } from '../types';

interface CustomerOrdersProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onExploreFood: () => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  orders,
  onViewOrder,
  onReorder,
  onExploreFood,
}) => {
  const [filter, setFilter] = React.useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');

  if (orders.length === 0) {
    return (
      <div className="container-xl py-5 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-orange-50 text-[#FF5A1F] rounded-circle d-flex align-items-center justify-center mx-auto mb-3 shadow-inner">
          <ShoppingBag className="w-12 h-12 text-[#FF5A1F]" />
        </div>
        <h2 className="fs-3 fw-black text-dark font-heading mb-1">No Orders Yet</h2>
        <p className="text-muted text-xs max-w-sm mx-auto mb-4">
          You haven't placed any food orders yet. Explore our top artisanal restaurants and satisfy your cravings!
        </p>
        <button
          onClick={onExploreFood}
          className="btn btn-primary px-4 py-2.5 rounded-pill text-xs fw-bold shadow-sm d-inline-flex align-items-center gap-2"
        >
          <span>Explore Restaurants & Dishes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'ACTIVE') return o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED';
    if (filter === 'DELIVERED') return o.orderStatus === 'DELIVERED';
    return true;
  });

  return (
    <div className="container-xl py-4 py-md-5 animate-in fade-in" style={{ maxWidth: '880px' }}>
      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fs-3 fw-black text-dark font-heading mb-0">My Orders History</h1>
          <p className="text-muted text-xs mb-0">
            Track active deliveries and easily reorder your favourite meals
          </p>
        </div>

        {/* Filters */}
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm p-1 bg-white border rounded-pill shadow-2xs" role="group">
            <button
              onClick={() => setFilter('ALL')}
              className={`btn btn-sm rounded-pill text-xs fw-bold px-3 py-1 transition ${
                filter === 'ALL' ? 'btn-primary' : 'btn-light border-0 text-secondary'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`btn btn-sm rounded-pill text-xs fw-bold px-3 py-1 transition ${
                filter === 'ACTIVE' ? 'btn-primary' : 'btn-light border-0 text-secondary'
              }`}
            >
              Active ({orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length})
            </button>
            <button
              onClick={() => setFilter('DELIVERED')}
              className={`btn btn-sm rounded-pill text-xs fw-bold px-3 py-1 transition ${
                filter === 'DELIVERED' ? 'btn-primary' : 'btn-light border-0 text-secondary'
              }`}
            >
              Completed ({orders.filter(o => o.orderStatus === 'DELIVERED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card rounded-4 border p-5 text-center bg-white shadow-2xs">
          <p className="text-muted text-xs mb-3">No orders found matching this filter.</p>
          <button
            onClick={() => setFilter('ALL')}
            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 text-xs mx-auto"
          >
            Show All Orders
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map(order => {
            const isDelivered = order.orderStatus === 'DELIVERED';
            const isCancelled = order.orderStatus === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="card border rounded-4 p-4 shadow-xs hover:border-orange-300 card-hover-lift bg-white transition"
              >
                {/* Card Header */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-12 h-12 rounded-3 bg-orange-50 text-[#FF5A1F] d-flex align-items-center justify-content-center fw-bold shadow-2xs">
                      <Store className="w-6 h-6 text-[#FF5A1F]" />
                    </div>
                    <div>
                      <h3 className="fs-6 fw-black text-dark font-heading mb-0">
                        {order.restaurantName || 'FoodHub Partner'}
                      </h3>
                      <p className="text-muted text-[11px] mb-0 d-flex align-items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-muted" />
                        <span>Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge rounded-pill text-xs fw-bold px-3 py-1.5 ${
                        isDelivered
                          ? 'bg-success text-white'
                          : isCancelled
                          ? 'bg-danger text-white'
                          : 'bg-orange-100 text-[#FF5A1F] animate-pulse'
                      }`}
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items List Summary */}
                <div className="py-3">
                  <div className="text-xs text-dark fw-semibold mb-1">
                    {order.items.map(it => `${it.quantity}x ${it.foodItemName || 'Dish'}`).join(', ')}
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-3 text-[11px] text-muted">
                    <div className="d-flex align-items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted flex-shrink-0" />
                      <span className="text-truncate" style={{ maxWidth: '300px' }}>{order.deliveryAddress}</span>
                    </div>
                    <span>•</span>
                    <div>
                      <span className="fw-semibold text-secondary">{order.paymentMethod.replace(/_/g, ' ')}</span>
                      <span className="badge bg-light text-secondary border rounded-pill ms-1 text-[10px]">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Price and Actions */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top">
                  <div>
                    <span className="text-[10px] text-muted text-uppercase fw-bold d-block">Grand Total</span>
                    <span className="fs-5 fw-black text-dark font-heading">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Track / Receipt</span>
                    </button>

                    <button
                      onClick={() => onReorder(order)}
                      className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs transition"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Reorder Dishes</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
