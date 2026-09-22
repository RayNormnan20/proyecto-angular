import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandingService } from '../../../../core/services/branding.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent {
  branding = inject(BrandingService);

  constructor() {
    this.branding.ensureLoaded();
  }
}
