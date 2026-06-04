import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReview, ProductReviewService } from '../../../../core/services/product-review.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-review-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestión de Reseñas</h1>
          <p class="text-sm text-gray-500">Administra qué reseñas se muestran en la web pública.</p>
        </div>
        <button (click)="loadReviews()" class="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Actualizar
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">Total reseñas</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">{{ reviews().length }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">Visibles</div>
          <div class="mt-2 text-3xl font-bold text-emerald-600">{{ visibleCount() }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">Ocultas</div>
          <div class="mt-2 text-3xl font-bold text-amber-600">{{ hiddenCount() }}</div>
        </div>
      </div>

      <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let review of reviews()" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{ review.product?.nombre || 'Producto' }}</div>
                  <div class="text-sm text-gray-500">{{ review.product?.codigo_sku || 'Sin SKU' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ review.user?.nombre || 'Cliente' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-1 text-amber-400">
                    <span *ngFor="let star of stars" [class.text-amber-400]="star <= review.puntuacion" [class.text-gray-300]="star > review.puntuacion">★</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600 max-w-md line-clamp-2">{{ review.comentario }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="review.visible ? 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800' : 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800'">
                    {{ review.visible ? 'Visible' : 'Oculta' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <button
                      (click)="toggleVisibility(review)"
                      [class]="review.visible ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors text-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors text-sm'"
                    >
                      {{ review.visible ? 'Ocultar' : 'Mostrar' }}
                    </button>
                    <button
                      (click)="deleteReview(review)"
                      class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="reviews().length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  No hay reseñas registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="md:hidden space-y-4">
        <div *ngFor="let review of reviews()" class="bg-white rounded-lg shadow border border-gray-100 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-semibold text-gray-900">{{ review.product?.nombre || 'Producto' }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ review.product?.codigo_sku || 'Sin SKU' }}</div>
              <div class="text-sm text-gray-700 mt-2">{{ review.user?.nombre || 'Cliente' }}</div>
            </div>
            <span [class]="review.visible ? 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800' : 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800'">
              {{ review.visible ? 'Visible' : 'Oculta' }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-1 text-lg">
            <span *ngFor="let star of stars" [class.text-amber-400]="star <= review.puntuacion" [class.text-gray-300]="star > review.puntuacion">★</span>
          </div>

          <p class="mt-3 text-sm text-gray-600 leading-6">
            {{ review.comentario }}
          </p>

          <div class="mt-4 flex gap-2">
            <button
              (click)="toggleVisibility(review)"
              [class]="review.visible ? 'flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors text-sm' : 'flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors text-sm'"
            >
              {{ review.visible ? 'Ocultar' : 'Mostrar' }}
            </button>
            <button
              (click)="deleteReview(review)"
              class="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>

        <div *ngIf="reviews().length === 0" class="bg-white rounded-lg shadow border border-gray-100 p-6 text-center text-gray-500">
          No hay reseñas registradas.
        </div>
      </div>
    </div>
  `
})
export class ProductReviewSettingsComponent {
  private productReviewService = inject(ProductReviewService);
  private toastService = inject(ToastService);

  reviews = signal<ProductReview[]>([]);
  stars = [1, 2, 3, 4, 5];

  constructor() {
    this.loadReviews();
  }

  visibleCount() {
    return this.reviews().filter(review => review.visible).length;
  }

  hiddenCount() {
    return this.reviews().filter(review => !review.visible).length;
  }

  loadReviews() {
    this.productReviewService.getAdminReviews().subscribe({
      next: (reviews) => this.reviews.set(reviews),
      error: (err) => {
        console.error('Error loading product reviews', err);
        this.toastService.show('No se pudieron cargar las reseñas', 'error');
      }
    });
  }

  toggleVisibility(review: ProductReview) {
    this.productReviewService.updateVisibility(review.id_resena, !review.visible).subscribe({
      next: (updatedReview) => {
        this.reviews.update(list => list.map(item => item.id_resena === updatedReview.id_resena ? updatedReview : item));
        this.toastService.show(`Reseña ${updatedReview.visible ? 'visible' : 'oculta'} correctamente`, 'success');
      },
      error: (err) => {
        console.error('Error updating review visibility', err);
        this.toastService.show(err?.error?.message || 'No se pudo actualizar la visibilidad', 'error');
      }
    });
  }

  deleteReview(review: ProductReview) {
    if (!confirm(`¿Deseas eliminar la reseña de ${review.user?.nombre || 'este cliente'}?`)) {
      return;
    }

    this.productReviewService.deleteAdminReview(review.id_resena).subscribe({
      next: () => {
        this.reviews.update(list => list.filter(item => item.id_resena !== review.id_resena));
        this.toastService.show('Reseña eliminada correctamente', 'success');
      },
      error: (err) => {
        console.error('Error deleting review', err);
        this.toastService.show(err?.error?.message || 'No se pudo eliminar la reseña', 'error');
      }
    });
  }
}
