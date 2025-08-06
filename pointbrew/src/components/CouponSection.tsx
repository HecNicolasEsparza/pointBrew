"use client";
import { useState } from 'react';
import { validateCoupon, AVAILABLE_COUPONS, Coupon } from '@/data/coupons';
import './CouponSection.css';

interface CouponSectionProps {
  totalAmount: number;
  onCouponApplied: (discount: number, newTotal: number, couponCode: string) => void;
  userId: number;
}

export default function CouponSection({ totalAmount, onCouponApplied, userId }: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setError('Ingresa un código de cupón');
      return;
    }

    const validation = validateCoupon(couponCode, totalAmount, userId);
    
    if (validation.valid && validation.discount && validation.coupon) {
      const newTotal = totalAmount - validation.discount;
      onCouponApplied(validation.discount, newTotal, couponCode);
      setAppliedCoupon(couponCode.toUpperCase());
      setAppliedDiscount(validation.discount);
      setCouponCode('');
      setError(null);
    } else {
      setError(validation.message || 'Error al aplicar cupón');
    }
  };

  const handleRemoveCoupon = () => {
    onCouponApplied(0, totalAmount, '');
    setAppliedCoupon(null);
    setAppliedDiscount(0);
    setError(null);
  };

  const applySuggestedCoupon = (code: string) => {
    setCouponCode(code);
    setError(null);
  };

  return (
    <div className="coupon-section">
      <h3>🎟️ Cupón de Descuento</h3>
      
      {!appliedCoupon ? (
        <>
          <div className="coupon-input-group">
            <input
              type="text"
              placeholder="Ingresa tu código de cupón"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
              className="coupon-input"
            />
            <button 
              onClick={handleApplyCoupon} 
              disabled={!couponCode.trim()}
              className="apply-coupon-btn"
            >
              Aplicar
            </button>
          </div>

          {error && <p className="coupon-error">❌ {error}</p>}

          <div className="suggested-coupons">
            <p className="suggestions-title">Cupones disponibles:</p>
            <div className="coupon-suggestions">
              {AVAILABLE_COUPONS
                .filter(coupon => coupon.isActive)
                .map((coupon) => (
                <button 
                  key={coupon.code}
                  onClick={() => applySuggestedCoupon(coupon.code)} 
                  className="coupon-suggestion"
                  title={coupon.description}
                >
                  <span className="coupon-code">{coupon.code}</span>
                  <span className="coupon-desc">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}% off` 
                      : `$${coupon.discountValue} off`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="applied-coupon">
          <div className="coupon-info">
            <span className="coupon-applied">✅ Cupón "{appliedCoupon}" aplicado</span>
            <span className="discount-amount">Descuento: -${appliedDiscount.toFixed(2)}</span>
          </div>
          <button onClick={handleRemoveCoupon} className="remove-coupon-btn">
            ✕ Quitar
          </button>
        </div>
      )}
    </div>
  );
}
