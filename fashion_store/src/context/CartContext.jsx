import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get('/cart');
            setCart(data);
        } catch { }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    const addToCart = async (productId, size, quantity = 1) => {
        setLoading(true);
        try {
            const { data } = await api.post('/cart', { productId, size, quantity });
            setCart(data);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to add to cart' };
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (itemId, quantity) => {
        try {
            const { data } = await api.put(`/cart/${itemId}`, { quantity });
            setCart(data);
        } catch { }
    };

    const removeItem = async (itemId) => {
        try {
            const { data } = await api.delete(`/cart/${itemId}`);
            setCart(data);
        } catch { }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart/clear');
            setCart({ items: [], totalAmount: 0, totalItems: 0 });
        } catch { }
    };

    const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, itemCount, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
