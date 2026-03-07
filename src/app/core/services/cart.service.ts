import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../../features/products/models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  cartTotal = computed(() => 
    this.cartItems().reduce((total, item) => total + (Number(item.product.precio) * item.quantity), 0)
  );

  cartCount = computed(() => 
    this.cartItems().reduce((count, item) => count + item.quantity, 0)
  );

  constructor() {
    // Load from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Validate items structure
        const validItems = Array.isArray(parsedCart) ? parsedCart.filter(item => item && item.product && item.product.id_producto && item.product.nombre) : [];
        this.cartItems.set(validItems);
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
        this.cartItems.set([]);
      }
    }

    // Save to localStorage whenever cart changes
    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    });

    // Listen for storage changes in other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'cart') {
        const newValue = event.newValue;
        if (newValue) {
          try {
            const parsedCart = JSON.parse(newValue);
            const validItems = Array.isArray(parsedCart) ? parsedCart.filter(item => item && item.product && item.product.id_producto && item.product.nombre) : [];
            this.cartItems.set(validItems);
          } catch (e) {
            console.error('Error syncing cart from storage event', e);
          }
        } else {
          this.cartItems.set([]);
        }
      }
    });
  }

  addToCart(product: Product, quantity: number = 1) {
    this.cartItems.update(items => {
      const existingItem = items.find(item => item.product.id_producto === product.id_producto);
      if (existingItem) {
        return items.map(item => 
          item.product.id_producto === product.id_producto 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...items, { product, quantity }];
    });
  }

  removeFromCart(productId: number) {
    this.cartItems.update(items => items.filter(item => item.product.id_producto !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    this.cartItems.update(items => 
      items.map(item => 
        item.product.id_producto === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
