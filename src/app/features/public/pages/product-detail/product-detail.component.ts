import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../products/services/products.service';
import { Product } from '../../../products/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { FavoriteService } from '../../../favorites/services/favorite.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  ProductReview,
  ProductReviewService,
  ProductReviewSummary
} from '../../../../core/services/product-review.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8" *ngIf="product(); else loading">
      <div class="space-y-8">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="md:flex">
            <div class="md:w-1/2 p-4">
              <div class="h-96 bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                <img
                  [src]="currentImage() || getProductImage(product()!)"
                  class="w-full h-full object-contain"
                  alt="Product Image"
                >

                <button
                  (click)="toggleFavorite()"
                  class="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors z-10"
                  [class.text-red-500]="isFavorite()"
                  [class.text-gray-400]="!isFavorite()"
                  [attr.title]="isFavorite() ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" [class.fill-current]="isFavorite()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div class="flex gap-2 overflow-x-auto">
                <img
                  *ngFor="let img of product()!.images"
                  [src]="resolveUrl(img.url)"
                  class="w-20 h-20 object-cover rounded cursor-pointer border hover:border-indigo-500"
                  (click)="setCurrentImage(resolveUrl(img.url))"
                  onerror="this.onerror=null;this.src='assets/img/placeholder.png'"
                >
              </div>
            </div>

            <div class="md:w-1/2 p-8">
              <div class="uppercase tracking-wide text-sm text-indigo-600 font-bold">{{ product()!.brand?.nombre }}</div>
              <h1 class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {{ product()!.nombre }}
              </h1>

              <div class="mt-4 flex flex-wrap items-center gap-3">
                <span class="text-3xl font-bold text-gray-900">S/.{{ product()!.precio }}</span>
                <span *ngIf="product()!.stock > 0" class="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">En Stock ({{ product()!.stock }})</span>
                <span *ngIf="product()!.stock === 0" class="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">Agotado</span>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <div class="flex items-center gap-1">
                  <span *ngFor="let star of stars" class="text-xl" [class.text-amber-400]="star <= getRoundedAverage()" [class.text-gray-300]="star > getRoundedAverage()">
                    ★
                  </span>
                </div>
                <span class="font-semibold text-gray-800">{{ reviewSummary().average || 0 }}</span>
                <span class="text-gray-500">({{ reviewSummary().total }} reseñas)</span>
              </div>

              <p class="mt-6 text-gray-500 text-lg leading-relaxed">
                {{ product()!.descripcion }}
              </p>

              <div class="mt-8 border-t border-gray-200 pt-8">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Categoría: <span class="text-gray-900 font-medium">{{ product()!.category?.nombre }}</span></p>
                    <p class="text-sm text-gray-500">SKU: <span class="text-gray-900 font-medium">{{ product()!.codigo_sku }}</span></p>
                  </div>
                </div>

                <div class="mt-8 space-y-4">
                  <button
                    (click)="addToCart(product()!, $event)"
                    [disabled]="product()!.stock === 0"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {{ product()!.stock === 0 ? 'Agotado' : 'Agregar al Carrito' }}
                  </button>

                  <a
                    [href]="getWhatsappLink(product()!)"
                    target="_blank"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg transition-colors"
                  >
                    <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900">Calificación general</h2>
            <div class="mt-4 flex items-end gap-3">
              <span class="text-5xl font-extrabold text-gray-900">{{ reviewSummary().average || 0 }}</span>
              <span class="text-gray-500 pb-1">/ 5</span>
            </div>
            <div class="mt-3 flex items-center gap-1">
              <span *ngFor="let star of stars" class="text-2xl" [class.text-amber-400]="star <= getRoundedAverage()" [class.text-gray-300]="star > getRoundedAverage()">
                ★
              </span>
            </div>
            <p class="mt-3 text-sm text-gray-500">
              Basado en {{ reviewSummary().total }} reseña{{ reviewSummary().total === 1 ? '' : 's' }}.
            </p>
            <div class="mt-6 space-y-2">
              <div *ngFor="let item of reviewSummary().distribution" class="flex items-center gap-3 text-sm">
                <span class="w-10 text-gray-600">{{ item.estrellas }}★</span>
                <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-400" [style.width.%]="getDistributionWidth(item.total)"></div>
                </div>
                <span class="w-8 text-right text-gray-500">{{ item.total }}</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 class="text-xl font-bold text-gray-900">Opiniones de clientes</h2>
              <span class="text-sm text-gray-500">{{ reviews().length }} comentario{{ reviews().length === 1 ? '' : 's' }}</span>
            </div>

            <div class="mt-6 border border-gray-100 rounded-xl bg-gray-50 p-4 sm:p-5">
              <div *ngIf="!authService.isAuthenticated()" class="space-y-3">
                <p class="text-sm text-gray-600">Inicia sesión para dejar tu reseña con estrellas y comentario.</p>
                <button (click)="goToLogin()" class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  Iniciar sesión
                </button>
              </div>

              <div *ngIf="authService.isAuthenticated() && !canReview() && !myReview()" class="space-y-2">
                <p class="text-sm font-medium text-gray-800">Aún no puedes reseñar este producto.</p>
                <p class="text-sm text-gray-600">Solo los clientes que compraron y recibieron este producto pueden dejar una reseña.</p>
              </div>

              <div *ngIf="authService.isAuthenticated() && (canReview() || myReview())" class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ myReview() ? 'Edita tu reseña' : 'Escribe tu reseña' }}</p>
                  <p class="text-sm text-gray-500">Comparte tu experiencia con este producto.</p>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    *ngFor="let star of stars"
                    type="button"
                    (mouseenter)="hoveredRating.set(star)"
                    (mouseleave)="hoveredRating.set(0)"
                    (click)="selectedRating.set(star)"
                    class="text-3xl leading-none transition-transform hover:scale-110"
                    [class.text-amber-400]="star <= getActiveFormRating()"
                    [class.text-gray-300]="star > getActiveFormRating()"
                  >
                    ★
                  </button>
                </div>

                <textarea
                  [ngModel]="reviewComment()"
                  (ngModelChange)="reviewComment.set($event)"
                  rows="4"
                  class="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Cuéntanos qué te pareció el producto"
                ></textarea>

                <div class="flex flex-col sm:flex-row gap-3">
                  <button
                    (click)="submitReview()"
                    [disabled]="isSavingReview()"
                    class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {{ isSavingReview() ? 'Guardando...' : (myReview() ? 'Actualizar reseña' : 'Publicar reseña') }}
                  </button>
                  <button
                    *ngIf="myReview()"
                    (click)="deleteReview()"
                    [disabled]="isSavingReview()"
                    class="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Eliminar reseña
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-4">
              <div *ngIf="!reviews().length" class="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-gray-500">
                Este producto todavía no tiene reseñas.
              </div>

              <div *ngFor="let review of reviews()" class="rounded-xl border border-gray-100 p-4">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div class="font-semibold text-gray-900">{{ review.user?.nombre || 'Cliente' }}</div>
                    <div class="mt-1 flex items-center gap-1">
                      <span *ngFor="let star of stars" class="text-lg" [class.text-amber-400]="star <= review.puntuacion" [class.text-gray-300]="star > review.puntuacion">
                        ★
                      </span>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ review.created_at | date:'mediumDate' }}
                  </div>
                </div>

                <p class="mt-3 text-sm leading-6 text-gray-700">
                  {{ review.comentario }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="text-center py-20">
        <p class="text-xl text-gray-500">Cargando producto...</p>
      </div>
    </ng-template>
  `
})
export class ProductDetailComponent implements OnInit {
  protected authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private productReviewService = inject(ProductReviewService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  product = signal<Product | null>(null);
  currentImage = signal<string | null>(null);
  isFavorite = signal<boolean>(false);
  reviews = signal<ProductReview[]>([]);
  reviewSummary = signal<ProductReviewSummary>({
    average: 0,
    total: 0,
    distribution: [1, 2, 3, 4, 5].map(star => ({ estrellas: star, total: 0 }))
  });
  myReview = signal<ProductReview | null>(null);
  canReview = signal(false);
  selectedRating = signal(0);
  hoveredRating = signal(0);
  reviewComment = signal('');
  isSavingReview = signal(false);
  imageBaseUrl = environment.imageBaseUrl;
  stars = [1, 2, 3, 4, 5];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(+id);
      }
    });
  }

  loadProduct(id: number) {
    this.productsService.getById(id).subscribe({
      next: (res: Product) => {
        this.product.set(res);
        this.loadReviews(id);
        if (this.authService.isAuthenticated()) {
          this.checkIfFavorite(id);
          this.loadMyReviewStatus(id);
        } else {
          this.myReview.set(null);
          this.canReview.set(false);
          this.selectedRating.set(0);
          this.reviewComment.set('');
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  loadReviews(productId: number) {
    this.productReviewService.getProductReviews(productId).subscribe({
      next: (response) => {
        this.reviews.set(response.reviews);
        this.reviewSummary.set(response.summary);
      },
      error: (err) => console.error('Error loading reviews', err)
    });
  }

  loadMyReviewStatus(productId: number) {
    this.productReviewService.getMyReviewStatus(productId).subscribe({
      next: (response) => {
        this.canReview.set(response.canReview);
        this.myReview.set(response.review);
        this.selectedRating.set(response.review?.puntuacion || 0);
        this.reviewComment.set(response.review?.comentario || '');
      },
      error: (err) => {
        console.error('Error loading review status', err);
        this.canReview.set(false);
        this.myReview.set(null);
      }
    });
  }

  checkIfFavorite(productId: number) {
    this.favoriteService.checkFavorite(productId).subscribe({
      next: (res) => this.isFavorite.set(res.isFavorite),
      error: (err) => console.error('Error checking favorite', err)
    });
  }

  toggleFavorite() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const product = this.product();
    if (!product || !product.id_producto) return;

    if (this.isFavorite()) {
      this.favoriteService.removeFavorite(product.id_producto).subscribe({
        next: () => this.isFavorite.set(false),
        error: (err) => console.error('Error removing favorite', err)
      });
    } else {
      this.favoriteService.addFavorite(product.id_producto).subscribe({
        next: () => this.isFavorite.set(true),
        error: (err) => console.error('Error adding favorite', err)
      });
    }
  }

  getRoundedAverage() {
    return Math.round(this.reviewSummary().average || 0);
  }

  getDistributionWidth(total: number) {
    const summary = this.reviewSummary();
    return summary.total ? (total / summary.total) * 100 : 0;
  }

  getActiveFormRating() {
    return this.hoveredRating() || this.selectedRating();
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  submitReview() {
    const product = this.product();
    if (!product?.id_producto) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.goToLogin();
      return;
    }

    if (!this.canReview() && !this.myReview()) {
      this.toastService.show('Solo puedes reseñar productos que ya compraste y recibiste.', 'error');
      return;
    }

    if (this.selectedRating() < 1 || this.selectedRating() > 5) {
      this.toastService.show('Selecciona una puntuación entre 1 y 5 estrellas.', 'error');
      return;
    }

    if (String(this.reviewComment() || '').trim().length < 3) {
      this.toastService.show('Escribe un comentario de al menos 3 caracteres.', 'error');
      return;
    }

    this.isSavingReview.set(true);
    const payload = {
      puntuacion: this.selectedRating(),
      comentario: String(this.reviewComment() || '').trim()
    };

    const request = this.myReview()
      ? this.productReviewService.updateReview(this.myReview()!.id_resena, payload)
      : this.productReviewService.createReview({
          producto_id: product.id_producto,
          ...payload
        });

    request.subscribe({
      next: () => {
        this.toastService.show(this.myReview() ? 'Reseña actualizada correctamente' : 'Reseña publicada correctamente', 'success');
        this.loadReviews(product.id_producto!);
        this.loadMyReviewStatus(product.id_producto!);
        this.isSavingReview.set(false);
      },
      error: (err) => {
        this.toastService.show(err?.error?.message || 'No se pudo guardar la reseña', 'error');
        this.isSavingReview.set(false);
      }
    });
  }

  deleteReview() {
    const product = this.product();
    const review = this.myReview();
    if (!product?.id_producto || !review) {
      return;
    }

    if (!confirm('¿Deseas eliminar tu reseña de este producto?')) {
      return;
    }

    this.isSavingReview.set(true);
    this.productReviewService.deleteReview(review.id_resena).subscribe({
      next: () => {
        this.toastService.show('Reseña eliminada correctamente', 'success');
        this.selectedRating.set(0);
        this.reviewComment.set('');
        this.loadReviews(product.id_producto!);
        this.loadMyReviewStatus(product.id_producto!);
        this.isSavingReview.set(false);
      },
      error: (err) => {
        this.toastService.show(err?.error?.message || 'No se pudo eliminar la reseña', 'error');
        this.isSavingReview.set(false);
      }
    });
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return this.resolveUrl(product.images[0].url);
    }
    return 'assets/img/placeholder.png';
  }

  resolveUrl(url: string): string {
    if (!url) return 'assets/img/placeholder.png';
    if (url.startsWith('http')) return url;

    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${this.imageBaseUrl}/${cleanUrl}`;
  }

  setCurrentImage(url: string) {
    this.currentImage.set(url);
  }

  getWhatsappLink(product: Product): string {
    const phone = '51999999999';
    const message = `Hola, estoy interesado en el producto: ${product.nombre} (SKU: ${product.codigo_sku})`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  addToCart(product: Product, event?: MouseEvent) {
    if (product.stock > 0) {
      this.cartService.addToCart(product, 1, event);
    }
  }
}
