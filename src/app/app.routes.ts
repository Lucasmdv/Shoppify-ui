import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Main } from './layouts/main/main';
import { Auth } from './layouts/auth/auth';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Profile } from './pages/profile/profile';
import { CartPage } from './pages/cart/cart-page';
import { ProductsPage } from './pages/products/products-page';
import { AdminPage } from './pages/admin/admin-page';
import { CategoriesPage } from './pages/categories/categories-page';
import { authGuard } from './core/guards/auth-guard';
import { Help } from './pages/help/help';
import { publicGuard } from './core/guards/public-guard';
import { ProductDetail } from './pages/product-detail/product-detail';
import { StoreForm } from './components/store-form/store-form';
import { CarouselForm } from './components/carousel-form/carousel-form';
import { Purchases } from './pages/purchases/purchases';
import { Terms } from './pages/terms/terms';
import { ConfigPages } from './layouts/config-pages/config-pages';
import { Privacy } from './pages/privacy/privacy';
import { CredentialsForm } from './pages/credentials-form/credentials-form';
import { hasPermitsGuard } from './core/guards/has-permits-guard';
import { FavoritesPage } from './pages/favorites/favorites-page';
import { MercadopagoButton } from './components/mercadopago-button/mercadopago-button';

export const routes: Routes = [
  {
    path: 'auth',
    component: Auth,
    children: [
      { path: 'login', component: Login, canActivate: [publicGuard] },
      { path: 'register', component: Register, canActivate: [publicGuard] },
      { path: 'settings', component: CredentialsForm, canActivate: [authGuard] },
      { path: 'admin', component: AdminPage, canActivate: [authGuard] },

      { path: 'admin/edit/store', component: StoreForm, canActivate: [authGuard, hasPermitsGuard] },
      { path: 'admin/edit/carousel', component: CarouselForm, canActivate: [authGuard, hasPermitsGuard] },
      { path: 'admin/edit/carousel/:id', component: CarouselForm, canActivate: [authGuard, hasPermitsGuard] },
      { path: 'checkout', component: MercadopagoButton, canActivate: [authGuard] },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: '**', redirectTo: 'login' }
    ]
  },
  {
    path: '',
    component: Main,
    children: [
      { path: 'home', component: Home },
      { path: 'products', component: ProductsPage },
      { path: 'products/details/:id', component: ProductDetail },
      { path: 'products/search/:q', component: ProductsPage },
      { path: 'categories', component: CategoriesPage },
      { path: 'favorites', component: FavoritesPage },
      { path: 'cart', component: CartPage, canActivate: [authGuard] },
      { path: 'purchases', component: Purchases, canActivate: [authGuard] },
      { path: '', redirectTo: 'home', pathMatch: 'full' },


    ]
  },
  {
    path: 'profile',
    component: ConfigPages,
    canActivate: [authGuard],
    children: [{ path: '', component: Profile }]
  },
  {
    path: 'help',
    component: ConfigPages,
    children: [
      { path: '', component: Help },
      { path: 'terms', component: Terms },
      { path: 'privacy', component: Privacy },
    ]
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
