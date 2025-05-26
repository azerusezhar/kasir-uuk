import { createContext, useState, useContext, useEffect } from 'react';
import { formatToRupiah } from '../utils/formatters';

export const CartContext = createContext({
  cartItems: [],
  totalAmount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  formatToRupiah: () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Load cart from localStorage when component mounts
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Update localStorage and total amount whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    calculateTotal();
  }, [cartItems]);

  // Calculate total amount
  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
    return total;
  };

  // Add item to cart
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product._id);
      
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item => 
          item.id === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item
        return [...prevItems, {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          category: product.category
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      totalAmount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      formatToRupiah
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 