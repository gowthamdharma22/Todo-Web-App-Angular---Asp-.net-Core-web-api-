import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { TodoResolver } from './guards/todoResolver.resolver';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: '/todo',
  //   pathMatch: 'full',
  // },
  {
    path: '',
    loadComponent: () =>
      import('./components/todo/todo.component').then((m) => m.TodoComponent),
    canActivate: [AuthGuard],
    title: 'Todo | Home',
    resolve: {
      todos: TodoResolver,
    },
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Todo | Login',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Todo | Register',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: 'Todo | Not Found',
  },
];
