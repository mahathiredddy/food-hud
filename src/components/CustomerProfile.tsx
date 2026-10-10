import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  ShieldCheck,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface CustomerProfileProps {
  currentUser: User | null;
  onProfileUpdated: (updatedUser: User) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  currentUser,
  onProfileUpdated,
  onShowToast,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      onShowToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const updated = await api.updateProfile({
        name,
        phone,
        address,
        password: newPassword || undefined,
      });

      onProfileUpdated(updated);
      onShowToast('Profile information successfully saved!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl py-4 py-md-5 animate-in fade-in" style={{ maxWidth: '720px' }}>
      <div className="card rounded-4 border p-4 p-md-5 shadow-xs bg-white">
        {/* Profile Card Header */}
        <div className="d-flex align-items-center gap-3 pb-4 border-bottom">
          <div className="w-16 h-16 rounded-circle bg-gradient-to-tr from-[#FF5A1F] to-[#FFC107] text-white d-flex align-items-center justify-center fs-3 fw-black shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="fs-4 fw-black text-dark font-heading mb-0">{currentUser.name}</h1>
            <p className="text-muted text-xs mb-1">{currentUser.email}</p>
            <span className="badge bg-orange-100 text-[#FF5A1F] text-[10px] fw-bold rounded-pill px-2.5 py-1">
              ROLE: {currentUser.role}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="form-label text-xs fw-bold text-dark mb-1">Full Name</label>
            <div className="position-relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-control form-control-sm rounded-3 ps-5 text-xs py-2 bg-light border-light-subtle"
              />
              <UserIcon className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-xs fw-bold text-dark mb-1">Registered Email (Read Only)</label>
            <div className="position-relative">
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="form-control form-control-sm rounded-3 ps-5 text-xs py-2 bg-light text-muted border-light-subtle"
              />
              <Mail className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-xs fw-bold text-dark mb-1">Contact Phone</label>
            <div className="position-relative">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555-0100"
                className="form-control form-control-sm rounded-3 ps-5 text-xs py-2 bg-light border-light-subtle"
              />
              <Phone className="w-4 h-4 text-muted position-absolute start-0 top-50 translate-middle-y ms-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-xs fw-bold text-dark mb-1">Default Delivery Address</label>
            <div className="position-relative">
              <textarea
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Apartment, street address, floor, city..."
                className="form-control text-xs rounded-3 ps-5 py-2 bg-light border-light-subtle"
              />
              <MapPin className="w-4 h-4 text-muted position-absolute start-0 top-0 mt-3 ms-3" />
            </div>
          </div>

          {/* Change Password Sub-card */}
          <div className="card rounded-3 p-3 bg-light border-light-subtle mt-4">
            <h3 className="fs-6 fw-bold text-dark font-heading mb-2 d-flex align-items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-warning" />
              <span>Change Password</span>
            </h3>
            <div className="row g-2">
              <div className="col-12 col-sm-6">
                <label className="text-[11px] fw-bold text-muted mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="form-control form-control-sm text-xs rounded-2 bg-white"
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="text-[11px] fw-bold text-muted mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="form-control form-control-sm text-xs rounded-2 bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-100 btn btn-primary py-2.5 rounded-4 fs-6 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
