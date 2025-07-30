import MockupLayout from '@/components/MockupLayout';
import './menu.css';
import { FaShoppingCart } from 'react-icons/fa';

export default function Menu() {
    return (
        <MockupLayout title="Point Brew" showAuthButtons={false}>
            <div className="auth-container">
                <div className="menu-container">
                    {/* Imagen lateral */}
                    <div className="menu-image-side">
                        <img src="/img/placeHolderFood.jpg" alt="Imagen lateral" />
                    </div>

                    {/* Contenido principal */}
                    <div className="menu-vertical-box">
                        <h3 className="menu-title">Menú</h3>

                        {[...Array(6)].map((_, i) => (
                            <div className="reduced-box" key={i}>
                                <div className="menu-top-image">
                                    <img src="/img/placeHolderFood.jpg" alt={`Platillo ${i + 1}`} />
                                </div>

                                <div className="menu-description">
                                    <p>Pollo asado</p>
                                    <p>$300</p>
                                </div>

                                <div className="menu-actions">

                                    <button className="cart-btn">
                                        <FaShoppingCart />
                                    </button>

                                    <div className="counter">
                                        <button>-</button>
                                        <span>1</span>
                                        <button>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MockupLayout>
    );
}
