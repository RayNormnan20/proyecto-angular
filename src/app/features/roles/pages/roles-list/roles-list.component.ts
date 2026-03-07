import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, Role, Permission } from '../../services/roles.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header Responsivo -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Gestión de Roles</h2>
          <p class="text-gray-600 mt-1">Administra los roles y permisos del sistema</p>
        </div>
        <button *ngIf="canCreate()" (click)="openCreateModal()" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center justify-center transition duration-200 transform hover:scale-105">
          <span class="text-xl mr-2">+</span> Nuevo Rol
        </button>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre del Rol
                </th>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descripción
                </th>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuarios
                </th>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th *ngIf="canEdit() || canDelete()" class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let role of roles" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 border-b border-gray-100">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                      {{ role.nombre.charAt(0) | uppercase }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ role.nombre }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 border-b border-gray-100">
                  <p class="text-sm text-gray-600">{{ role.descripcion || 'Sin descripción' }}</p>
                </td>
                <td class="px-6 py-4 border-b border-gray-100 text-center">
                  <span class="py-1 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ role.usersCount }} usuarios
                  </span>
                </td>
                <td class="px-6 py-4 border-b border-gray-100 text-center">
                  <span 
                    class="relative inline-block px-3 py-1 font-semibold leading-tight rounded-full"
                    [ngClass]="role.active ? 'text-green-900 bg-green-200' : 'text-red-900 bg-red-200'"
                  >
                    <span class="relative">{{ role.active ? 'Activo' : 'Inactivo' }}</span>
                  </span>
                </td>
                <td *ngIf="canEdit() || canDelete()" class="px-6 py-4 border-b border-gray-100 text-right text-sm font-medium">
                  <button *ngIf="canEdit()" (click)="editRole(role)" class="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold hover:underline">Editar</button>
                  <button *ngIf="canDelete()" (click)="deleteRole(role)" class="text-red-600 hover:text-red-900 font-semibold hover:underline">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="px-5 py-4 bg-white border-t border-gray-100 flex flex-col xs:flex-row items-center xs:justify-between" *ngIf="roles.length > 0">
          <span class="text-xs xs:text-sm text-gray-600">
            Mostrando {{ roles.length }} registros
          </span>
        </div>
        <div *ngIf="roles.length === 0" class="p-6 text-center text-gray-500">
            No se encontraron roles.
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let role of roles" class="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                {{ role.nombre.charAt(0) | uppercase }}
              </div>
              <div class="ml-3">
                <div class="text-sm font-bold text-gray-900">{{ role.nombre }}</div>
                <div class="text-xs text-gray-500">{{ role.usersCount }} usuarios asignados</div>
              </div>
            </div>
            <span 
              class="px-2 py-1 text-xs font-semibold rounded-full"
              [ngClass]="role.active ? 'text-green-900 bg-green-200' : 'text-red-900 bg-red-200'"
            >
              {{ role.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600 line-clamp-3">{{ role.descripcion || 'Sin descripción' }}</p>
          </div>

          <div *ngIf="canEdit() || canDelete()" class="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button *ngIf="canEdit()" (click)="editRole(role)" class="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors text-center">
              Editar
            </button>
            <button *ngIf="canDelete()" (click)="deleteRole(role)" class="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors text-center">
              Eliminar
            </button>
          </div>
        </div>

        <!-- Empty State Mobile -->
        <div *ngIf="roles.length === 0" class="bg-white p-8 rounded-lg shadow text-center">
          <p class="text-gray-500">No se encontraron roles.</p>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" style="background-color: rgba(0, 0, 0, 0.5);" aria-hidden="true" (click)="closeModal()"></div>

        <!-- Modal panel -->
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-3xl">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ isEditing ? 'Editar Rol' : 'Nuevo Rol' }}
                </h3>
                <div class="mt-4" *ngIf="currentRole">
                  <form (ngSubmit)="saveRole()">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div class="mb-4">
                              <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del Rol</label>
                              <input type="text" id="nombre" name="nombre" [(ngModel)]="currentRole.nombre" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" required>
                            </div>
                            <div class="mb-4">
                              <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
                              <textarea id="descripcion" name="descripcion" [(ngModel)]="currentRole.descripcion" rows="3" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"></textarea>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
                            <div class="border border-gray-200 rounded-md p-3 h-80 overflow-y-auto bg-gray-50">
                                <div *ngFor="let group of permissionGroups" class="mb-4 last:mb-0">
                                    <h4 class="font-bold text-gray-700 mb-2 border-b pb-1 text-sm uppercase tracking-wider">{{ group }}</h4>
                                    <div *ngFor="let perm of groupedPermissions[group]" class="flex items-start mb-2 last:mb-0 pl-2">
                                        <div class="flex items-center h-5">
                                            <input 
                                                [id]="'perm-' + perm.id_permiso" 
                                                type="checkbox" 
                                                [checked]="selectedPermissions.has(perm.id_permiso)"
                                                (change)="togglePermission(perm.id_permiso)"
                                                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                            >
                                        </div>
                                        <div class="ml-3 text-sm">
                                            <label [for]="'perm-' + perm.id_permiso" class="font-medium text-gray-700 cursor-pointer select-none">{{ perm.nombre }}</label>
                                            <p class="text-gray-500 text-xs">{{ perm.descripcion }}</p>
                                        </div>
                                    </div>
                                </div>
                                <div *ngIf="availablePermissions.length === 0" class="text-gray-500 text-sm text-center py-4">
                                    No hay permisos disponibles.
                                </div>
                            </div>
                        </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm" (click)="saveRole()">
              Guardar
            </button>
            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" (click)="closeModal()">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RolesListComponent implements OnInit {
  private rolesService = inject(RolesService);
  private authService = inject(AuthService);
  roles: Role[] = [];
  availablePermissions: Permission[] = [];
  isModalOpen = false;
  currentRole: Partial<Role> | null = null;
  isEditing = false;
  selectedPermissions: Set<number> = new Set();
  groupedPermissions: { [key: string]: Permission[] } = {};
  permissionGroups: string[] = [];

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      }
    });
  }

  loadPermissions() {
    this.rolesService.getPermissions().subscribe({
      next: (data) => {
        this.availablePermissions = data;
        this.groupPermissions();
      },
      error: (error) => {
        console.error('Error fetching permissions:', error);
      }
    });
  }

  groupPermissions() {
    const groups: { [key: string]: Permission[] } = {};
    
    this.availablePermissions.forEach(perm => {
      // Extract group name from permission name (e.g., CREAR_USUARIO -> USUARIO)
      const parts = perm.nombre.split('_');
      let groupName = parts.length > 1 ? parts.slice(1).join(' ') : 'OTROS';
      
      // Normalize group names
      if (groupName.includes('USUARIO')) groupName = 'USUARIOS';
      if (groupName.includes('ROL')) groupName = 'ROLES';
      if (groupName.includes('PRODUCTO')) groupName = 'PRODUCTOS';
      if (groupName.includes('CATEGORIA')) groupName = 'CATEGORÍAS';
      if (groupName.includes('MARCA')) groupName = 'MARCAS';
      if (groupName.includes('ENVIO')) groupName = 'ENVÍOS';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(perm);
    });

    this.groupedPermissions = groups;
    this.permissionGroups = Object.keys(groups).sort();
  }

  canCreate(): boolean {
    return this.authService.hasPermission('CREAR_ROL');
  }

  canEdit(): boolean {
    return this.authService.hasPermission('EDITAR_ROL');
  }

  canDelete(): boolean {
    return this.authService.hasPermission('ELIMINAR_ROL');
  }

  openCreateModal() {
    this.currentRole = {
      nombre: '',
      descripcion: '',
      active: true
    };
    this.selectedPermissions.clear();
    this.isEditing = false;
    this.isModalOpen = true;
  }

  editRole(role: Role) {
    this.currentRole = { ...role };
    this.selectedPermissions.clear();
    if (role.permissions) {
      role.permissions.forEach(p => this.selectedPermissions.add(p.id_permiso));
    }
    this.isEditing = true;
    this.isModalOpen = true;
  }

  togglePermission(id: number) {
    if (this.selectedPermissions.has(id)) {
      this.selectedPermissions.delete(id);
    } else {
      this.selectedPermissions.add(id);
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentRole = null;
    this.isEditing = false;
    this.selectedPermissions.clear();
  }

  saveRole() {
    if (this.currentRole) {
      const roleData = {
        ...this.currentRole,
        permissions: Array.from(this.selectedPermissions)
      };

      if (this.isEditing && this.currentRole.id_rol) {
        this.rolesService.updateRole(this.currentRole.id_rol, roleData).subscribe({
          next: () => {
            this.loadRoles();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating role:', error);
            alert('Error al actualizar rol');
          }
        });
      } else {
        this.rolesService.createRole(roleData).subscribe({
          next: () => {
            this.loadRoles();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating role:', error);
            alert('Error al crear rol');
          }
        });
      }
    }
  }

  deleteRole(role: Role) {
    if (confirm(`¿Estás seguro de que deseas eliminar el rol ${role.nombre}?`)) {
      this.rolesService.deleteRole(role.id_rol).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          alert(error.error?.message || 'Error al eliminar rol');
        }
      });
    }
  }
}
