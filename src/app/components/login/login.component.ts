import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MaterialGlobalModule } from '../../shared/modules/material.imports.module';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialGlobalModule,
    ToastComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private toast       = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr         = inject(ChangeDetectorRef);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  loading = false;
  errorMessage = '';
  showPassword = false;

  get email() { return this.form.get('email'); }
  get senha() { return this.form.get('senha'); }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const request = this.form.value as { email: string; senha: string };

    this.authService.login(request).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        if(err.status === 401) {
          this.errorMessage =  'E-mail ou senha incorretos.'
        }
        
        this.errorHandler.handler(err);
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }
}
