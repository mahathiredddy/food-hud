import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  Store,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  initialMode?: 'login' | 'register';
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  onShowToast,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN'>('CUSTOMER');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const resp = await api.login(email, password);
        onShowToast(`Welcome back, ${resp.user.name}!`, 'success');
        onSuccess(resp.user);
        onClose();
      } else {
        if (!name.trim()) throw new Error('Full name is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const resp = await api.register({
          name,
          email,
          password,
          phone,
          address,
          role,
        });
        onShowToast(`Account created successfully! Welcome, ${resp.user.name}`, 'success');
        onSuccess(resp.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError(null);
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
        style={{ maxWidth: '440px', zIndex: 1 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 p-1.5 bg-white/20 hover:bg-white/40 text-white border-0 z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-[#FF5A1F] p-4 text-white text-center">
          <h2 className="fs-4 fw-black text-white font-heading mb-0">
            {mode === 'login' ? 'Welcome to FoodHub' : 'Join FoodHub Today'}
          </h2>
          <p className="text-light opacity-90 text-xs mb-3 mt-1">
            {mode === 'login'
              ? 'Sign in to order artisan dishes and track deliveries'
              : 'Create an account for faster ordering & exclusive deals'}
          </p>

          {/* Toggle Tabs */}
          <div className="btn-group w-100 p-1 bg-black bg-opacity-20 rounded-pill" role="group">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`btn btn-sm rounded-pill text-xs fw-bold transition ${
                mode === 'login' ? 'btn-light text-[#FF5A1F] shadow-xs' : 'text-white border-0'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`btn btn-sm rounded-pill text-xs fw-bold transition ${
                mode === 'register' ? 'btn-light text-[#FF5A1F] shadow-xs' : 'text-white border-0'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="alert alert-danger py-2 px-3 text-xs rounded-3 d-flex align-items-center gap-2 mb-2" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="form-label text-xs fw-bold text-dark mb-1">Full Name</label>
              <div className="position-relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="form-control form-control-sm rounded-3 ps-5 text-xs py-2 bg-light border-light-subtle"
                />
                <User className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
              </div>
            </div>
          )}

          <div>
            <label className="form-label text-xs fw-bold text-dark mb-1">Email Address</label>
            <div className="position-relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-control form-control-sm rounded-3 ps-5 text-xs py-2 bg-light border-light-subtle"
              />
              <Mail className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-xs fw-bold text-dark mb-1">Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-control form-control-sm rounded-3 ps-5 pe-5 text-xs py-2 bg-light border-light-subtle"
              />
              <Lock className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-sm btn-link p-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted hover:text-dark text-decoration-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="form-label text-xs fw-bold text-dark mb-1">Phone Number</label>
                <div className="position-relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="form-control form-control-sm rounded-3 ps-5 text-xs py-2 bg-light border-light-subtle"
                  />
                  <Phone className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
                </div>
              </div>

              <div>
                <label className="form-label text-xs fw-bold text-dark mb-1">Delivery Address</label>
                <div className="position-relative">
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="742 Evergreen Terrace, Springfield"
                    className="form-control form-control-sm rounded-3 ps-5 text-xs py-2 bg-light border-light-subtle"
                  />
                  <MapPin className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
                </div>
              </div>

              <div>
                <label className="form-label text-xs fw-bold text-dark mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="form-select form-select-sm rounded-3 text-xs py-2 bg-light border-light-subtle"
                >
                  <option value="CUSTOMER">Customer (Order food & track deliveries)</option>
                  <option value="RESTAURANT_OWNER">Restaurant Owner (Kitchen Partner)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-100 btn btn-primary py-2.5 rounded-pill fs-6 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3 cursor-pointer"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
            ) : mode === 'login' ? (
              'Sign In to FoodHub'
            ) : (
              'Create My Account'
            )}
          </button>

          {/* Quick Demo Logins Helper */}
          {mode === 'login' && (
            <div className="mt-3 pt-3 border-top">
              <span className="text-[11px] fw-bold text-muted d-block mb-1.5">⚡ 1-Click Fill Demo Credentials:</span>
              <div className="d-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('john.doe@example.com', 'Password123!')}
                  className="btn btn-sm btn-light border rounded-pill flex-grow-1 text-[11px] fw-semibold py-1 hover:border-[#FF5A1F]"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('owner.goldenspoon@foodhub.com', 'Owner123!')}
                  className="btn btn-sm btn-light border rounded-pill flex-grow-1 text-[11px] fw-semibold py-1 hover:border-[#FF5A1F]"
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('admin@foodhub.com', 'Admin123!')}
                  className="btn btn-sm btn-light border rounded-pill flex-grow-1 text-[11px] fw-semibold py-1 hover:border-[#FF5A1F]"
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
