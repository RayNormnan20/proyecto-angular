import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface EmailLog {
  id: number;
  destinatario: string;
  asunto: string;
  contenido: string;
  estado: 'enviado' | 'fallido';
  error_mensaje?: string;
  fecha_envio: string;
  tipo?: 'orden' | 'bienvenida' | 'test' | 'otro';
  referencia_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmailLogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/email-logs`;

  getLogs(): Observable<EmailLog[]> {
    return this.http.get<EmailLog[]>(this.apiUrl);
  }

  resendEmail(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/resend`, {});
  }
}
