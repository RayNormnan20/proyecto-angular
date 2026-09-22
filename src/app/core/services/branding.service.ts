import { Injectable, inject, signal } from '@angular/core';
import { SettingsService } from './settings.service';

const DEFAULT_APP_NAME = 'Nova Vam 3D';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private settingsService = inject(SettingsService);

  readonly appName = signal(DEFAULT_APP_NAME);
  readonly isLoading = signal(false);

  private hasLoaded = false;

  ensureLoaded(force = false) {
    if (this.isLoading()) return;
    if (this.hasLoaded && !force) return;

    this.isLoading.set(true);

    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        const nextName = (settings?.['app_name'] || '').trim() || DEFAULT_APP_NAME;
        this.appName.set(nextName);
        this.hasLoaded = true;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading branding settings', error);
        this.isLoading.set(false);
      }
    });
  }

  refresh() {
    this.ensureLoaded(true);
  }

  applyAppName(value: string) {
    const nextName = value.trim() || DEFAULT_APP_NAME;
    this.appName.set(nextName);
    this.hasLoaded = true;
  }
}
