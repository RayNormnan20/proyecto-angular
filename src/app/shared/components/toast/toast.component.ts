import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()" 
           @toastAnimation
           class="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-lg flex items-center justify-between text-white"
           [ngClass]="{
             'bg-green-600': toast.type === 'success',
             'bg-red-600': toast.type === 'error',
             'bg-indigo-600': toast.type === 'info'
           }">
        <div class="flex items-center gap-3">
          <!-- Icon based on type -->
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
          <p class="font-medium text-sm">{{ toast.message }}</p>
        </div>
        <button (click)="toastService.remove(toast.id)" class="ml-4 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
