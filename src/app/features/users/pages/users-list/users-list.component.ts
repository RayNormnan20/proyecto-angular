
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RolesService, Role } from '../../../roles/services/roles.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Lista de Usuarios</h2>
          <p class="text-gray-600 mt-1">Gestiona los usuarios registrados en el sistema</p>
        </div>
        <button *ngIf="canCreate()" (click)="openCreateModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center transition duration-200 transform hover:scale-105">
          <span class="text-xl mr-2">+</span> Nuevo Usuario
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th *ngIf="canEdit() || canDelete()" class="px-6 py-4 border-b-2 border-gray-100 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 border-b border-gray-100">
                  <div class="flex items-center">
                    <div class="shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                      {{ user.nombre.charAt(0) | uppercase }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.nombre }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 border-b border-gray-100">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ user.role?.nombre || 'Sin Rol' }}
                  </span>
                </td>
                <td class="px-6 py-4 border-b border-gray-100 text-center">
                  <span 
                    class="relative inline-block px-3 py-1 font-semibold leading-tight rounded-full"
                    [ngClass]="{
                      'text-green-900 bg-green-200': user.estado === 'activo',
                      'text-red-900 bg-red-200': user.estado === 'suspendido' || user.estado === 'inactivo'
                    }"
                  >
                    <span class="relative">{{ user.estado | titlecase }}</span>
                  </span>
                </td>
                <td class="px-6 py-4 border-b border-gray-100 text-sm text-gray-600">
                  {{ user.created_at | date:'mediumDate' }}
                </td>
                <td *ngIf="canEdit() || canDelete()" class="px-6 py-4 border-b border-gray-100 text-right text-sm font-medium">
                  <button *ngIf="canEdit()" (click)="editUser(user)" class="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold hover:underline">Editar</button>
                  <button *ngIf="canDelete()" (click)="deleteUser(user)" class="text-red-600 hover:text-red-900 font-semibold hover:underline">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-5 py-4 bg-white border-t border-gray-100 flex flex-col xs:flex-row items-center xs:justify-between" *ngIf="users.length > 0">
          <span class="text-xs xs:text-sm text-gray-600">
            Mostrando {{ users.length }} registros
          </span>
        </div>
        <div *ngIf="users.length === 0" class="p-6 text-center text-gray-500">
            No se encontraron usuarios.
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" style="background-color: rgba(0, 0, 0, 0.5);" aria-hidden="true" (click)="closeModal()"></div>

        <!-- Modal panel -->
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
                  </h3>
                  <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span class="sr-only">Cerrar</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div class="mt-4" *ngIf="currentUser">
                  <form (ngSubmit)="saveUser()">
                    <div class="mb-4">
                      <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
                      <input type="text" id="nombre" name="nombre" [(ngModel)]="currentUser.nombre" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" required>
                    </div>
                    <div class="mb-4">
                      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" id="email" name="email" [(ngModel)]="currentUser.email" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" required>
                    </div>
                    <div class="mb-4" *ngIf="!isEditing">
                      <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                      <input type="password" id="password" name="password" [(ngModel)]="currentUser.password" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" required>
                    </div>
                    <div class="mb-4">
                      <label for="rol" class="block text-sm font-medium text-gray-700">Rol</label>
                      <select id="rol" name="rol" [(ngModel)]="currentUser.rol_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option [ngValue]="undefined" disabled>Seleccionar Rol</option>
                        <option *ngFor="let role of roles" [value]="role.id_rol">{{ role.nombre }}</option>
                      </select>
                    </div>
                    <div class="mb-4">
                      <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
                      <select id="estado" name="estado" [(ngModel)]="currentUser.estado" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm" (click)="saveUser()">
              Guardar
            </button>
            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" (click)="closeModal()">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private rolesService = inject(RolesService); // Inject RolesService
  
  users: User[] = [];
  roles: Role[] = [];
  isModalOpen = false;
  currentUser: Partial<User> | null = null;
  isEditing = false;

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
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

  canCreate(): boolean {
    return this.authService.hasPermission('CREAR_USUARIO');
  }

  canEdit(): boolean {
    return this.authService.hasPermission('EDITAR_USUARIO');
  }

  canDelete(): boolean {
    return this.authService.hasPermission('ELIMINAR_USUARIO');
  }

  openCreateModal() {
    this.currentUser = {
      estado: 'activo'
    };
    this.isEditing = false;
    this.isModalOpen = true;
  }

  editUser(user: User) {
    this.currentUser = { ...user };
    // Map nested role object to flat rol_id for the select
    if (user.role) {
      this.currentUser.rol_id = user.role.id_rol;
    }
    this.isEditing = true;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentUser = null;
    this.isEditing = false;
  }

  saveUser() {
    if (this.currentUser) {
      if (this.isEditing && this.currentUser.id_usuario) {
        this.usersService.updateUser(this.currentUser.id_usuario, this.currentUser).subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            alert('Error al actualizar usuario');
          }
        });
      } else {
        this.usersService.createUser(this.currentUser).subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            alert('Error al crear usuario: ' + (error.error?.message || 'Error desconocido'));
          }
        });
      }
    }
  }

  deleteUser(user: User) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.nombre}?`)) {
      this.usersService.deleteUser(user.id_usuario).subscribe({
        next: () => {
          this.loadUsers(); // Refresh list
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error al eliminar usuario');
        }
      });
    }
  }
}
