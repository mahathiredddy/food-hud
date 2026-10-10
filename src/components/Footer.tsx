import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Clock, MapPin, Code2, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onOpenJavaViewer: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenJavaViewer }) => {
  return (
    <footer className="bg-white border-top pt-5 pb-4 text-xs text-muted mt-5">
      <div className="container-xl">
        <div className="row g-4 pb-4 border-bottom">
          {/* Col 1 */}
          <div className="col-12 col-md-4 space-y-2">
            <div className="d-flex align-items-center gap-2">
              <div className="w-8 h-8 rounded-2 bg-[#FF5A1F] text-white d-flex align-items-center justify-center shadow-xs">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <span className="fs-4 fw-black text-dark font-heading">
                Food<span className="text-[#FF5A1F]">Hub</span>
              </span>
            </div>
            <p className="text-muted text-xs lh-base max-w-sm">
              FoodHub delivers freshly prepared artisan meals from top-rated restaurants straight to your doorstep with real-time live visual timeline tracking.
            </p>
            <div className="d-flex align-items-center gap-1.5 text-success fw-bold text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Simulated Safe Payments (COD, Instant UPI, Visa/Mastercard)</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="col-6 col-md-2">
            <h4 className="fw-bold text-dark text-uppercase tracking-wider text-xs mb-3 font-heading">
              Cuisines
            </h4>
            <ul className="list-unstyled space-y-1.5 text-xs text-muted mb-0">
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Woodfired Pizzas</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Hyderabadi Biryani</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Tonkotsu Ramen</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Nigiri & Sushi Rolls</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Angus Smash Burgers</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Organic Grain Bowls</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="col-6 col-md-3">
            <h4 className="fw-bold text-dark text-uppercase tracking-wider text-xs mb-3 font-heading">
              Platform Features
            </h4>
            <ul className="list-unstyled space-y-1.5 text-xs text-muted mb-0">
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Customer Food Ordering</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Visual Order Timeline Tracking</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Kitchen Partner Order Pipeline</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Admin Governance & Revenue Stats</span></li>
              <li><span className="hover:text-[#FF5A1F] cursor-pointer">Role-Based Access Control</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="col-12 col-md-3 space-y-2">
            <h4 className="fw-bold text-dark text-uppercase tracking-wider text-xs mb-3 font-heading">
              Backend Architecture
            </h4>
            <p className="text-[11px] text-muted lh-base mb-2">
              Enterprise Java 17 + Spring Boot 3 REST APIs, Spring Data JPA, Hibernate, and MySQL 8.x.
            </p>
            <button
              onClick={onOpenJavaViewer}
              className="w-100 btn btn-sm btn-dark text-warning rounded-3 py-2 px-3 fw-bold text-xs d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              <Code2 className="w-4 h-4 text-warning" />
              <span>Browse Spring Boot Source</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-warning opacity-75" />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-3 d-flex flex-wrap align-items-center justify-content-between gap-3 text-[11px] text-muted">
          <p className="mb-0">© 2026 FoodHub – Online Food Ordering System. All rights reserved.</p>
          <div className="d-flex align-items-center gap-3">
            <span className="hover:text-dark cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-dark cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-dark cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
