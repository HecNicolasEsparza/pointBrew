"use client";
import './menu.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useState } from 'react';

export default function Menu() {
    const [counts, setCounts] = useState(Array(10).fill(1)); // un contador por tarjeta

    const handleDecrement = (index: number) => {
        setCounts(prev => {
            const updated = [...prev];
            updated[index] = Math.max(0, updated[index] - 1);
            return updated;
        });
    };

    const handleIncrement = (index: number) => {
        setCounts(prev => {
            const updated = [...prev];
            updated[index] = updated[index] + 1;
            return updated;
        });
    };

    return (
        <div className="auth-container">
            <div className="menu-container">
                <div className="menu-image-side">
                    <img src="/img/placeHolderFood.jpg" alt="Imagen lateral" />
                </div>

                <div className="menu-vertical-box">
                    <h3 className="menu-title">Menú</h3>
                    {[...Array(10)].map((_, i) => (
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
                                    <button onClick={() => handleDecrement(i)}>-</button>
                                    <span>{counts[i]}</span>
                                    <button onClick={() => handleIncrement(i)}>+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
