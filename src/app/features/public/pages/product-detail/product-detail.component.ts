import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../products/services/products.service';
import { Product } from '../../../products/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8" *ngIf="product(); else loading">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="md:flex">
          <!-- Image Gallery -->
          <div class="md:w-1/2 p-4">
            <div class="h-96 bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
              <img 
                [src]="currentImage() || getProductImage(product()!)" 
                class="w-full h-full object-contain"
                alt="Product Image"
              >
            </div>
            <div class="flex gap-2 overflow-x-auto">
              <img 
                *ngFor="let img of product()!.images" 
                [src]="apiUrl + img.url" 
                class="w-20 h-20 object-cover rounded cursor-pointer border hover:border-blue-500"
                (click)="setCurrentImage(apiUrl + img.url)"
              >
            </div>
          </div>

          <!-- Product Info -->
          <div class="md:w-1/2 p-8">
            <div class="uppercase tracking-wide text-sm text-blue-600 font-bold">{{ product()!.brand?.nombre }}</div>
            <h1 class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {{ product()!.nombre }}
            </h1>
            <div class="mt-4">
              <span class="text-3xl font-bold text-gray-900">\${{ product()!.precio }}</span>
              <span *ngIf="product()!.stock > 0" class="ml-4 text-sm text-green-600 bg-green-100 px-2 py-1 rounded">En Stock ({{ product()!.stock }})</span>
              <span *ngIf="product()!.stock === 0" class="ml-4 text-sm text-red-600 bg-red-100 px-2 py-1 rounded">Agotado</span>
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

              <div class="mt-8">
                <a 
                  [href]="getWhatsappLink(product()!)" 
                  target="_blank"
                  class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg transition-colors"
                >
                  <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Consultar por WhatsApp
                </a>
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
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);

  product = signal<Product | null>(null);
  currentImage = signal<string | null>(null);
  apiUrl = 'http://localhost:3000'; // Ajustar con environment

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
      next: (res: Product) => this.product.set(res),
      error: (err: any) => console.error(err)
    });
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return `${this.apiUrl}${product.images[0].url}`;
    }
    return 'assets/placeholder.png';
  }

  setCurrentImage(url: string) {
    this.currentImage.set(url);
  }

  getWhatsappLink(product: Product): string {
    const phone = '51999999999'; // Reemplazar con el número real de la empresa
    const message = `Hola, estoy interesado en el producto: ${product.nombre} (SKU: ${product.codigo_sku})`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}
