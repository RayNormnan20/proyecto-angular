import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './features/dashboard/pages/dashboard-home/dashboard-home.component';
import { authGuard } from './core/guards/auth.guard';

import { UsersListComponent } from './features/users/pages/users-list/users-list.component';
import { RolesListComponent } from './features/roles/pages/roles-list/roles-list.component';

// Productos
import { ProductListComponent } from './features/products/pages/product-list/product-list.component';
import { ProductFormComponent } from './features/products/pages/product-form/product-form.component';
import { CategoryListComponent } from './features/categories/pages/category-list/category-list.component';
import { CategoryFormComponent } from './features/categories/pages/category-form/category-form.component';
import { BrandListComponent } from './features/brands/pages/brand-list/brand-list.component';
import { BrandFormComponent } from './features/brands/pages/brand-form/brand-form.component';

// Público
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { HomeComponent } from './features/public/pages/home/home.component';
import { ProductDetailComponent } from './features/public/pages/product-detail/product-detail.component';

export const routes: Routes = [
  // Rutas Públicas
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: HomeComponent }, // Alias
      { path: 'product/:id', component: ProductDetailComponent }
    ]
  },
  
  // Auth
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  
  // Dashboard Protegido
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'roles', component: RolesListComponent },
      // Productos Admin
      { path: 'products', component: ProductListComponent },
      // Categorías
      { path: 'categories', component: CategoryListComponent },
      // Marcas
      { path: 'brands', component: BrandListComponent }
    ]
  },
  
  { path: '**', redirectTo: '' }
];
