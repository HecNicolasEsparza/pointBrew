export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    description: '10% de descuento para nuevos usuarios',
    discountType: 'percentage',
    discountValue: 10,
    minAmount: 20,
    maxDiscount: 5,
    isActive: true
  },
  {
    code: 'SAVE5',
    description: '$5 de descuento',
    discountType: 'fixed',
    discountValue: 5,
    minAmount: 15,
    isActive: true
  },
  {
    code: 'STUDENT20',
    description: '20% descuento estudiantes',
    discountType: 'percentage',
    discountValue: 20,
    minAmount: 10,
    maxDiscount: 10,
    isActive: true
  },
  {
    code: 'COFFEE15',
    description: '15% en bebidas',
    discountType: 'percentage',
    discountValue: 15,
    minAmount: 8,
    maxDiscount: 8,
    isActive: true
  },
  {
    code: 'EXPIRED',
    description: 'Cupón expirado',
    discountType: 'percentage',
    discountValue: 25,
    isActive: false
  }
];

// Función para validar cupón
export const validateCoupon = (
  code: string, 
  totalAmount: number, 
  userId: number
): { valid: boolean; message?: string; discount?: number; coupon?: Coupon } => {
  const coupon = AVAILABLE_COUPONS.find(c => c.code === code.toUpperCase());
  
  if (!coupon) {
    return { valid: false, message: 'Cupón no válido' };
  }
  
  if (!coupon.isActive) {
    return { valid: false, message: 'Cupón expirado o no disponible' };
  }
  
  if (coupon.minAmount && totalAmount < coupon.minAmount) {
    return { 
      valid: false, 
      message: `Monto mínimo requerido: $${coupon.minAmount}` 
    };
  }
  
  // Simular que el usuario ya usó el cupón (localStorage)
  const usedCoupons = JSON.parse(localStorage.getItem(`usedCoupons_${userId}`) || '[]');
  if (usedCoupons.includes(code.toUpperCase())) {
    return { valid: false, message: 'Ya has usado este cupón' };
  }
  
  // Calcular descuento
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (totalAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }
  
  // No puede ser mayor al total
  if (discount > totalAmount) {
    discount = totalAmount;
  }
  
  return { valid: true, discount, coupon };
};

// Función para marcar cupón como usado
export const markCouponAsUsed = (code: string, userId: number) => {
  const usedCoupons = JSON.parse(localStorage.getItem(`usedCoupons_${userId}`) || '[]');
  usedCoupons.push(code.toUpperCase());
  localStorage.setItem(`usedCoupons_${userId}`, JSON.stringify(usedCoupons));
};
