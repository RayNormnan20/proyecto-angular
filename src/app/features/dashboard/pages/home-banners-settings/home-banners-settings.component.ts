import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeBanner, HomeBannerService } from '../../../../core/services/home-banner.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-home-banners-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Imágenes del Home</h1>
        <button (click)="openModal()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-md">
          <span class="text-xl">+</span> Agregar Imagen
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let banner of banners()" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <img [src]="getImageUrl(banner.image_url)" alt="Banner" class="h-16 w-28 object-cover rounded-md shadow-sm bg-gray-100">
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full"
                      [class.bg-indigo-100]="banner.placement === 'carousel'"
                      [class.text-indigo-800]="banner.placement === 'carousel'"
                      [class.bg-yellow-100]="banner.placement === 'offer' || banner.placement === 'offer_small' || banner.placement === 'offer_large'"
                      [class.text-yellow-800]="banner.placement === 'offer' || banner.placement === 'offer_small' || banner.placement === 'offer_large'">
                  {{ getPlacementLabel(banner.placement) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700 max-w-xs truncate">{{ banner.title || 'Sin título' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-700">{{ banner.sort_order }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  (click)="toggleActive(banner)"
                  [class]="'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ' + (banner.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200')">
                  {{ banner.activo ? 'Activo' : 'Inactivo' }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button (click)="openModal(banner)" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button (click)="deleteBanner(banner.id)" class="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="banners().length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No hay imágenes configuradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="showModal" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <div class="fixed inset-0 transition-opacity" style="background-color: rgba(0, 0, 0, 0.5);" aria-hidden="true" (click)="closeModal()"></div>

          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ editingId ? 'Editar Imagen' : 'Nueva Imagen' }}
                </h3>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500">
                  <span class="text-2xl">&times;</span>
                </button>
              </div>

              <div class="mt-2">
                <form (ngSubmit)="saveBanner()" #form="ngForm">
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">Lugar</label>
                      <select [(ngModel)]="formData.placement" name="placement" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="carousel">Carrusel (Imagen grande)</option>
                        <option value="offer_small">Oferta (lateral pequeña)</option>
                        <option value="offer_large">Oferta (abajo grande)</option>
                        <option value="vendor">Logos (marcas)</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">Título (Opcional)</label>
                      <input [(ngModel)]="formData.title" name="title" type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">Descripción (Opcional)</label>
                      <textarea [(ngModel)]="formData.description" name="description" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Texto Botón (Opcional)</label>
                        <input [(ngModel)]="formData.button_text" name="button_text" type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                      </div>
                      <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Link Botón (Opcional)</label>
                        <input [(ngModel)]="formData.button_link" name="button_link" type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="/products" />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Orden</label>
                        <input [(ngModel)]="formData.sort_order" name="sort_order" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                      </div>
                      <div class="flex items-center mt-7">
                        <input type="checkbox" [(ngModel)]="formData.activo" name="activo" id="activo" class="mr-2">
                        <label for="activo" class="text-gray-700 text-sm font-bold">Activo (Visible en web)</label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">Imagen {{ !editingId ? '(Requerida)' : '(Opcional)' }}</label>
                      <input type="file" (change)="onFileSelected($event)" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                      <p class="text-xs text-gray-500 mt-1">{{ getPlacementHint(formData.placement || 'carousel') }}</p>
                    </div>
                  </div>

                  <div class="flex justify-end pt-4">
                    <button type="button" (click)="closeModal()" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" [disabled]="isSaving || isProcessingImage" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {{ isSaving ? 'Guardando...' : (isProcessingImage ? 'Procesando imagen...' : 'Guardar') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeBannersSettingsComponent {
  private homeBannerService = inject(HomeBannerService);
  private toastService = inject(ToastService);

  banners = signal<HomeBanner[]>([]);

  showModal = false;
  editingId: number | null = null;
  isSaving = false;
  isProcessingImage = false;

  formData: Partial<HomeBanner> = {
    placement: 'carousel',
    title: '',
    description: '',
    button_text: 'Comprar',
    button_link: '/products',
    activo: true,
    sort_order: 0
  };

  selectedFile: File | null = null;

  constructor() {
    this.loadBanners();
  }

  loadBanners() {
    this.homeBannerService.getAll().subscribe({
      next: (data) => this.banners.set(data),
      error: (err) => console.error('Error loading banners', err)
    });
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.imageBaseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  openModal(banner?: HomeBanner) {
    if (banner) {
      this.editingId = banner.id;
      this.formData = {
        placement: banner.placement === 'offer' ? 'offer_small' : banner.placement,
        title: banner.title || '',
        description: banner.description || '',
        button_text: banner.button_text || '',
        button_link: banner.button_link || '',
        activo: banner.activo,
        sort_order: banner.sort_order ?? 0
      };
    } else {
      this.editingId = null;
      this.formData = {
        placement: 'carousel',
        title: '',
        description: '',
        button_text: 'Comprar',
        button_link: '/products',
        activo: true,
        sort_order: 0
      };
    }
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.selectedFile = file;
      void this.processSelectedImage(file);
    }
  }

  getPlacementLabel(placement: string): string {
    if (placement === 'carousel') return 'Carrusel';
    if (placement === 'offer') return 'Oferta (lateral)';
    if (placement === 'offer_small') return 'Oferta (lateral)';
    if (placement === 'offer_large') return 'Oferta (abajo)';
    if (placement === 'vendor') return 'Logos (marcas)';
    return placement;
  }

  getPlacementHint(placement: string): string {
    if (placement === 'offer' || placement === 'offer_small') return 'Oferta lateral: se ajusta automáticamente a 800x400.';
    if (placement === 'offer_large') return 'Oferta abajo: se ajusta automáticamente a 1200x600.';
    if (placement === 'vendor') return 'Logos (marcas): se ajusta automáticamente a 300x200.';
    return 'Carrusel: se ajusta automáticamente a 1200x430.';
  }

  getTargetSize(placement: string): { width: number; height: number } {
    const p = placement === 'offer' ? 'offer_small' : placement;
    if (p === 'offer_small') return { width: 800, height: 400 };
    if (p === 'offer_large') return { width: 1200, height: 600 };
    if (p === 'vendor') return { width: 300, height: 200 };
    return { width: 1200, height: 430 };
  }

  async processSelectedImage(file: File) {
    const placement = String(this.formData.placement || 'carousel');
    const { width, height } = this.getTargetSize(placement);

    try {
      this.isProcessingImage = true;
      const processed = await this.resizeAndCropTo(file, width, height);
      this.selectedFile = processed;
      this.toastService.show(`Imagen ajustada a ${width}x${height}`, 'success');
    } catch (err) {
      console.error(err);
      this.selectedFile = file;
      this.toastService.show('No se pudo ajustar la imagen. Se subirá sin cambios.', 'error');
    } finally {
      this.isProcessingImage = false;
    }
  }

  loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar la imagen'));
      };
      img.src = url;
    });
  }

  async resizeAndCropTo(file: File, targetW: number, targetH: number): Promise<File> {
    const img = await this.loadImageFromFile(file);
    const srcW = img.naturalWidth || 0;
    const srcH = img.naturalHeight || 0;
    if (!srcW || !srcH) throw new Error('Imagen inválida');

    const targetRatio = targetW / targetH;
    const srcRatio = srcW / srcH;

    let cropW = srcW;
    let cropH = srcH;
    let cropX = 0;
    let cropY = 0;

    if (srcRatio > targetRatio) {
      cropW = Math.round(srcH * targetRatio);
      cropX = Math.round((srcW - cropW) / 2);
    } else if (srcRatio < targetRatio) {
      cropH = Math.round(srcW / targetRatio);
      cropY = Math.round((srcH - cropH) / 2);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no soportado');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))),
        'image/jpeg',
        0.9
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}-${targetW}x${targetH}.jpg`, { type: 'image/jpeg' });
  }

  saveBanner() {
    if (!this.editingId && !this.selectedFile) {
      this.toastService.show('La imagen es obligatoria para nuevos registros', 'error');
      return;
    }

    if (!this.formData.placement) {
      this.toastService.show('Selecciona el lugar (Carrusel u Oferta)', 'error');
      return;
    }

    this.isSaving = true;

    if (this.editingId) {
      this.homeBannerService.update(this.editingId, this.formData, this.selectedFile || undefined).subscribe({
        next: (updated) => {
          this.banners.update(list => list.map(b => b.id === updated.id ? updated : b));
          this.toastService.show('Actualizado correctamente', 'success');
          this.closeModal();
          this.isSaving = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Error al actualizar', 'error');
          this.isSaving = false;
        }
      });
      return;
    }

    if (!this.selectedFile) return;
    this.homeBannerService.create(this.formData, this.selectedFile).subscribe({
      next: (created) => {
        this.banners.update(list => [created, ...list]);
        this.toastService.show('Creado correctamente', 'success');
        this.closeModal();
        this.isSaving = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Error al crear', 'error');
        this.isSaving = false;
      }
    });
  }

  deleteBanner(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    this.homeBannerService.delete(id).subscribe({
      next: () => {
        this.banners.update(list => list.filter(b => b.id !== id));
        this.toastService.show('Eliminado correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Error al eliminar', 'error');
      }
    });
  }

  toggleActive(banner: HomeBanner) {
    this.homeBannerService.update(banner.id, { activo: !banner.activo }).subscribe({
      next: (updated) => {
        this.banners.update(list => list.map(b => b.id === updated.id ? updated : b));
        this.toastService.show(`Imagen ${updated.activo ? 'activada' : 'desactivada'} correctamente`, 'success');
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Error al actualizar estado', 'error');
      }
    });
  }
}
