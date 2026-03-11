import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './features/dashboard/pages/dashboard-home/dashboard-home.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { UsersListComponent } from './features/users/pages/users-list/users-list.component';
import { RolesListComponent } from './features/roles/pages/roles-list/roles-list.component';

// Productos
import { ProductListComponent } from './features/products/pages/product-list/product-list.component';
import { ProductFormComponent } from './features/products/pages/product-form/product-form.component';
import { CategoryListComponent } from './features/categories/pages/category-list/category-list.component';
import { CategoryFormComponent } from './features/categories/pages/category-form/category-form.component';
import { BrandListComponent } from './features/brands/pages/brand-list/brand-list.component';
import { BrandFormComponent } from './features/brands/pages/brand-form/brand-form.component';
import { OrdersListComponent } from './features/dashboard/pages/orders-list/orders-list.component';
import { PaymentSettingsComponent } from './features/dashboard/pages/payment-settings/payment-settings.component';
import { ShippingSettingsComponent } from './features/dashboard/pages/shipping-settings/shipping-settings.component';
import { EmailSettingsComponent } from './features/dashboard/pages/email-settings/email-settings.component';
import { TestimonialSettingsComponent } from './features/dashboard/pages/testimonial-settings/testimonial-settings.component';
import { HomeBannersSettingsComponent } from './features/dashboard/pages/home-banners-settings/home-banners-settings.component';

// Público
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { HomeComponent } from './features/public/pages/home/home.component';
import { ProductDetailComponent } from './features/public/pages/product-detail/product-detail.component';
import { ProfileComponent } from './features/public/pages/profile/profile.component';
import { CartComponent } from './features/public/pages/cart/cart.component';
import { CheckoutComponent } from './features/public/pages/checkout/checkout.component';
import { FavoritesComponent } from './features/public/pages/favorites/favorites.component';
import { AboutComponent } from './features/public/pages/about/about';
import { ContactComponent } from './features/public/pages/contact/contact';
import { HelpComponent } from './features/public/pages/help/help';
import { FaqComponent } from './features/public/pages/faq/faq';
import { TestimonialsComponent } from './features/public/pages/testimonials/testimonials.component';

export const routes: Routes = [
  // Rutas Públicas
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: HomeComponent }, // Alias
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'help', component: HelpComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'testimonials', component: TestimonialsComponent }
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
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'trabajador', 'supervisor'] },
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'roles', component: RolesListComponent },
      // Productos Admin
      { path: 'products', component: ProductListComponent },
      // Categorías
      { path: 'categories', component: CategoryListComponent },
      // Marcas
      { path: 'brands', component: BrandListComponent },
      // Pedidos
      { path: 'orders', component: OrdersListComponent },
      // Configuración Pagos
      { path: 'payment-settings', component: PaymentSettingsComponent },
      // Configuración Envíos
      { path: 'shipping-settings', component: ShippingSettingsComponent },
      // Configuración Correo
      { path: 'email-settings', component: EmailSettingsComponent },
      // Configuración Testimonios (Clientes Satisfechos)
      { path: 'testimonial-settings', component: TestimonialSettingsComponent },
      { path: 'home-banners-settings', component: HomeBannersSettingsComponent }
    ]
  },
  
  { path: '**', redirectTo: '' }
];
