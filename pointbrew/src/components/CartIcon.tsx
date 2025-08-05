"use client";
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import './CartIcon.css';

export default function CartIcon() {
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCartClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/Cart');
  };

  return (
    <button onClick={handleCartClick} className="cart-icon-btn">
      <FaShoppingCart />
      {isAuthenticated && cartCount > 0 && (
        <span className="cart-badge">{cartCount}</span>
      )}
    </button>
  );
}