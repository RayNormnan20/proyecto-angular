import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="isSidebarOpen" 
        (close)="isSidebarOpen = false"
      ></app-sidebar>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <!-- Navbar -->
        <app-navbar (toggleSidebar)="isSidebarOpen = !isSidebarOpen"></app-navbar>

        <!-- Page Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 lg:p-6 w-full">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  isSidebarOpen = false;
}
