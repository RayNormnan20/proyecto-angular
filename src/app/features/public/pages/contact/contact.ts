import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  submitForm(event: Event) {
    event.preventDefault();
    alert('Gracias por contactarnos. Te responderemos pronto.');
  }
}
