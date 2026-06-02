import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccessLogItem {
  id_log: number;
  usuario_id: number | null;
  accion: string;
  ip_address?: string | null;
  detalles?: string | null;
  created_at: string;
  user?: {
    id_usuario: number;
    nombre: string;
    apellidos?: string;
    email: string;
  } | null;
}

export interface AccessLogResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  logs: AccessLogItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AccessLogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/access-logs`;

  getLogs(page = 1, limit = 20, accion = ''): Observable<AccessLogResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (accion) {
      params = params.set('accion', accion);
    }

    return this.http.get<AccessLogResponse>(this.apiUrl, { params });
  }
}
