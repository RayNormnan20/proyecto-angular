import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqComponent {
  faqs: FaqItem[] = [
    {
      question: '¿Cuáles son los tiempos de envío?',
      answer: 'Los tiempos de envío varían según tu ubicación. Generalmente, los pedidos nacionales tardan de 2 a 5 días hábiles.',
      isOpen: true
    },
    {
      question: '¿Puedo devolver un producto?',
      answer: 'Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en su estado original.',
      isOpen: false
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard), PayPal y transferencias bancarias.',
      isOpen: false
    },
    {
      question: '¿Cómo puedo rastrear mi pedido?',
      answer: 'Una vez enviado tu pedido, recibirás un correo electrónico con el número de seguimiento y un enlace para rastrearlo.',
      isOpen: false
    },
    {
      question: '¿Hacen envíos internacionales?',
      answer: 'Actualmente solo realizamos envíos dentro del territorio nacional. Estamos trabajando para expandirnos pronto.',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
