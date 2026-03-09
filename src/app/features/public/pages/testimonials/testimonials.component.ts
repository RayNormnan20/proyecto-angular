import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialService, Testimonial } from '../../../../core/services/testimonial.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-10">
      <div class="relative mb-8 text-center">
        <h2 class="text-3xl font-bold uppercase text-gray-800 inline-block px-4 bg-white relative z-10">Clientes Satisfechos</h2>
        <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 -z-0"></div>
      </div>

      <div *ngIf="testimonials().length > 0; else noTestimonials" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div *ngFor="let item of testimonials()" class="group relative overflow-hidden rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <!-- Image Container - Aspect Ratio 3:4 or Square -->
          <div class="aspect-[3/4] w-full overflow-hidden bg-gray-100 relative">
            <img [src]="getTestimonialImage(item)" [alt]="item.mensaje || 'Cliente Satisfecho'" 
                 class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 onerror="this.onerror=null;this.src='assets/img/user.jpg'">
            
            <!-- Overlay with Message (appears on hover or always visible at bottom) -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
               <p class="text-white text-sm font-medium line-clamp-3 italic">"{{ item.mensaje }}"</p>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #noTestimonials>
        <div class="text-center py-10">
          <p class="text-gray-500">No hay testimonios disponibles en este momento.</p>
        </div>
      </ng-template>
    </div>
  `
})
export class TestimonialsComponent implements OnInit {
  private testimonialService = inject(TestimonialService);
  imageBaseUrl = environment.imageBaseUrl;
  
  testimonials = signal<Testimonial[]>([]);

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.testimonialService.getAll(true).subscribe({
      next: (data) => this.testimonials.set(data),
      error: (err) => console.error('Error loading testimonials', err)
    });
  }

  getTestimonialImage(testimonial: Testimonial): string {
    if (!testimonial.imagen_url) return 'assets/img/user.jpg'; // Fallback
    if (testimonial.imagen_url.startsWith('http')) {
      return testimonial.imagen_url;
    }
    // Ensure slash
    const url = testimonial.imagen_url.startsWith('/') ? testimonial.imagen_url : `/${testimonial.imagen_url}`;
    return `${this.imageBaseUrl}${url}`;
  }
}
