import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { FavoriteService } from '../../features/favorites/services/favorite.service';
import { CategoriesService } from '../../features/products/services/categories.service';
import { ProductsService } from '../../features/products/services/products.service';
import { Category, Product } from '../../features/products/models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col font-roboto">
      
      <!-- Topbar -->
      <div class="hidden lg:block bg-gray-100 py-2 px-4">
        <div class="container mx-auto flex justify-between items-center">
          <div class="flex gap-4 text-sm text-gray-600">
            <a routerLink="/about" class="hover:text-yellow-500 transition-colors">Sobre Nosotros</a>
            <a routerLink="/contact" class="hover:text-yellow-500 transition-colors">Contacto</a>
            <a routerLink="/help" class="hover:text-yellow-500 transition-colors">Ayuda</a>
            <a routerLink="/faq" class="hover:text-yellow-500 transition-colors">FAQs</a>
          </div>
          <div class="flex gap-4 text-sm text-gray-600">
            <ng-container *ngIf="authService.currentUser() as user; else authLinks">
                <div class="relative group cursor-pointer hover:text-yellow-500 transition-colors">
                    <span class="flex items-center gap-1">Hola, {{ user.nombre }} <i class="fas fa-angle-down"></i></span>
                    <div class="absolute right-0 top-full pt-2 w-48 z-50 hidden group-hover:block">
                        <div class="bg-white shadow-lg rounded-md py-1 border border-gray-100">
                            <a routerLink="/profile" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-yellow-500">Mi Perfil</a>
                            <a *ngIf="['admin', 'trabajador', 'supervisor'].includes(user.role || '')" routerLink="/dashboard" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-yellow-500">Dashboard</a>
                            <button (click)="logout()" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </ng-container>
            <ng-template #authLinks>
                <div class="relative group cursor-pointer hover:text-yellow-500 transition-colors">
                    <span class="flex items-center gap-1">Mi Cuenta <i class="fas fa-angle-down"></i></span>
                    <div class="absolute right-0 top-full pt-2 w-48 z-50 hidden group-hover:block">
                        <div class="bg-white shadow-lg rounded-md py-1 border border-gray-100">
                            <a routerLink="/auth/login" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-yellow-500">Iniciar Sesión</a>
                            <a routerLink="/auth/register" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-yellow-500">Registrarse</a>
                        </div>
                    </div>
                </div>
            </ng-template>
            
            <!-- 
            <div class="relative group cursor-pointer hover:text-yellow-500 transition-colors hidden md:block">
              <span class="flex items-center gap-1">PEN <i class="fas fa-angle-down"></i></span>
            </div>
            <div class="relative group cursor-pointer hover:text-yellow-500 transition-colors hidden md:block">
              <span class="flex items-center gap-1">ES <i class="fas fa-angle-down"></i></span>
            </div> 
            -->
          </div>
        </div>
      </div>

      <!-- Middle Header -->
      <div class="bg-white py-6 px-4 shadow-sm lg:shadow-none">
        <div class="container mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <!-- Logo -->
          <a (click)="goHome()" class="text-decoration-none block lg:w-1/3 text-center lg:text-left no-underline hover:no-underline cursor-pointer">
            <span class="uppercase text-yellow-500 bg-gray-900 px-3 py-1 font-bold text-3xl lg:text-4xl border border-gray-900">NOVA</span>
            <span class="uppercase text-gray-900 bg-yellow-500 px-3 py-1 font-bold text-3xl lg:text-4xl ml-[-5px] border border-yellow-500">VAM 3D</span>
          </a>

          <!-- Search -->
          <div class="w-full lg:w-1/3 text-left relative z-50">
            <form (submit)="$event.preventDefault()" class="relative z-50">
              <div class="flex">
                <input type="text" 
                       class="w-full border border-gray-300 py-2.5 px-4 focus:outline-none focus:border-yellow-500 text-gray-600" 
                       placeholder="Buscar productos"
                       [ngModel]="searchTerm()"
                       (ngModelChange)="onSearchInput($event)"
                       name="search"
                       autocomplete="off">
                <button class="bg-transparent border border-gray-300 border-l-0 px-4 text-yellow-500 hover:bg-gray-50 transition-colors">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </form>
            
            <!-- Search Results Dropdown -->
            <div *ngIf="showSearchResults() && searchTerm().length >= 2" 
                 class="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl z-50 mt-1 max-h-[400px] overflow-y-auto rounded-b-md">
                
                <div *ngIf="searchResults().length > 0; else noResults">
                    <div *ngFor="let product of searchResults()" 
                         (click)="selectProduct(product)"
                         class="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                        <div class="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <img [src]="getProductImage(product)" class="w-full h-full object-cover" alt="Product">
                        </div>
                        <div class="flex-grow">
                            <h6 class="text-sm font-medium text-gray-800 m-0 line-clamp-1">{{ product.nombre }}</h6>
                            <div class="flex items-center justify-between mt-1">
                                <span class="text-xs text-gray-500">{{ product.category?.nombre || 'Sin categoría' }}</span>
                                <span class="text-sm font-bold text-yellow-600">S/. {{ product.precio }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <ng-template #noResults>
                    <div class="p-4 text-center text-gray-500 text-sm">
                        No se encontraron productos para "{{ searchTerm() }}"
                    </div>
                </ng-template>
            </div>
            <!-- Overlay to close search when clicking outside -->
            <div *ngIf="showSearchResults()" (click)="closeSearch()" class="fixed inset-0 z-40 bg-transparent"></div>
          </div>

          <!-- Customer Service -->
          <div class="hidden lg:block lg:w-1/3 text-right">
            <p class="m-0 text-gray-500 text-sm">Servicio al Cliente</p>
            <h5 class="m-0 font-bold text-gray-800 text-xl">+51 962281036</h5>
          </div>
        </div>
      </div>

      <!-- Navbar -->
      <div class="bg-gray-800 mb-0 sticky top-0 z-40 shadow-md">
        <div class="container mx-auto px-4">
          <div class="flex flex-wrap items-center justify-between">
            <!-- Categories Button (Mobile/Desktop) -->
            <div class="hidden lg:block w-[25%] relative group z-50">
                <a class="flex items-center justify-between bg-yellow-500 w-full px-8 py-3 text-gray-900 font-bold cursor-pointer h-[65px] hover:bg-yellow-400 transition-colors no-underline">
                  <span><i class="fas fa-bars mr-2"></i>Categorías</span>
                  <i class="fas fa-angle-down"></i>
                </a>
                <!-- Dropdown Menu -->
                <nav class="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg hidden group-hover:block z-50">
                    <div class="flex flex-col py-2">
                        <a *ngFor="let cat of categories()" (click)="selectCategory(cat.id_categoria!)" class="px-6 py-2 hover:bg-gray-100 hover:text-yellow-500 text-gray-800 transition-colors border-b border-gray-100 last:border-0 no-underline cursor-pointer">
                            {{ cat.nombre }}
                        </a>
                        <div *ngIf="categories().length === 0" class="px-6 py-2 text-gray-500 text-sm italic">
                            Cargando categorías...
                        </div>
                    </div>
                </nav>
            </div>

            <!-- Nav Links -->
            <div class="w-full lg:w-[75%]">
              <nav class="flex items-center justify-between py-3 lg:py-0 px-0 lg:px-8">
                  <div class="hidden lg:flex space-x-8">
                    <a (click)="goHome()" class="text-white hover:text-yellow-500 py-3 font-medium transition-colors no-underline uppercase text-sm tracking-wider cursor-pointer">Inicio</a>
                    <a (click)="goHome()" class="text-white hover:text-yellow-500 py-3 font-medium transition-colors no-underline uppercase text-sm tracking-wider cursor-pointer">Catálogo</a>
                    <a routerLink="/contact" class="text-white hover:text-yellow-500 py-3 font-medium transition-colors no-underline uppercase text-sm tracking-wider">Contacto</a>
                  </div>
                  
                  <!-- Mobile Menu Button -->
                  <button (click)="toggleMobileMenu()" class="lg:hidden text-gray-400 hover:text-white border border-gray-600 rounded px-3 py-2">
                    <i class="fas fa-bars text-xl"></i>
                  </button>

                  <!-- Cart/Favorites Icons -->
                  <div class="flex items-center space-x-4 lg:ml-auto py-0">
                    <a routerLink="/favorites" class="btn px-0 relative group">
                        <i class="fas fa-heart text-yellow-500 text-xl group-hover:text-yellow-400 transition-colors"></i>
                        <span *ngIf="favoriteService.favoritesCount() > 0" class="absolute -top-2 -right-2 bg-transparent text-white border border-gray-500 rounded-full text-xs h-5 w-5 flex items-center justify-center">{{ favoriteService.favoritesCount() }}</span>
                    </a>
                    <a routerLink="/cart" class="btn px-0 ml-3 relative group">
                        <i class="fas fa-shopping-cart text-yellow-500 text-xl group-hover:text-yellow-400 transition-colors"></i>
                        <span *ngIf="cartService.cartCount() > 0" class="absolute -top-2 -right-2 bg-transparent text-white border border-gray-500 rounded-full text-xs h-5 w-5 flex items-center justify-center">{{ cartService.cartCount() }}</span>
                    </a>
                  </div>
              </nav>
            </div>
          </div>
        </div>

        <!-- Mobile Menu (Inside sticky container) -->
        <div class="lg:hidden bg-gray-800 border-t border-gray-700" *ngIf="isMobileMenuOpen()">
          <div class="container mx-auto px-4 py-4">
            <nav class="flex flex-col space-y-4">
              <a (click)="goHome(); isMobileMenuOpen.set(false)" class="text-white hover:text-yellow-500 font-medium transition-colors no-underline uppercase text-sm tracking-wider cursor-pointer">Inicio</a>
              <a (click)="goHome(); isMobileMenuOpen.set(false)" class="text-white hover:text-yellow-500 font-medium transition-colors no-underline uppercase text-sm tracking-wider cursor-pointer">Catálogo</a>
              <a routerLink="/contact" (click)="isMobileMenuOpen.set(false)" class="text-white hover:text-yellow-500 font-medium transition-colors no-underline uppercase text-sm tracking-wider">Contacto</a>
              
              <div class="border-t border-gray-700 pt-4 mt-2">
                <h6 class="text-gray-400 text-xs uppercase font-bold mb-2">Categorías</h6>
                <a *ngFor="let cat of categories()" (click)="selectCategory(cat.id_categoria!); isMobileMenuOpen.set(false)" class="block text-gray-300 hover:text-white py-1 text-sm cursor-pointer">{{ cat.nombre }}</a>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <main class="flex-grow bg-gray-50">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <div class="bg-gray-800 text-gray-300 mt-12 pt-12">
        <div class="container mx-auto px-4 pt-5">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div class="mb-5">
                    <h5 class="text-white uppercase font-bold mb-4 text-lg tracking-wider">CONTÁCTANOS</h5>
                    <p class="mb-4 text-gray-400 leading-relaxed">Tu tienda de confianza para encontrar todo lo que necesitas con la mejor calidad y precio.</p>
                    <p class="mb-2 flex items-center"><i class="fas fa-map-marker-alt text-yellow-500 mr-3 w-5 text-center"></i>123 Calle Principal, Lima, Perú</p>
                    <p class="mb-2 flex items-center"><i class="fas fa-envelope text-yellow-500 mr-3 w-5 text-center"></i>info@multishop.com</p>
                    <p class="mb-0 flex items-center"><i class="fas fa-phone-alt text-yellow-500 mr-3 w-5 text-center"></i>+51 999 999 999</p>
                </div>
                <div class="mb-5">
                    <h5 class="text-white uppercase font-bold mb-4 text-lg tracking-wider">ENLACES RÁPIDOS</h5>
                    <div class="flex flex-col space-y-2">
                        <a (click)="goHome()" class="text-gray-400 hover:text-white hover:underline transition-colors no-underline flex items-center cursor-pointer"><i class="fas fa-angle-right mr-2"></i>Inicio</a>
                        <a (click)="goHome()" class="text-gray-400 hover:text-white hover:underline transition-colors no-underline flex items-center cursor-pointer"><i class="fas fa-angle-right mr-2"></i>Nuestra Tienda</a>
                        <a routerLink="/about" class="text-gray-400 hover:text-white hover:underline transition-colors no-underline flex items-center"><i class="fas fa-angle-right mr-2"></i>Sobre Nosotros</a>
                        <a routerLink="/contact" class="text-gray-400 hover:text-white hover:underline transition-colors no-underline flex items-center"><i class="fas fa-angle-right mr-2"></i>Contáctanos</a>
                        <a routerLink="/help" class="text-gray-400 hover:text-white hover:underline transition-colors no-underline flex items-center"><i class="fas fa-angle-right mr-2"></i>Ayuda</a>
                    </div>
                </div>
                <div class="mb-5">
                    <h5 class="text-white uppercase font-bold mb-4 text-lg tracking-wider">BOLETÍN</h5>
                    <p class="mb-4 text-gray-400">Suscríbete para recibir las últimas ofertas y novedades directamente en tu correo.</p>
                    <form action="">
                        <div class="flex">
                            <input type="text" class="w-full px-4 py-2 text-gray-900 focus:outline-none placeholder-gray-500" placeholder="Tu Email">
                            <button class="bg-yellow-500 text-gray-900 px-4 py-2 font-bold hover:bg-yellow-400 transition-colors">Suscribirse</button>
                        </div>
                    </form>
                    <h6 class="text-white uppercase mt-6 mb-3 font-bold tracking-wider">SÍGUENOS</h6>
                    <div class="flex space-x-2">
                        <a class="bg-yellow-500 text-gray-900 w-10 h-10 flex items-center justify-center hover:bg-yellow-400 transition-colors" href="#"><i class="fab fa-twitter"></i></a>
                        <a class="bg-yellow-500 text-gray-900 w-10 h-10 flex items-center justify-center hover:bg-yellow-400 transition-colors" href="#"><i class="fab fa-facebook-f"></i></a>
                        <a class="bg-yellow-500 text-gray-900 w-10 h-10 flex items-center justify-center hover:bg-yellow-400 transition-colors" href="#"><i class="fab fa-linkedin-in"></i></a>
                        <a class="bg-yellow-500 text-gray-900 w-10 h-10 flex items-center justify-center hover:bg-yellow-400 transition-colors" href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-700 py-6 px-4">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="text-center md:text-left mb-4 md:mb-0">
                        <p class="text-gray-400 m-0">
                            &copy; <a class="text-yellow-500 hover:underline no-underline" href="#">NovaVam3D</a>. Todos los derechos reservados.
                        </p>
                    </div>
                    <div class="text-center md:text-right">
                        <img class="h-8 inline-block" src="assets/img/payments.png" alt="Métodos de Pago">
                    </div>
                </div>
            </div>
        </div>
      </div>

    </div>
  `
})
export class PublicLayoutComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);
  private categoriesService = inject(CategoriesService);
  private productsService = inject(ProductsService);
  private router = inject(Router);
  
  categories = signal<Category[]>([]);
  isMobileMenuOpen = signal<boolean>(false);

  // Search State
  searchTerm = signal('');
  searchResults = signal<Product[]>([]);
  showSearchResults = signal(false);
  private searchTimeout: any;

  ngOnInit() {
    this.loadCategories();
  }
  
  loadCategories() {
    this.categoriesService.getAll().subscribe({
        next: (data) => this.categories.set(data),
        error: (err) => console.error('Error loading categories in layout', err)
    });
  }

  onSearchInput(term: string) {
    this.searchTerm.set(term);
    
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    
    if (!term || term.length < 2) {
      this.searchResults.set([]);
      this.showSearchResults.set(false);
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.productsService.getAll({ search: term }).subscribe({
        next: (response) => {
          this.searchResults.set(response.products || []);
          this.showSearchResults.set(true);
        },
        error: (err) => console.error('Error searching', err)
      });
    }, 300);
  }

  selectProduct(product: Product) {
    this.router.navigate(['/product', product.id_producto]);
    this.searchTerm.set('');
    this.showSearchResults.set(false);
    this.searchResults.set([]);
  }

  closeSearch() {
    this.showSearchResults.set(false);
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0].url;
      if (!imageUrl) return 'assets/img/product-placeholder.jpg';
      if (imageUrl.startsWith('http')) return imageUrl;
      
      // Remove leading slash if present to avoid double slash with base URL
      const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
      return `${environment.imageBaseUrl}/${cleanUrl}`;
    }
    return 'assets/img/product-placeholder.jpg';
  }

  selectCategory(categoryId: number) {
    this.productsService.selectedCategoryId.set(categoryId);
    this.router.navigate(['/']);
  }

  goHome() {
    this.productsService.selectedCategoryId.set(null);
    this.router.navigate(['/']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
