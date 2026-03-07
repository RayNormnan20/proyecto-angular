import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Settings {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings`;

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(this.apiUrl);
  }

  updateSettings(settings: Settings): Observable<any> {
    return this.http.put(this.apiUrl, settings);
  }

  uploadQr(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/upload-qr`, formData);
  }
}
