import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Permission {
  id_permiso: number;
  nombre: string;
  descripcion: string;
}

export interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string;
  usersCount: number;
  active: boolean;
  permissions?: Permission[];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/roles`;
  private permissionsUrl = `${environment.apiUrl}/permissions`;

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.permissionsUrl);
  }

  createRole(role: Omit<Partial<Role>, 'permissions'> & { permissions?: number[] }): Observable<any> {
    return this.http.post(this.apiUrl, role);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateRole(id: number, role: Omit<Partial<Role>, 'permissions'> & { permissions?: number[] }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, role);
  }
}
