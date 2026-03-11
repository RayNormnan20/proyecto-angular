import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Product } from '../../features/products/models/product.model';
import { ToastService } from './toast.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private toastService = inject(ToastService);
  cartItems = signal<CartItem[]>([]);
  private sparkleStyleId = 'cart-sparkle-style';

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

  private ensureSparkleStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(this.sparkleStyleId)) return;

    const style = document.createElement('style');
    style.id = this.sparkleStyleId;
    style.textContent = `
      @keyframes cartSparkle {
        0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; filter: blur(0); }
        100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; filter: blur(0.5px); }
      }
      @keyframes cartSparkleRing {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
        100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
      }
      .cart-sparkle-burst {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        width: 0;
        height: 0;
        left: 0;
        top: 0;
      }
      .cart-sparkle-ring {
        position: absolute;
        left: 0;
        top: 0;
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        border: 3px solid rgba(99, 102, 241, 0.55);
        transform: translate(-50%, -50%);
        animation: cartSparkleRing 3000ms ease-out forwards;
      }
      .cart-sparkle-dot {
        position: absolute;
        left: 0;
        top: 0;
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        background: var(--c);
        transform: translate(-50%, -50%);
        animation: cartSparkle 3100ms cubic-bezier(.2,.9,.2,1) forwards;
        box-shadow: 0 0 14px rgba(255,255,255,0.45);
      }
    `;
    document.head.appendChild(style);
  }

  private triggerSparklesFromEvent(event?: MouseEvent) {
    if (!event) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;

    this.ensureSparkleStyles();

    const x = event.clientX;
    const y = event.clientY;

    const burst = document.createElement('div');
    burst.className = 'cart-sparkle-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;

    const ring = document.createElement('div');
    ring.className = 'cart-sparkle-ring';
    burst.appendChild(ring);

    const colors = ['#6366F1', '#A855F7', '#F59E0B', '#22C55E', '#EF4444', '#3B82F6'];
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'cart-sparkle-dot';
      const angle = Math.random() * Math.PI * 2;
      const distance = 18 + Math.random() * 44;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const color = colors[Math.floor(Math.random() * colors.length)];
      dot.style.setProperty('--dx', `${dx}px`);
      dot.style.setProperty('--dy', `${dy}px`);
      dot.style.setProperty('--c', color);
      dot.style.animationDelay = `${Math.random() * 60}ms`;
      burst.appendChild(dot);
    }

    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), 1400);
  }

  addToCart(product: Product, quantity: number = 1, event?: MouseEvent) {
    this.triggerSparklesFromEvent(event);
    this.cartItems.update(items => {
      const existingItem = items.find(item => item.product.id_producto === product.id_producto);
      if (existingItem) {
        this.toastService.show('Producto actualizado en el carrito', 'success');
        return items.map(item => 
          item.product.id_producto === product.id_producto 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      this.toastService.show('Producto agregado al carrito', 'success');
      return [...items, { product, quantity }];
    });
  }

  removeFromCart(productId: number) {
    this.cartItems.update(items => items.filter(item => item.product.id_producto !== productId));
    this.toastService.show('Producto eliminado del carrito', 'info');
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
