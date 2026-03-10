import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../../core/services/contact.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toastService: ToastService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  submitForm() {
    if (this.contactForm.invalid) {
      this.toastService.show('Por favor completa todos los campos correctamente.', 'error');
      return;
    }

    this.isSubmitting = true;
    const formData = this.contactForm.value;

    this.contactService.sendMessage(formData).subscribe({
      next: (response) => {
        this.toastService.show(response.message || 'Mensaje enviado correctamente.', 'success');
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error enviando mensaje:', error);
        this.toastService.show('Error al enviar el mensaje. Intenta nuevamente.', 'error');
        this.isSubmitting = false;
      }
    });
  }
}
