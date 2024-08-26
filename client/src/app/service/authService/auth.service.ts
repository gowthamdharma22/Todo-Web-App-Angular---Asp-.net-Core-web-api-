import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  Observable,
  Subject,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnDestory(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password &&
      confirmPassword &&
      password.value === confirmPassword.value
      ? null
      : { mismatch: true };
  }

  handleRegister(form: FormGroup) {
    if (form.valid) {
      this.http
        .post('auth/register', {
          username: form.value.username,
          email: form.value.email,
          password: form.value.password,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Register Successful');
            this.router.navigate(['/login']);
            this.toastr.success('Register Successful', 'Success');
          },
          error: (error) => {
            console.error('Register failed', error);
            this.toastr.error('Register failed', 'Error');
          },
        });
    } else {
      console.log('Registration Form is invalid');
      this.toastr.warning('Registration Form is invalid');
    }
  }

  handleLogin(form: FormGroup) {
    if (form.valid) {
      this.http
        .post('auth/login', form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('accessToken', response?.tokenData);
            this.router.navigate(['/']);
            this.toastr.success('Login Successful', 'Success');
          },
          error: (error) => {
            if (error.status == 401) {
              console.error('Invalid Credentials');
              this.toastr.error('Invalid Credentials', 'Error');
            } else if (error.status == 404) {
              console.error('User not found');
              this.toastr.error('User not found', 'Error');
            } else if (error.status == 500) {
              console.error('Internal Server error');
              this.toastr.error('Internal Server error', 'Error');
            }
          },
        });
    } else {
      console.log('Login Form is invalid');
      this.toastr.warning('Login Form is invalid');
    }
  }

  // handleRefresh() {
  //   try {
  //     this.http
  //       .get('auth/refresh')
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: (response: any) => {
  //           console.log(response);
  //         },
  //         error: (error) => {
  //           console.error('Refresh failed', error);
  //           this.toastr.error('Refresh failed', 'Error');
  //         },
  //       });
  //   } catch (error) {
  //     console.log('Error', error);
  //     this.toastr.error('Failed to Refresh Token', 'Error');
  //   }
  // }

  handleRefresh(): Observable<any> {
    return this.http.get('auth/refresh').pipe(
      tap((response: any) => {
        console.log(response);
      }),
      catchError((error) => {
        console.error('Refresh failed', error);
        this.toastr.error('Refresh failed', 'Error');
        return throwError(() => new Error('Failed to refresh token'));
      })
    );
  }

  clearToken() {
    localStorage.removeItem('accessToken');
  }
}
