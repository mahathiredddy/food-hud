import React, { useState } from 'react';
import {
  X,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Building,
  Sparkles
} from 'lucide-react';
import { Cart, PaymentMethod, Order } from '../types';
import { api } from '../api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  defaultAddress: string;
  onOrderSuccess: (order: Order) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  defaultAddress,
  onOrderSuccess,
  onShowToast,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'home' | 'work' | 'custom'>('home');
  const [deliveryAddress, setDeliveryAddress] = useState(defaultAddress || '742 Evergreen Terrace, Springfield, OR');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulated card details
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('John Doe');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');

  // Simulated UPI ID
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [showQr, setShowQr] = useState(false);

  const applyPreset = (preset: 'home' | 'work' | 'custom') => {
    setSelectedPreset(preset);
    if (preset === 'home') {
      setDeliveryAddress(defaultAddress || '742 Evergreen Terrace, Springfield, OR');
    } else if (preset === 'work') {
      setDeliveryAddress('Suite 400, 100 Tech Park Blvd, Silicon Valley, CA');
    }
  };

  if (!isOpen || !cart) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      onShowToast('Please provide a valid delivery address', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate real-world gateway processing
      await new Promise(r => setTimeout(r, 900));

      const res = await api.createOrder({
        restaurantId: cart.restaurantId,
        deliveryAddress: deliveryNote.trim() ? `${deliveryAddress} (Note: ${deliveryNote})` : deliveryAddress,
        paymentMethod,
      });

      // If user checked save to profile, update backend profile
      if (saveToProfile) {
        try {
          await api.updateProfile({ address: deliveryAddress });
        } catch (ignored) {}
      }

      onShowToast('Order placed successfully! Confirming details.', 'success');
      onOrderSuccess(res.order);
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="position-fixed inset-0 z-50 overflow-y-auto d-flex align-items-center justify-content-center p-2 p-md-4" style={{ zIndex: 1060 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="position-fixed inset-0 bg-dark opacity-60 backdrop-blur-xs animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div
        className="position-relative w-100 bg-white rounded-4 shadow-2xl overflow-hidden my-3 animate-in zoom-in-95"
        style={{ maxWidth: '640px', zIndex: 1 }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-orange-500 to-[#FF5A1F] text-white d-flex align-items-center justify-content-between">
          <div>
            <span className="badge bg-white bg-opacity-25 text-white rounded-pill px-2.5 py-1 text-[11px] fw-bold text-uppercase">
              Secure Checkout
            </span>
            <h2 className="fs-4 fw-black text-white font-heading mb-0 mt-1">Review & Place Order</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-light rounded-circle p-2 text-white bg-white/20 hover:bg-white/40 border-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-4 p-md-5 space-y-4">
          {/* 1. Delivery Address Card */}
          <div className="card rounded-4 border p-3 bg-light/50">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="text-xs fw-black text-dark text-uppercase tracking-wider d-flex align-items-center gap-1.5 mb-0">
                <MapPin className="w-4 h-4 text-[#FF5A1F]" />
                <span>Delivery Location</span>
              </label>
              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 text-[10px] fw-bold">
                25-35 MINS ETA
              </span>
            </div>

            {/* Address preset pills */}
            <div className="d-flex align-items-center gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => applyPreset('home')}
                className={`btn btn-sm rounded-pill text-[11px] fw-bold px-2.5 py-0.5 transition ${
                  selectedPreset === 'home'
                    ? 'btn-primary'
                    : 'btn-outline-secondary bg-white text-dark border'
                }`}
              >
                🏠 Home
              </button>
              <button
                type="button"
                onClick={() => applyPreset('work')}
                className={`btn btn-sm rounded-pill text-[11px] fw-bold px-2.5 py-0.5 transition ${
                  selectedPreset === 'work'
                    ? 'btn-primary'
                    : 'btn-outline-secondary bg-white text-dark border'
                }`}
              >
                🏢 Work
              </button>
              <button
                type="button"
                onClick={() => applyPreset('custom')}
                className={`btn btn-sm rounded-pill text-[11px] fw-bold px-2.5 py-0.5 transition ${
                  selectedPreset === 'custom'
                    ? 'btn-primary'
                    : 'btn-outline-secondary bg-white text-dark border'
                }`}
              >
                📍 Other
              </button>
            </div>

            <textarea
              rows={2}
              required
              value={deliveryAddress}
              onChange={e => {
                setDeliveryAddress(e.target.value);
                setSelectedPreset('custom');
              }}
              placeholder="Enter apartment, street address, floor, city..."
              className="form-control text-xs rounded-3 border-light-subtle bg-white p-2.5 mb-2 focus:ring-2 focus:ring-[#FF5A1F]/20"
            />

            <input
              type="text"
              value={deliveryNote}
              onChange={e => setDeliveryNote(e.target.value)}
              placeholder="Optional: Delivery instructions (e.g., leave at doorstep, ring bell)"
              className="form-control text-[11px] rounded-3 border-light-subtle bg-white px-2.5 py-1.5 text-secondary mb-2"
            />

            <div className="form-check d-flex align-items-center gap-2 m-0 ps-0">
              <input
                type="checkbox"
                id="saveAddressCheckbox"
                checked={saveToProfile}
                onChange={e => setSaveToProfile(e.target.checked)}
                className="form-check-input m-0 cursor-pointer"
              />
              <label htmlFor="saveAddressCheckbox" className="form-check-label text-[11px] text-muted cursor-pointer">
                Save as my default delivery address in profile
              </label>
            </div>
          </div>

          {/* 2. Order Summary Accordion Card */}
          <div className="card rounded-4 border p-3 bg-light/50">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-xs fw-black text-dark text-uppercase tracking-wider mb-0">
                Order Summary ({cart.items.length} items)
              </span>
              <span className="text-xs text-[#FF5A1F] fw-bold">
                Total: ${cart.total.toFixed(2)}
              </span>
            </div>

            <div className="overflow-y-auto pr-1 space-y-1" style={{ maxHeight: '110px' }}>
              {cart.items.map(it => (
                <div key={it.id} className="d-flex justify-content-between align-items-center text-xs py-1 border-bottom border-light">
                  <span className="text-secondary text-truncate" style={{ maxWidth: '280px' }}>
                    <span className="fw-bold text-dark">{it.quantity}x</span> {it.foodItem?.name}
                  </span>
                  <span className="fw-bold text-dark">
                    ${(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between text-[11px] text-muted pt-2 mt-1">
              <span>Subtotal: ${cart.subtotal.toFixed(2)} | Delivery: ${cart.deliveryFee.toFixed(2)} | Tax: ${cart.tax.toFixed(2)}</span>
              {cart.discount > 0 && <span className="text-success fw-bold">-$5.00 Off</span>}
            </div>
          </div>

          {/* 3. Payment Method Simulation Cards */}
          <div>
            <label className="d-block text-xs fw-black text-dark text-uppercase tracking-wider mb-2">
              Select Payment Method
            </label>

            <div className="row g-2 mb-3">
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`w-100 btn text-center p-3 rounded-4 border d-flex flex-column align-items-center gap-1 transition ${
                    paymentMethod === 'CARD'
                      ? 'border-[#FF5A1F] bg-orange-50 text-[#FF5A1F] fw-bold shadow-xs'
                      : 'border-light-subtle bg-white text-secondary hover:border-secondary'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#FF5A1F]" />
                  <span className="text-xs">Card</span>
                </button>
              </div>

              <div className="col-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`w-100 btn text-center p-3 rounded-4 border d-flex flex-column align-items-center gap-1 transition ${
                    paymentMethod === 'UPI'
                      ? 'border-[#FF5A1F] bg-orange-50 text-[#FF5A1F] fw-bold shadow-xs'
                      : 'border-light-subtle bg-white text-secondary hover:border-secondary'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#FF5A1F]" />
                  <span className="text-xs">UPI</span>
                </button>
              </div>

              <div className="col-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`w-100 btn text-center p-3 rounded-4 border d-flex flex-column align-items-center gap-1 transition ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-[#FF5A1F] bg-orange-50 text-[#FF5A1F] fw-bold shadow-xs'
                      : 'border-light-subtle bg-white text-secondary hover:border-secondary'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#FF5A1F]" />
                  <span className="text-xs">Cash (COD)</span>
                </button>
              </div>
            </div>

            {/* Payment Details Subform */}
            <div className="card rounded-4 p-3 bg-light border border-light-subtle text-xs">
              {paymentMethod === 'CARD' && (
                <div className="space-y-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted fw-bold text-[11px]">Card Simulator (Demo Verified)</span>
                    <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5 font-bold">
                      Visa / Mastercard Ready
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] fw-bold text-muted mb-0.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      className="form-control form-control-sm text-xs rounded-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] fw-bold text-muted mb-0.5">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="form-control form-control-sm font-monospace text-xs rounded-2 bg-white"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="text-[11px] fw-bold text-muted mb-0.5">Expiry MM/YY</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="form-control form-control-sm font-monospace text-xs rounded-2 bg-white"
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-[11px] fw-bold text-muted mb-0.5">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="form-control form-control-sm font-monospace text-xs rounded-2 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="space-y-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted fw-bold text-[11px]">Instant UPI Gateway</span>
                    <button
                      type="button"
                      onClick={() => setShowQr(!showQr)}
                      className="btn btn-sm btn-link p-0 text-xs text-[#FF5A1F] text-decoration-none fw-bold"
                    >
                      {showQr ? 'Hide QR' : 'Show Demo QR'}
                    </button>
                  </div>

                  {showQr ? (
                    <div className="text-center p-3 bg-white rounded-3 border">
                      <div className="w-28 h-28 bg-gray-100 mx-auto rounded-2 d-flex align-items-center justify-center border mb-2">
                        <QrCode className="w-20 h-20 text-[#212529]" />
                      </div>
                      <p className="text-[11px] text-muted mb-0">Scan with Google Pay, PhonePe or Paytm</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] fw-bold text-muted mb-0.5">UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="form-control form-control-sm font-monospace text-xs rounded-2 bg-white"
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-muted mb-0 pt-1">
                    Instant authorization simulated on confirmation.
                  </p>
                </div>
              )}

              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <div className="d-flex align-items-start gap-2.5 py-1">
                  <Banknote className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="fs-6 fw-bold text-dark mb-0.5">Pay on Delivery</h5>
                    <p className="text-muted text-[11px] mb-0">
                      Please have exact cash (${cart.total.toFixed(2)}) ready for our courier partner upon delivery.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-100 btn btn-primary py-3 rounded-4 fs-6 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
                <span>Authorizing & Transmitting to Kitchen...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white" />
                <span>Place Order • Pay ${cart.total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>

          <div className="d-flex align-items-center justify-content-center gap-1.5 text-[11px] text-muted text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>256-Bit SSL Encrypted Simulated Order Submission</span>
          </div>
        </form>
      </div>
    </div>
  );
};
