import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../products/services/products.service';
import { Product, Category } from '../../../products/models/product.model';
import { CategoriesService } from '../../../products/services/categories.service';
import { CartService } from '../../../../core/services/cart.service';
import { FavoriteService } from '../../../favorites/services/favorite.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [],
  template: `
    <!-- CAROUSEL & OFFERS -->
    <div class="container mx-auto px-4 mb-8 pt-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Carousel -->
        <div class="lg:col-span-2">
          <div class="relative w-full h-[430px] bg-gray-200 overflow-hidden group">
            <!-- Slides -->
            <div *ngFor="let slide of slides(); let i = index" 
                 class="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
                 [class.opacity-0]="currentSlide() !== i"
                 [class.opacity-100]="currentSlide() === i">
              <img [src]="slide.img" class="w-full h-full object-cover" 
                   onerror="this.onerror=null;this.src='assets/img/carousel-1.jpg'">
              <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                <h1 class="text-4xl md:text-6xl text-white font-bold mb-3 uppercase animate-fade-in-down">{{ slide.title }}</h1>
                <p class="text-white text-lg mb-4 mx-auto max-w-lg animate-bounce-in">{{ slide.desc }}</p>
                <a [routerLink]="slide.link" class="inline-block px-6 py-2 border-2 border-white text-white font-medium hover:bg-white hover:text-gray-900 transition-colors uppercase tracking-wider animate-fade-in-up">Comprar Ahora</a>
              </div>
            </div>

            <!-- Controls -->
            <button (click)="prevSlide()" class="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-transparent border border-white text-white hover:bg-white hover:text-gray-900 transition-colors z-10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button (click)="nextSlide()" class="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-transparent border border-white text-white hover:bg-white hover:text-gray-900 transition-colors z-10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>

            <!-- Indicators -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              <button *ngFor="let slide of slides(); let i = index" 
                      (click)="currentSlide.set(i)"
                      class="w-3 h-3 rounded-full transition-colors"
                      [class.bg-[#FFD333]]="currentSlide() === i"
                      [class.bg-white]="currentSlide() !== i">
              </button>
            </div>
          </div>
        </div>

        <!-- Special Offers -->
        <div class="lg:col-span-1 flex flex-col gap-8 h-full">
          <div class="relative h-[200px] bg-gray-200 overflow-hidden group flex-1">
            <img src="assets/img/offer-1.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                 onerror="this.onerror=null;this.src='assets/img/offer-1.jpg'">
            <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
              <h6 class="text-white text-uppercase font-medium tracking-wider mb-2">Ahorra 20%</h6>
              <h3 class="text-white text-2xl font-bold mb-3">Oferta Especial</h3>
              <a routerLink="/products" class="inline-block px-4 py-2 bg-[#FFD333] text-gray-900 text-sm font-bold uppercase hover:bg-yellow-400 transition-colors">Comprar</a>
            </div>
          </div>
          <div class="relative h-[200px] bg-gray-200 overflow-hidden group flex-1">
            <img src="assets/img/offer-2.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                 onerror="this.onerror=null;this.src='assets/img/offer-2.jpg'">
            <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
              <h6 class="text-white text-uppercase font-medium tracking-wider mb-2">Ahorra 20%</h6>
              <h3 class="text-white text-2xl font-bold mb-3">Oferta Especial</h3>
              <a routerLink="/products" class="inline-block px-4 py-2 bg-[#FFD333] text-gray-900 text-sm font-bold uppercase hover:bg-yellow-400 transition-colors">Comprar</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FEATURES -->
    <div class="container mx-auto px-4 py-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div class="flex items-center p-6 bg-white shadow-sm border border-gray-100">
          <svg class="w-10 h-10 text-yellow-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <h5 class="font-bold text-gray-800 m-0">Calidad Garantizada</h5>
        </div>
        <div class="flex items-center p-6 bg-white shadow-sm border border-gray-100">
          <svg class="w-10 h-10 text-yellow-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
          <h5 class="font-bold text-gray-800 m-0">Envío Gratis</h5>
        </div>
        <div class="flex items-center p-6 bg-white shadow-sm border border-gray-100">
          <svg class="w-10 h-10 text-yellow-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          <h5 class="font-bold text-gray-800 m-0">Devolución 14 días</h5>
        </div>
        <div class="flex items-center p-6 bg-white shadow-sm border border-gray-100">
          <svg class="w-10 h-10 text-yellow-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <h5 class="font-bold text-gray-800 m-0">Soporte 24/7</h5>
        </div>
      </div>
    </div>

    <!-- CATEGORIES -->
    <div class="container mx-auto px-4 py-5">
      <div class="relative mb-8 text-center">
        <h2 class="text-3xl font-bold uppercase text-gray-800 inline-block px-4 bg-[#FAF8F4] relative z-10">Categorías</h2>
        <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 -z-0"></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div *ngFor="let cat of categories()" class="group cursor-pointer" (click)="filterByCategory(cat.id_categoria!)">
          <div class="flex items-center bg-white mb-4 transition-all duration-300 hover:shadow-md" [class.bg-yellow-50]="selectedCategoryId() === cat.id_categoria">
            <div class="w-[100px] h-[100px] overflow-hidden relative">
               <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    [src]="getCategoryImage(cat)" 
                    [alt]="cat.nombre"
                    onerror="this.onerror=null;this.src='assets/img/cat-placeholder.jpg'">
            </div>
            <div class="flex-1 pl-3">
                <h6 class="text-base font-semibold text-gray-800 m-0 group-hover:text-[#C9A84C] transition-colors">{{cat.nombre}}</h6>
                <small class="text-gray-500">Ver Productos</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-container *ngIf="!selectedCategoryId()">
      <!-- FEATURED PRODUCTS -->
      <div class="container mx-auto px-4 py-10">
        <div class="relative mb-8 text-center">
          <h2 class="text-3xl font-bold uppercase text-gray-800 inline-block px-4 bg-[#FAF8F4] relative z-10">Productos Destacados</h2>
          <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 -z-0"></div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div *ngFor="let product of featuredProducts()" class="bg-white mb-0 group transition-shadow hover:shadow-lg product-item">
            <!-- Product Card Content -->
            <div class="relative overflow-hidden aspect-[1/1] bg-white product-img p-4">
              <img class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                   [src]="getProductImage(product)" [alt]="product.nombre">
              
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button (click)="addToCart(product, $event)" 
                        class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-0" 
                        title="Agregar al carrito">
                   <i class="fa fa-shopping-cart"></i>
                </button>
                <button (click)="toggleFavorite(product, $event)" 
                        class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-100" 
                        [class.text-red-500]="isFavorite(product.id_producto)"
                        [class.border-red-500]="isFavorite(product.id_producto)">
                   <i [class]="isFavorite(product.id_producto) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                <a [routerLink]="['/product', product.id_producto]" 
                   class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-200">
                   <i class="fa fa-search"></i>
                </a>
              </div>
  
              <!-- Badges -->
              <span *ngIf="product.stock === 0" class="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase">Agotado</span>
              <span *ngIf="product.stock > 0 && product.stock < 5" class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">Últimas</span>
            </div>
            
            <div class="text-center py-4 px-3">
              <a [routerLink]="['/product', product.id_producto]" class="block text-lg font-medium text-gray-800 hover:text-[#C9A84C] truncate mb-1 transition-colors">{{product.nombre}}</a>
              <div class="flex justify-center items-center gap-2 mb-2">
                  <h5 class="text-lg font-bold text-gray-900 m-0">S/. {{product.precio}}</h5>
              </div>
              <div class="flex justify-center text-[#C9A84C] text-xs items-center">
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <span class="text-gray-500 ml-1">(99)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- OFFER BANNERS -->
      <div class="container mx-auto px-4 py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="relative h-[300px] bg-gray-200 overflow-hidden group">
            <img src="assets/img/offer-1.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                 onerror="this.onerror=null;this.src='assets/img/offer-1.jpg'">
            <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
              <h6 class="text-white text-uppercase font-medium tracking-wider mb-2">Ahorra 20%</h6>
              <h3 class="text-white text-3xl font-bold mb-3">Oferta Especial</h3>
              <a routerLink="/products" class="inline-block px-6 py-2 bg-[#FFD333] text-gray-900 font-bold uppercase hover:bg-yellow-400 transition-colors">Comprar Ahora</a>
            </div>
          </div>
          <div class="relative h-[300px] bg-gray-200 overflow-hidden group">
            <img src="assets/img/offer-2.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                 onerror="this.onerror=null;this.src='assets/img/offer-2.jpg'">
            <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
              <h6 class="text-white text-uppercase font-medium tracking-wider mb-2">Ahorra 20%</h6>
              <h3 class="text-white text-3xl font-bold mb-3">Oferta Especial</h3>
              <a routerLink="/products" class="inline-block px-6 py-2 bg-[#FFD333] text-gray-900 font-bold uppercase hover:bg-yellow-400 transition-colors">Comprar Ahora</a>
            </div>
          </div>
        </div>
      </div>
  
      <!-- RECENT PRODUCTS -->
      <div class="container mx-auto px-4 py-10">
        <div class="relative mb-8 text-center">
          <h2 class="text-3xl font-bold uppercase text-gray-800 inline-block px-4 bg-[#FAF8F4] relative z-10">Productos Recientes</h2>
          <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 -z-0"></div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div *ngFor="let product of recentProducts()" class="bg-white mb-0 group transition-shadow hover:shadow-lg product-item">
            <!-- Product Card Content (Same as above) -->
            <div class="relative overflow-hidden aspect-[1/1] bg-white product-img p-4">
              <img class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                   [src]="getProductImage(product)" [alt]="product.nombre">
              
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button (click)="addToCart(product, $event)" 
                        class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-0" 
                        title="Agregar al carrito">
                   <i class="fa fa-shopping-cart"></i>
                </button>
                <button (click)="toggleFavorite(product, $event)" 
                        class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-100" 
                        [class.text-red-500]="isFavorite(product.id_producto)"
                        [class.border-red-500]="isFavorite(product.id_producto)">
                   <i [class]="isFavorite(product.id_producto) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                <a [routerLink]="['/product', product.id_producto]" 
                   class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-200">
                   <i class="fa fa-search"></i>
                </a>
              </div>
  
              <span *ngIf="product.stock === 0" class="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase">Agotado</span>
              <span *ngIf="product.stock > 0 && product.stock < 5" class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">Últimas</span>
            </div>
            
            <div class="text-center py-4 px-3">
              <a [routerLink]="['/product', product.id_producto]" class="block text-lg font-medium text-gray-800 hover:text-[#C9A84C] truncate mb-1 transition-colors">{{product.nombre}}</a>
              <div class="flex justify-center items-center gap-2 mb-2">
                  <h5 class="text-lg font-bold text-gray-900 m-0">S/. {{product.precio}}</h5>
              </div>
              <div class="flex justify-center text-[#C9A84C] text-xs items-center">
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <small class="fa fa-star mr-1"></small>
                  <span class="text-gray-500 ml-1">(99)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VENDOR LOGOS -->
      <div class="container mx-auto px-4 py-10">
        <div class="relative overflow-hidden group">
           <!-- Scroll Container -->
           <div class="flex gap-6 animate-marquee whitespace-nowrap hover:pause-animation">
              <!-- Original Vendors -->
              <div *ngFor="let vendor of vendors()" class="inline-block flex-shrink-0 bg-white p-4 shadow-sm border border-gray-100 w-[150px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                  <img [src]="vendor.img" [alt]="vendor.name" class="max-w-full max-h-full object-contain"
                       onerror="this.onerror=null;this.src='assets/img/vendor-1.jpg'">
              </div>
              <!-- Duplicate for Infinite Loop -->
              <div *ngFor="let vendor of vendors()" class="inline-block flex-shrink-0 bg-white p-4 shadow-sm border border-gray-100 w-[150px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                  <img [src]="vendor.img" [alt]="vendor.name" class="max-w-full max-h-full object-contain"
                       onerror="this.onerror=null;this.src='assets/img/vendor-1.jpg'">
              </div>
           </div>
        </div>
      </div>
    </ng-container>

    <!-- FILTERED PRODUCTS LIST -->
    <div *ngIf="selectedCategoryId()" class="container mx-auto px-4 py-10">
        <!-- Header for Filtered List -->
        <div class="relative mb-8 text-center" id="filtered-products-title">
            <h2 class="text-3xl font-bold uppercase text-gray-800 inline-block px-4 bg-[#FAF8F4] relative z-10">
                Productos Filtrados
            </h2>
            <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 -z-0"></div>
        </div>
        
        <!-- Filtered Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div *ngFor="let product of products()" class="bg-white mb-0 group transition-shadow hover:shadow-lg product-item">
                 <!-- Same Card Template -->
                 <div class="relative overflow-hidden aspect-[1/1] bg-white product-img p-4">
               <img class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        [src]="getProductImage(product)" [alt]="product.nombre">
                    
                    <div class="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button (click)="addToCart(product, $event)" 
                            class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-0" 
                            title="Agregar al carrito">
                        <i class="fa fa-shopping-cart"></i>
                    </button>
                    <button (click)="toggleFavorite(product, $event)" 
                            class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-100" 
                            [class.text-red-500]="isFavorite(product.id_producto)"
                            [class.border-red-500]="isFavorite(product.id_producto)">
                        <i [class]="isFavorite(product.id_producto) ? 'fas fa-heart' : 'far fa-heart'"></i>
                    </button>
                    <a [routerLink]="['/product', product.id_producto]" 
                        class="w-10 h-10 bg-transparent text-gray-800 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-200">
                        <i class="fa fa-search"></i>
                    </a>
                    </div>

                    <span *ngIf="product.stock === 0" class="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase">Agotado</span>
                    <span *ngIf="product.stock > 0 && product.stock < 5" class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">Últimas</span>
                </div>
                
                <div class="text-center py-4 px-3">
                    <a [routerLink]="['/product', product.id_producto]" class="block text-lg font-medium text-gray-800 hover:text-[#C9A84C] truncate mb-1 transition-colors">{{product.nombre}}</a>
                    <div class="flex justify-center items-center gap-2 mb-2">
                        <h5 class="text-lg font-bold text-gray-900 m-0">S/. {{product.precio}}</h5>
                    </div>
                    <div class="flex justify-center text-[#C9A84C] text-xs items-center">
                        <small class="fa fa-star mr-1"></small>
                        <small class="fa fa-star mr-1"></small>
                        <small class="fa fa-star mr-1"></small>
                        <small class="fa fa-star mr-1"></small>
                        <small class="fa fa-star mr-1"></small>
                        <span class="text-gray-500 ml-1">(99)</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages() > 1" class="flex justify-center mt-8 gap-2">
            <button 
                (click)="changePage(currentPage() - 1)" 
                [disabled]="currentPage() === 1"
                class="px-4 py-2 border rounded-md text-sm font-medium transition-colors"
                [class.text-gray-400]="currentPage() === 1"
                [class.border-gray-200]="currentPage() === 1"
                [class.cursor-not-allowed]="currentPage() === 1"
                [class.hover:bg-gray-50]="currentPage() !== 1"
                [class.text-gray-700]="currentPage() !== 1"
                [class.border-gray-300]="currentPage() !== 1">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            <ng-container *ngFor="let page of getPages()">
                <button 
                    *ngIf="page === 1 || page === totalPages() || (page >= currentPage() - 1 && page <= currentPage() + 1)"
                    (click)="changePage(page)"
                    class="px-4 py-2 border rounded-md text-sm font-medium transition-colors"
                    [class.bg-yellow-500]="currentPage() === page"
                    [class.text-white]="currentPage() === page"
                    [class.border-yellow-500]="currentPage() === page"
                    [class.text-gray-700]="currentPage() !== page"
                    [class.hover:bg-gray-50]="currentPage() !== page"
                    [class.border-gray-300]="currentPage() !== page">
                    {{ page }}
                </button>
                <span *ngIf="(page === 1 && currentPage() > 3) || (page === totalPages() && currentPage() < totalPages() - 2)" 
                      class="px-2 py-2 text-gray-400">...</span>
            </ng-container>

            <button 
                (click)="changePage(currentPage() + 1)" 
                [disabled]="currentPage() === totalPages()"
                class="px-4 py-2 border rounded-md text-sm font-medium transition-colors"
                [class.text-gray-400]="currentPage() === totalPages()"
                [class.border-gray-200]="currentPage() === totalPages()"
                [class.cursor-not-allowed]="currentPage() === totalPages()"
                [class.hover:bg-gray-50]="currentPage() !== totalPages()"
                [class.text-gray-700]="currentPage() !== totalPages()"
                [class.border-gray-300]="currentPage() !== totalPages()">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="products().length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-20 h-20 border border-yellow-200 rounded-full flex items-center justify-center mb-6 text-yellow-600">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
            </div>
            <h3 class="text-2xl font-serif text-gray-800 mb-2">Sin resultados</h3>
            <p class="text-gray-500 max-w-xs mb-6">No encontramos productos en esta categoría.</p>
            <button class="border border-yellow-600 text-yellow-700 px-6 py-2 uppercase text-xs font-bold tracking-wider hover:bg-yellow-600 hover:text-white transition-colors" (click)="filterByCategory(null)">
            Ver todos los productos
            </button>
        </div>
    </div>

    <!-- FOOTER REMOVED - Handled by PublicLayout -->
  `
})
export class HomeComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  public authService = inject(AuthService);
  apiUrl = environment.apiUrl;
  imageBaseUrl = environment.imageBaseUrl || 'http://localhost:3000';

  slides = signal([
    {
      img: 'assets/img/carousel-1.jpg',
      title: 'Moda Masculina',
      desc: 'Descubre las últimas tendencias en ropa para hombres.',
      link: '/products'
    },
    {
      img: 'assets/img/carousel-2.jpg',
      title: 'Moda Femenina',
      desc: 'Elegancia y estilo para cada ocasión.',
      link: '/products'
    },
    {
      img: 'assets/img/carousel-3.jpg',
      title: 'Moda Infantil',
      desc: 'Ropa cómoda y divertida para los más pequeños.',
      link: '/products'
    }
  ]);
  currentSlide = signal(0);
  
  products = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);
  recentProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategoryId = signal<number | null>(null);
  favorites = signal<Set<number>>(new Set());
  searchTerm: string = '';
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalProducts = signal(0);
  totalPages = signal(0);
  
  // Vendors Logic
  vendors = signal([
    { name: 'Vendor 1', img: 'assets/img/vendor-1.jpg' },
    { name: 'Vendor 2', img: 'assets/img/vendor-2.jpg' },
    { name: 'Vendor 3', img: 'assets/img/vendor-3.jpg' },
    { name: 'Vendor 4', img: 'assets/img/vendor-4.jpg' },
    { name: 'Vendor 5', img: 'assets/img/vendor-5.jpg' },
    { name: 'Vendor 6', img: 'assets/img/vendor-6.jpg' },
    { name: 'Vendor 7', img: 'assets/img/vendor-7.jpg' },
    { name: 'Vendor 8', img: 'assets/img/vendor-8.jpg' },
  ]);
  
  ngOnInit() {
    this.loadCategories();
    this.loadFeaturedProducts();
    this.loadRecentProducts();
    if (this.authService.isAuthenticated()) {
      this.loadFavorites();
    }
    
    // Auto-advance carousel
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  prevSlide() {
    this.currentSlide.update(curr => (curr === 0 ? this.slides().length - 1 : curr - 1));
  }

  nextSlide() {
    this.currentSlide.update(curr => (curr === this.slides().length - 1 ? 0 : curr + 1));
  }

  loadFeaturedProducts() {
    const params: any = { limit: 8, sort: 'price_desc' };
    this.productsService.getAll(params).subscribe({
      next: (response) => {
        this.featuredProducts.set(response.products || []);
      },
      error: (err) => console.error('Error loading featured products', err)
    });
  }

  loadRecentProducts() {
    const params: any = { limit: 10 }; // default sort is created_at DESC
    this.productsService.getAll(params).subscribe({
      next: (response) => {
        this.recentProducts.set(response.products || []);
      },
      error: (err) => console.error('Error loading recent products', err)
    });
  }

  loadFavorites() {
    this.favoriteService.getFavorites().subscribe({
      next: (favs) => {
        const ids = new Set(favs.map(f => f.id_producto!));
        this.favorites.set(ids);
      },
      error: (err) => console.error('Error loading favorites', err)
    });
  }

  isFavorite(productId: number | undefined): boolean {
    return productId ? this.favorites().has(productId) : false;
  }

  toggleFavorite(product: Product, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para agregar a favoritos');
      return;
    }

    if (!product.id_producto) return;

    if (this.isFavorite(product.id_producto)) {
      this.favoriteService.removeFavorite(product.id_producto).subscribe({
        next: () => {
          const current = new Set(this.favorites());
          current.delete(product.id_producto!);
          this.favorites.set(current);
        },
        error: (err) => console.error('Error removing favorite', err)
      });
    } else {
      this.favoriteService.addFavorite(product.id_producto).subscribe({
        next: () => {
          const current = new Set(this.favorites());
          current.add(product.id_producto!);
          this.favorites.set(current);
        },
        error: (err) => console.error('Error adding favorite', err)
      });
    }
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error loading categories', err)
    });
  }

  getPages(): number[] {
    return Array.from({length: this.totalPages()}, (_, i) => i + 1);
  }

  loadProducts() {
    const params: any = { 
      search: this.searchTerm,
      limit: this.pageSize(),
      page: this.currentPage()
    };
    
    if (this.selectedCategoryId()) {
      params.category = this.selectedCategoryId();
    }
    
    this.productsService.getAll(params).subscribe({
      next: (response) => {
        this.products.set(response.products || []);
        this.totalProducts.set(response.total || 0);
        this.totalPages.set(response.totalPages || 0);
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
      // Scroll to top of filtered products
      setTimeout(() => {
        const element = document.getElementById('filtered-products-title');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategoryId.set(categoryId);
    this.searchTerm = '';
    this.currentPage.set(1);
    if (categoryId) {
      this.loadProducts();
    }
  }

  getCategoryImage(category: Category): string {
    if (category.imagen) {
      return `${this.imageBaseUrl}${category.imagen}`;
    }
    return 'assets/img/cat-placeholder.jpg';
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return `${this.imageBaseUrl}${product.images[0].url}`;
    }
    return 'assets/img/placeholder.png';
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation(); // Prevenir navegación al detalle
    if (product.stock > 0) {
      this.cartService.addToCart(product);
      // Opcional: Mostrar feedback visual (toast, animación, etc.)
    }
  }
}
