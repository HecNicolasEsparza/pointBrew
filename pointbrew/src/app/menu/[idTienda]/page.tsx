"use client";
import './menu.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useEffect, useState, use } from 'react';
import { fetchProductsByStore } from '../../../contexts/services/getProductsService';
import { Product } from '../../../contexts/models/products';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';

interface Store {
    store_id: number;
    name: string;
    description: string;
    image_url?: string;
    branch_name: string;
    branch_address: string;
}

export default function Menu({ params }: { params: Promise<{ idTienda: string }> }) {
    const resolvedParams = use(params);
    const storeId = parseInt(resolvedParams.idTienda);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [counts, setCounts] = useState<number[]>([]);
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const { user } = useAuth();
    const { addToCart, cartCount } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (storeId && !isNaN(storeId)) {
            setLoading(true);
            // Cargar información de la tienda y productos
            Promise.all([
                fetchStoreDetails(),
                fetchProductsByStore(storeId)
            ])
            .then(([storeRes, productsRes]) => {
                if (productsRes.success) {
                    setProducts(productsRes.data);
                    setCounts(Array(productsRes.data.length).fill(1));
                } else {
                    setError('No se pudieron cargar los productos');
                }
            })
            .catch((err) => {
                console.error("Error al cargar datos:", err);
                setError('Error al conectar con el servidor');
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            setError('ID de tienda inválido');
            setLoading(false);
        }
    }, [storeId]);

    const fetchStoreDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/stores/${storeId}`);
            if (response.data.success) {
                setStore(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching store details:', error);
        }
    };

    const getStoreImage = (): string => {
        if (store?.image_url && store.image_url.trim() !== '') {
            return store.image_url;
        }
        return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    };

    const handleAddToCart = async (productId: number, quantity: number) => {
        if (!user) {
            alert("Debes iniciar sesión para agregar productos al carrito");
            router.push('/auth/login');
            return;
        }

        if (quantity === 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
        }

        try {
            setAddingToCart(productId);
            const success = await addToCart(productId, quantity);
            
            if (success) {
                alert("Producto agregado al carrito exitosamente");
            } else {
                alert("Error al agregar producto al carrito");
            }
        } catch (err) {
            console.error("Error al agregar al carrito:", err);
            alert("Error al agregar producto al carrito");
        } finally {
            setAddingToCart(null);
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

    const handleGoToCart = () => {
        if (!user) {
            alert("Debes iniciar sesión para ver el carrito");
            router.push('/auth/login');
            return;
        }
        // Cambiar la ruta a checkout en lugar de Cart
        router.push('/checkout');
    };

    if (loading) {
        return (
            <MockupLayout title="Cargando Menú - Point Brew" showAuthButtons={true}>
                <div className="menu-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando menú...</p>
                    </div>
                </div>
            </MockupLayout>
        );
    }

    if (error) {
        return (
            <MockupLayout title="Error - Point Brew" showAuthButtons={true}>
                <div className="menu-container">
                    <div className="error-container">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button onClick={() => router.push('/')} className="back-btn">
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </MockupLayout>
        );
    }

    return (
        <MockupLayout title={`Menú ${store?.name || 'Tienda'} - Point Brew`} showAuthButtons={true}>
            <div className="menu-container-kfc">
                <div className="menu-layout">
                    {/* Imagen grande de la tienda a la izquierda */}
                    <div className="store-image-section">
                        <img 
                            src={getStoreImage()} 
                            alt={store?.name || 'Tienda'}
                            className="store-hero-image"
                            onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                            }}
                        />
                    </div>

                    {/* Sección del menú a la derecha */}
                    <div className="menu-section">
                        <div className="menu-header-kfc">
                            <h1 className="menu-title-kfc">Menú</h1>
                        </div>

                        {products.length === 0 ? (
                            <div className="no-products-kfc">
                                <p>No hay productos disponibles en esta tienda.</p>
                            </div>
                        ) : (
                            <div className="products-grid-kfc">
                                {products.map((product, i) => (
                                    <div className="product-card-kfc" key={product.product_id}>
                                        <div className="product-image-kfc">
                                            <img
                                                src={product.image_url || "/img/placeHolderFood.jpg"}
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = "/img/placeHolderFood.jpg";
                                                }}
                                            />
                                        </div>

                                        <div className="product-info-kfc">
                                            <h4 className="product-name-kfc">{product.name}</h4>
                                            <p className="product-price-kfc">${product.price}</p>
                                        </div>

                                        <div className="product-actions-kfc">
                                            <button 
                                                className="cart-btn-kfc" 
                                                onClick={() => handleAddToCart(product.product_id, counts[i])}
                                                disabled={counts[i] === 0 || !user || addingToCart === product.product_id}
                                                title={!user ? "Inicia sesión para agregar al carrito" : "Agregar al carrito"}
                                            >
                                                {addingToCart === product.product_id ? '...' : <FaShoppingCart />}
                                            </button>

                                            <div className="quantity-controls-kfc">
                                                <button 
                                                    className="quantity-btn-kfc"
                                                    onClick={() => handleDecrement(i)}
                                                >
                                                    -
                                                </button>
                                                <span className="quantity-display-kfc">{counts[i]}</span>
                                                <button 
                                                    className="quantity-btn-kfc"
                                                    onClick={() => handleIncrement(i)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Botón flotante del carrito - ahora va directo al checkout */}
                {user && cartCount > 0 && (
                    <button 
                        className="floating-cart-btn"
                        onClick={handleGoToCart}
                        title="Proceder al pago"
                    >
                        <FaShoppingCart />
                        <span className="cart-count-badge">{cartCount}</span>
                    </button>
                )}
            </div>
        </MockupLayout>
    );
}
