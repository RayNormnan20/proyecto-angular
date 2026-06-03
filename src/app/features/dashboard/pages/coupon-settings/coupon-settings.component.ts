import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Coupon, CouponService } from '../../../../core/services/coupon.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-coupon-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 md:p-6 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Cupones</h1>
          <p class="text-sm text-gray-500">Gestiona descuentos para campañas y recuperación de ventas.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="loadCoupons()" class="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            Actualizar
          </button>
          <button (click)="openCreateModal()" class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            Nuevo cupón
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="text-sm text-gray-500">Cupones activos</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">{{ activeCount() }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="text-sm text-gray-500">Total de cupones</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">{{ coupons().length }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="text-sm text-gray-500">Usos acumulados</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">{{ totalUses() }}</div>
        </div>
      </div>

      <div class="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descuento</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Condiciones</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vigencia</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let coupon of coupons()" class="hover:bg-gray-50">
                <td class="px-4 py-4">
                  <div class="font-semibold text-gray-900">{{ coupon.codigo }}</div>
                  <div class="text-xs text-gray-500">{{ coupon.descripcion || 'Sin descripción' }}</div>
                </td>
                <td class="px-4 py-4 text-sm text-gray-700">
                  {{ coupon.tipo_descuento === 'porcentaje' ? (coupon.valor + '%') : ('S/ ' + (coupon.valor | number:'1.2-2')) }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-700">
                  <div>Mínimo: S/ {{ coupon.monto_minimo | number:'1.2-2' }}</div>
                  <div>Usos: {{ coupon.usos_actuales }} / {{ coupon.max_usos ?? 'Ilimitado' }}</div>
                </td>
                <td class="px-4 py-4 text-sm text-gray-700">
                  <div>{{ coupon.fecha_inicio ? formatDateForDisplay(coupon.fecha_inicio) : 'Sin inicio' }}</div>
                  <div>{{ coupon.fecha_fin ? formatDateForDisplay(coupon.fecha_fin) : 'Sin fin' }}</div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex flex-col items-start gap-2">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold" [ngClass]="coupon.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
                      {{ coupon.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold" [ngClass]="getScheduleStatusClasses(coupon)">
                      {{ getScheduleStatusLabel(coupon) }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex flex-wrap gap-2">
                    <button (click)="openEditModal(coupon)" class="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-100">
                      Editar
                    </button>
                    <button (click)="toggleActive(coupon)" class="px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 text-sm hover:bg-amber-100">
                      {{ coupon.activo ? 'Desactivar' : 'Activar' }}
                    </button>
                    <button (click)="deleteCoupon(coupon)" class="px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-sm hover:bg-red-100">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!coupons().length">
                <td colspan="6" class="px-4 py-12 text-center text-gray-500">Aún no hay cupones registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="md:hidden space-y-4">
        <div *ngFor="let coupon of coupons()" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-bold text-gray-900 break-all">{{ coupon.codigo }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ coupon.descripcion || 'Sin descripción' }}</div>
            </div>
            <span class="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold" [ngClass]="coupon.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
              {{ coupon.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="mt-3">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold" [ngClass]="getScheduleStatusClasses(coupon)">
              {{ getScheduleStatusLabel(coupon) }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 text-sm">
            <div class="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <div class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Descuento</div>
              <div class="mt-1 font-medium text-gray-900">{{ getDiscountLabel(coupon) }}</div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Monto mínimo</div>
                <div class="mt-1 font-medium text-gray-900">S/ {{ coupon.monto_minimo | number:'1.2-2' }}</div>
              </div>
              <div class="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Usos</div>
                <div class="mt-1 font-medium text-gray-900">{{ coupon.usos_actuales }} / {{ coupon.max_usos ?? 'Ilimitado' }}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Inicio</div>
                <div class="mt-1 font-medium text-gray-900">{{ coupon.fecha_inicio ? formatDateForDisplay(coupon.fecha_inicio) : 'Sin inicio' }}</div>
              </div>
              <div class="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Fin</div>
                <div class="mt-1 font-medium text-gray-900">{{ coupon.fecha_fin ? formatDateForDisplay(coupon.fecha_fin) : 'Sin fin' }}</div>
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button (click)="openEditModal(coupon)" class="w-full px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100">
              Editar
            </button>
            <button (click)="toggleActive(coupon)" class="w-full px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100">
              {{ coupon.activo ? 'Desactivar' : 'Activar' }}
            </button>
            <button (click)="deleteCoupon(coupon)" class="w-full px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100">
              Eliminar
            </button>
          </div>
        </div>

        <div *ngIf="!coupons().length" class="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-12 text-center text-gray-500">
          Aún no hay cupones registrados.
        </div>
      </div>

      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-gray-100 px-4 md:px-6 py-4">
            <h2 class="text-lg font-bold text-gray-900">{{ editingId() ? 'Editar cupón' : 'Nuevo cupón' }}</h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input [(ngModel)]="form.codigo" class="w-full rounded-lg border border-gray-300 p-2.5" placeholder="BIENVENIDA10">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de descuento</label>
              <select [(ngModel)]="form.tipo_descuento" class="w-full rounded-lg border border-gray-300 p-2.5">
                <option value="porcentaje">Porcentaje</option>
                <option value="monto_fijo">Monto fijo</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input [(ngModel)]="form.valor" type="number" min="0" step="0.01" class="w-full rounded-lg border border-gray-300 p-2.5">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Monto mínimo</label>
              <input [(ngModel)]="form.monto_minimo" type="number" min="0" step="0.01" class="w-full rounded-lg border border-gray-300 p-2.5">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input [(ngModel)]="form.fecha_inicio" type="date" class="w-full rounded-lg border border-gray-300 p-2.5">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input [(ngModel)]="form.fecha_fin" type="date" class="w-full rounded-lg border border-gray-300 p-2.5">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Límite de usos</label>
              <input [(ngModel)]="form.max_usos" type="number" min="0" step="1" class="w-full rounded-lg border border-gray-300 p-2.5" placeholder="Vacío = ilimitado">
            </div>
            <div class="flex items-center gap-3 pt-7">
              <input [(ngModel)]="form.activo" type="checkbox" id="coupon-active" class="h-4 w-4 rounded border-gray-300 text-indigo-600">
              <label for="coupon-active" class="text-sm text-gray-700">Cupón activo</label>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea [(ngModel)]="form.descripcion" rows="3" class="w-full rounded-lg border border-gray-300 p-2.5" placeholder="Campaña para clientes nuevos, fin de semana, etc."></textarea>
            </div>
          </div>

          <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 px-4 md:px-6 py-4">
            <button (click)="closeModal()" class="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button (click)="saveCoupon()" [disabled]="isSaving()" class="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {{ isSaving() ? 'Guardando...' : 'Guardar cupón' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CouponSettingsComponent {
  private couponService = inject(CouponService);
  private toastService = inject(ToastService);
  private readonly dateFormatter = new Intl.DateTimeFormat('es-PE');

  coupons = signal<Coupon[]>([]);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  isSaving = signal(false);

  form: any = this.getEmptyForm();

  constructor() {
    this.loadCoupons();
  }

  activeCount() {
    return this.coupons().filter(coupon => coupon.activo).length;
  }

  totalUses() {
    return this.coupons().reduce((acc, coupon) => acc + Number(coupon.usos_actuales || 0), 0);
  }

  getDiscountLabel(coupon: Coupon) {
    return coupon.tipo_descuento === 'porcentaje'
      ? `${coupon.valor}%`
      : `S/ ${Number(coupon.valor || 0).toFixed(2)}`;
  }

  parseCouponDate(value: string | null | undefined) {
    if (!value) return null;

    const trimmedValue = String(value).trim();
    const dateOnlyMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return null;
      }

      return date;
    }

    const date = new Date(trimmedValue);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  normalizeDateBoundary(value: string | null | undefined, boundary: 'start' | 'end') {
    const date = this.parseCouponDate(value);
    if (!date) {
      return null;
    }

    if (boundary === 'end') {
      date.setHours(23, 59, 59, 999);
    }

    return date;
  }

  isUsageLimitReached(coupon: Coupon) {
    return coupon.max_usos !== null
      && coupon.max_usos !== undefined
      && Number(coupon.max_usos) > 0
      && Number(coupon.usos_actuales || 0) >= Number(coupon.max_usos);
  }

  getScheduleStatus(coupon: Coupon): 'vigente' | 'programado' | 'vencido' | 'agotado' {
    const now = new Date();
    const startDate = this.normalizeDateBoundary(coupon.fecha_inicio, 'start');
    const endDate = this.normalizeDateBoundary(coupon.fecha_fin, 'end');

    if (startDate && startDate.getTime() > now.getTime()) {
      return 'programado';
    }

    if (endDate && endDate.getTime() < now.getTime()) {
      return 'vencido';
    }

    if (this.isUsageLimitReached(coupon)) {
      return 'agotado';
    }

    return 'vigente';
  }

  getScheduleStatusLabel(coupon: Coupon) {
    const status = this.getScheduleStatus(coupon);
    const labels: Record<'vigente' | 'programado' | 'vencido' | 'agotado', string> = {
      vigente: 'Vigente',
      programado: 'Programado',
      vencido: 'Vencido',
      agotado: 'Agotado'
    };
    return labels[status];
  }

  getScheduleStatusClasses(coupon: Coupon) {
    const status = this.getScheduleStatus(coupon);
    const classes: Record<'vigente' | 'programado' | 'vencido' | 'agotado', string> = {
      vigente: 'bg-emerald-100 text-emerald-700',
      programado: 'bg-blue-100 text-blue-700',
      vencido: 'bg-red-100 text-red-700',
      agotado: 'bg-amber-100 text-amber-700'
    };
    return classes[status];
  }

  getEmptyForm() {
    return {
      codigo: '',
      descripcion: '',
      tipo_descuento: 'porcentaje',
      valor: 0,
      monto_minimo: 0,
      fecha_inicio: '',
      fecha_fin: '',
      max_usos: '',
      activo: true
    };
  }

  formatDateForInput(value: string | null | undefined) {
    const date = this.parseCouponDate(value);
    if (!date) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(value: string | null | undefined) {
    const date = this.parseCouponDate(value);
    return date ? this.dateFormatter.format(date) : '';
  }

  loadCoupons() {
    this.couponService.getAll().subscribe({
      next: (coupons) => this.coupons.set(coupons),
      error: (err) => {
        console.error('Error loading coupons', err);
        this.toastService.show('Error al cargar cupones', 'error');
      }
    });
  }

  openCreateModal() {
    this.editingId.set(null);
    this.form = this.getEmptyForm();
    this.showModal.set(true);
  }

  openEditModal(coupon: Coupon) {
    this.editingId.set(coupon.id_cupon);
    this.form = {
      codigo: coupon.codigo,
      descripcion: coupon.descripcion || '',
      tipo_descuento: coupon.tipo_descuento,
      valor: coupon.valor,
      monto_minimo: coupon.monto_minimo,
      fecha_inicio: this.formatDateForInput(coupon.fecha_inicio),
      fecha_fin: this.formatDateForInput(coupon.fecha_fin),
      max_usos: coupon.max_usos ?? '',
      activo: coupon.activo
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
    this.isSaving.set(false);
  }

  saveCoupon() {
    if (!String(this.form.codigo || '').trim()) {
      this.toastService.show('El código es obligatorio', 'error');
      return;
    }

    if (Number(this.form.valor) <= 0) {
      this.toastService.show('El valor del descuento debe ser mayor a 0', 'error');
      return;
    }

    this.isSaving.set(true);
    const payload = {
      ...this.form,
      codigo: String(this.form.codigo || '').trim().toUpperCase(),
      descripcion: String(this.form.descripcion || '').trim(),
      valor: Number(this.form.valor),
      monto_minimo: Number(this.form.monto_minimo || 0),
      max_usos: this.form.max_usos === '' ? '' : Number(this.form.max_usos),
      fecha_inicio: this.form.fecha_inicio || '',
      fecha_fin: this.form.fecha_fin || ''
    };

    const request = this.editingId()
      ? this.couponService.update(this.editingId()!, payload)
      : this.couponService.create(payload);

    request.subscribe({
      next: () => {
        this.toastService.show(this.editingId() ? 'Cupón actualizado' : 'Cupón creado', 'success');
        this.closeModal();
        this.loadCoupons();
      },
      error: (err) => {
        console.error('Error saving coupon', err);
        this.toastService.show(err?.error?.message || 'Error al guardar el cupón', 'error');
        this.isSaving.set(false);
      }
    });
  }

  toggleActive(coupon: Coupon) {
    this.couponService.update(coupon.id_cupon, { activo: !coupon.activo }).subscribe({
      next: () => {
        this.toastService.show(`Cupón ${!coupon.activo ? 'activado' : 'desactivado'}`, 'success');
        this.loadCoupons();
      },
      error: (err) => {
        console.error('Error toggling coupon', err);
        this.toastService.show(err?.error?.message || 'No se pudo actualizar el cupón', 'error');
      }
    });
  }

  deleteCoupon(coupon: Coupon) {
    if (!confirm(`¿Deseas eliminar el cupón ${coupon.codigo}?`)) {
      return;
    }

    this.couponService.delete(coupon.id_cupon).subscribe({
      next: () => {
        this.toastService.show('Cupón eliminado', 'success');
        this.loadCoupons();
      },
      error: (err) => {
        console.error('Error deleting coupon', err);
        this.toastService.show(err?.error?.message || 'No se pudo eliminar el cupón', 'error');
      }
    });
  }
}
