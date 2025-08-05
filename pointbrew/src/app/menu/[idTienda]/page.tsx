"use client";
import './menu.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { fetchProductsByStore } from '../../../contexts/services/getProductsService';
import { Product } from '../../../contexts/models/products';
import { addToCart } from '../../../contexts/services/cartService';
import { useAuth } from '../../../contexts/AuthContext';


export default function Menu() {
    const [products, setProducts] = useState<Product[]>([]);
    const [counts, setCounts] = useState<number[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchProductsByStore(1)
            .then((res) => {
                if (res.success) {
                    setProducts(res.data);
                    setCounts(Array(res.data.length).fill(1)); // una cantidad por producto
                }
            })
            .catch((err) => {
                console.error("Error al cargar productos:", err);
            });
    }, []);

    const handleAddToCart = async (productId: number, quantity: number) => {
        const userId = user?.user_id;
        

        if (!userId) {
            console.error("Usuario no autenticado.");
            return;
        }

        try {
            await addToCart({ user_id: userId, product_id: productId, quantity });
            console.log("Producto agregado al carrito");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            console.error("No se pudo agregar al carrito");
        }
    };

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

                    {products.map((product, i) => (
                        <div className="reduced-box" key={product.product_id}>
                            <div className="menu-top-image">
                                <img
                                    src={product.image_url || "/img/placeHolderFood.jpg"}
                                    alt={product.name}
                                />
                            </div>

                            <div className="menu-description">
                                <p>{product.name}</p>
                                <p>${product.price}</p>
                            </div>

                            <div className="menu-actions">
                                <button className="cart-btn" onClick={() => handleAddToCart(product.product_id, counts[i])}>
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
