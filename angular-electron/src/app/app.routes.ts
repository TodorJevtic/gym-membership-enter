import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { OrderTicketComponent } from './pages/order-ticket/order-ticket.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'order', component: OrderTicketComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    { path: 'create/:id', component: AdminComponent },
];
