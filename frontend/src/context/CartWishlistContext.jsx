import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const CartWishlistContext = createContext();

export function CartWishlistProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCartAndWishlist = async () => {
    if (!user) {
      setCartItems([]);
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const [cartRes, wishRes] = await Promise.all([
        api.get("/cart").catch(() => ({ data: { items: [] } })),
        api.get("/wishlist").catch(() => ({ data: { wishlist: [] } })),
      ]);
      setCartItems(cartRes.data.items || []);
      setWishlistItems(wishRes.data.wishlist || []);
    } catch (err) {
      console.error("Cart/Wishlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndWishlist();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) throw new Error("Please login to add items to cart");
    const res = await api.post("/cart", { productId, quantity });
    await fetchCartAndWishlist();
    return res.data;
  };

  const updateCartQty = async (cartItemId, quantity) => {
    const res = await api.put(`/cart/${cartItemId}`, { quantity });
    await fetchCartAndWishlist();
    return res.data;
  };

  const removeFromCart = async (cartItemId) => {
    const res = await api.delete(`/cart/${cartItemId}`);
    await fetchCartAndWishlist();
    return res.data;
  };

  const toggleWishlist = async (productId) => {
    if (!user) throw new Error("Please login to save items to wishlist");
    const isWishlisted = wishlistItems.some((w) => w.productId === productId);
    if (isWishlisted) {
      await api.delete(`/wishlist/${productId}`);
    } else {
      await api.post("/wishlist", { productId });
    }
    await fetchCartAndWishlist();
  };

  const isItemWishlisted = (productId) => {
    return wishlistItems.some((w) => w.productId === productId);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <CartWishlistContext.Provider
      value={{
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        loading,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        isItemWishlisted,
        refreshCartAndWishlist: fetchCartAndWishlist,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
}

export function useCartWishlist() {
  return useContext(CartWishlistContext);
}
