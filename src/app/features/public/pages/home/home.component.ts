import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../products/services/products.service';
import { Product, Category } from '../../../products/models/product.model';
import { CategoriesService } from '../../../products/services/categories.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    :host {
      --gold: #C9A84C;
      --gold-light: #E8C97A;
      --gold-dark: #9A7A30;
      --ink: #0D0D0F;
      --ink-soft: #1A1A1F;
      --ink-muted: #2E2E38;
      --ivory: #FAF8F4;
      --ivory-warm: #F2EFE8;
      --smoke: #8A8A95;
      --smoke-light: #B8B8C0;
      display: block;
      font-family: 'DM Sans', sans-serif;
      background: var(--ivory);
      color: var(--ink);
    }

    /* HERO */
    .hero {
      position: relative;
      min-height: 92vh;
      background: var(--ink);
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    .hero-noise {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.5;
      pointer-events: none;
    }

    .hero-gradient {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse 80% 60% at 70% 50%, rgba(201,168,76,0.08) 0%, transparent 60%),
        radial-gradient(ellipse 40% 80% at 10% 20%, rgba(201,168,76,0.05) 0%, transparent 50%);
    }

    .hero-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px);
      background-size: 80px 80px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
    }

    .hero-content {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 48px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }

    .hero-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
      animation: fadeUp 0.8s ease both;
    }

    .eyebrow-line {
      width: 40px;
      height: 1px;
      background: var(--gold);
    }

    .eyebrow-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--gold);
    }

    .hero-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(52px, 6vw, 88px);
      font-weight: 300;
      line-height: 1.05;
      color: var(--ivory);
      margin-bottom: 24px;
      animation: fadeUp 0.8s 0.1s ease both;
    }

    .hero-title em {
      font-style: italic;
      color: var(--gold-light);
    }

    .hero-subtitle {
      font-size: 16px;
      font-weight: 300;
      color: var(--smoke-light);
      line-height: 1.7;
      max-width: 420px;
      margin-bottom: 48px;
      animation: fadeUp 0.8s 0.2s ease both;
    }

    .search-wrapper {
      animation: fadeUp 0.8s 0.3s ease both;
    }

    .search-label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--smoke);
      margin-bottom: 12px;
    }

    .search-box {
      display: flex;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 2px;
      overflow: hidden;
      background: rgba(255,255,255,0.04);
      transition: border-color 0.3s;
    }

    .search-box:focus-within {
      border-color: rgba(201,168,76,0.7);
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 16px 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--ivory);
      font-weight: 300;
    }

    .search-input::placeholder {
      color: var(--smoke);
    }

    .search-btn {
      background: var(--gold);
      border: none;
      padding: 16px 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink);
      transition: background 0.2s;
    }

    .search-btn:hover {
      background: var(--gold-light);
    }

    .hero-visual {
      position: relative;
      height: 500px;
      animation: fadeIn 1.2s 0.3s ease both;
    }

    .hero-card-stack {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-card {
      position: absolute;
      width: 260px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 4px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }

    .hero-card:nth-child(1) { transform: rotate(-8deg) translate(-60px, 20px); }
    .hero-card:nth-child(2) { transform: rotate(-2deg) translate(0, -10px); z-index: 2; background: rgba(255,255,255,0.06); border-color: rgba(201,168,76,0.3); }
    .hero-card:nth-child(3) { transform: rotate(6deg) translate(55px, 25px); }

    .hero-card-img {
      width: 100%;
      height: 140px;
      background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05));
      border-radius: 2px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-card-tag {
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 6px;
    }

    .hero-card-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 500;
      color: var(--ivory);
      margin-bottom: 4px;
    }

    .hero-card-price {
      font-size: 13px;
      color: var(--smoke-light);
    }

    .hero-stats {
      position: absolute;
      bottom: 0;
      right: 0;
      display: flex;
      gap: 32px;
      animation: fadeUp 0.8s 0.5s ease both;
    }

    .stat-item {
      text-align: right;
    }

    .stat-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: var(--gold);
      line-height: 1;
    }

    .stat-label {
      font-size: 11px;
      color: var(--smoke);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-top: 4px;
    }

    /* FILTER STRIP */
    .filter-strip {
      position: sticky;
      top: 64px;
      z-index: 40;
      background: rgba(250,248,244,0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .filter-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 48px;
      display: flex;
      align-items: center;
      gap: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .filter-inner::-webkit-scrollbar { display: none; }

    .filter-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--smoke);
      white-space: nowrap;
      padding: 20px 24px 20px 0;
      border-right: 1px solid rgba(0,0,0,0.08);
      margin-right: 24px;
      flex-shrink: 0;
    }

    .filter-btn {
      background: none;
      border: none;
      padding: 20px 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 400;
      color: var(--smoke);
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 0.2s;
      flex-shrink: 0;
    }

    .filter-btn::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 2px;
      background: var(--gold);
      transform: scaleX(0);
      transition: transform 0.2s;
    }

    .filter-btn:hover { color: var(--ink); }

    .filter-btn.active {
      color: var(--ink);
      font-weight: 500;
    }

    .filter-btn.active::after {
      transform: scaleX(1);
    }

    /* PRODUCT SECTION */
    .products-section {
      max-width: 1280px;
      margin: 0 auto;
      padding: 72px 48px;
      min-height: 60vh;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 48px;
    }

    .section-title-wrap {}

    .section-eyebrow {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 8px;
    }

    .section-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 40px;
      font-weight: 400;
      color: var(--ink);
      line-height: 1.1;
    }

    .product-count {
      font-size: 13px;
      color: var(--smoke);
    }

    /* PRODUCT GRID */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
    }

    .product-card {
      background: white;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      group: true;
    }

    .product-card-inner {
      display: block;
      text-decoration: none;
      color: inherit;
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .product-card:hover .product-card-inner {
      transform: translateY(-4px);
    }

    .product-image-wrap {
      position: relative;
      aspect-ratio: 3/4;
      background: var(--ivory-warm);
      overflow: hidden;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .product-card:hover .product-image {
      transform: scale(1.06);
    }

    .product-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(13,13,15,0.5) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .product-card:hover .product-overlay {
      opacity: 1;
    }

    .product-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 5px 10px;
      border-radius: 1px;
    }

    .badge-sold-out {
      background: var(--ink);
      color: var(--ivory);
    }

    .badge-last {
      background: #B5451B;
      color: white;
    }

    .product-quick-view {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      background: var(--ivory);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.3s;
    }

    .product-card:hover .product-quick-view {
      opacity: 1;
      transform: translateY(0);
    }

    .product-info {
      padding: 20px 20px 24px;
      border-top: 1px solid rgba(0,0,0,0.04);
    }

    .product-category {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--gold-dark);
      margin-bottom: 6px;
    }

    .product-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px;
      font-weight: 500;
      color: var(--ink);
      line-height: 1.2;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-desc {
      font-size: 12px;
      color: var(--smoke);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 16px;
      min-height: 38px;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px;
      font-weight: 600;
      color: var(--ink);
      line-height: 1;
    }

    .product-arrow {
      width: 36px;
      height: 36px;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s;
      color: var(--ink);
      text-decoration: none;
    }

    .product-arrow:hover {
      background: var(--ink);
      border-color: var(--ink);
      color: white;
    }

    /* EMPTY STATE */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 96px 24px;
      text-align: center;
    }

    .empty-icon {
      width: 72px;
      height: 72px;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      color: var(--gold);
    }

    .empty-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 400;
      color: var(--ink);
      margin-bottom: 10px;
    }

    .empty-text {
      font-size: 14px;
      color: var(--smoke);
      max-width: 320px;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .empty-btn {
      background: none;
      border: 1px solid var(--gold);
      padding: 11px 28px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold-dark);
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 1px;
    }

    .empty-btn:hover {
      background: var(--gold);
      color: var(--ink);
    }

    /* FOOTER */
    .site-footer {
      background: var(--ink-soft);
      color: rgba(250,248,244,0.5);
      padding: 72px 0 40px;
    }

    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 48px;
    }

    .footer-top {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 48px;
      margin-bottom: 64px;
      padding-bottom: 64px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .footer-brand-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 400;
      color: var(--ivory);
      margin-bottom: 16px;
    }

    .footer-brand-desc {
      font-size: 13px;
      line-height: 1.7;
      max-width: 260px;
    }

    .footer-heading {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ivory);
      margin-bottom: 20px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .footer-link {
      font-size: 13px;
      color: rgba(250,248,244,0.5);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-link:hover {
      color: var(--ivory);
    }

    .footer-contact-item {
      font-size: 13px;
      line-height: 1.8;
    }

    .footer-gold-line {
      display: block;
      width: 32px;
      height: 1px;
      background: var(--gold);
      margin-bottom: 20px;
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-copy {
      font-size: 12px;
    }

    .footer-gold-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--gold);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .gold-dot {
      width: 4px;
      height: 4px;
      background: var(--gold);
      border-radius: 50%;
    }

    /* ANIMATIONS */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 1024px) {
      .hero-content { grid-template-columns: 1fr; padding: 0 32px; }
      .hero-visual { display: none; }
      .product-grid { grid-template-columns: repeat(3, 1fr); }
      .footer-top { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 768px) {
      .hero { min-height: 80vh; }
      .products-section { padding: 48px 24px; }
      .product-grid { grid-template-columns: repeat(2, 1fr); }
      .filter-inner { padding: 0 24px; }
      .footer-top { grid-template-columns: 1fr; gap: 32px; }
      .footer-inner { padding: 0 24px; }
    }
  `],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-noise"></div>
      <div class="hero-gradient"></div>
      <div class="hero-lines"></div>

      <div class="hero-content">
        <div>
          <div class="hero-eyebrow">
            <span class="eyebrow-line"></span>
            <span class="eyebrow-text">Colección Exclusiva 2026</span>
          </div>

          <h1 class="hero-title">
            Productos<br>
            de <em>Calidad</em><br>
            Superior
          </h1>

          <p class="hero-subtitle">
            Descubre nuestra curaduría de productos seleccionados con criterio y elegancia. Cada pieza, pensada para quienes exigen lo mejor.
          </p>

          <div class="search-wrapper">
            <div class="search-label">Buscar en catálogo</div>
            <div class="search-box">
              <input
                type="text"
                placeholder="Nombre del producto, categoría..."
                class="search-input"
                [(ngModel)]="searchTerm"
                (keyup.enter)="loadProducts()"
              >
              <button class="search-btn" (click)="loadProducts()">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>

        <!-- Hero Visual -->
        <div class="hero-visual">
          <div class="hero-card-stack">
            <div class="hero-card">
              <div class="hero-card-img">
                <svg width="40" height="40" fill="none" stroke="rgba(201,168,76,0.5)" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div class="hero-card-tag">Electrónica</div>
              <div class="hero-card-name">Gadget Pro X</div>
              <div class="hero-card-price">$299.00</div>
            </div>
            <div class="hero-card">
              <div class="hero-card-img">
                <svg width="40" height="40" fill="none" stroke="rgba(201,168,76,0.7)" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
              <div class="hero-card-tag">Destacado</div>
              <div class="hero-card-name">Premium Select</div>
              <div class="hero-card-price">$459.00</div>
            </div>
            <div class="hero-card">
              <div class="hero-card-img">
                <svg width="40" height="40" fill="none" stroke="rgba(201,168,76,0.4)" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <div class="hero-card-tag">Oferta</div>
              <div class="hero-card-name">Essential Pack</div>
              <div class="hero-card-price">$129.00</div>
            </div>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-num">500+</div>
              <div class="stat-label">Productos</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">98%</div>
              <div class="stat-label">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FILTER STRIP -->
    <div class="filter-strip">
      <div class="filter-inner">
        <span class="filter-label">Categorías</span>
        <button
          class="filter-btn"
          [class.active]="!selectedCategoryId()"
          (click)="filterByCategory(null)"
        >Todos</button>
        <button
          *ngFor="let cat of categories()"
          class="filter-btn"
          [class.active]="selectedCategoryId() === cat.id_categoria"
          (click)="filterByCategory(cat.id_categoria!)"
        >{{ cat.nombre }}</button>
      </div>
    </div>

    <!-- PRODUCTS -->
    <section class="products-section">
      <div class="section-header">
        <div class="section-title-wrap">
          <div class="section-eyebrow">Catálogo</div>
          <h2 class="section-title">Nuestra Selección</h2>
        </div>
        <span class="product-count">{{ products().length }} productos encontrados</span>
      </div>

      <div class="product-grid" *ngIf="products().length > 0">
        <div *ngFor="let product of products()" class="product-card">
          <div class="product-card-inner">
            <!-- Image -->
            <div class="product-image-wrap">
              <img
                [src]="getProductImage(product)"
                [alt]="product.nombre"
                class="product-image"
              >
              <div class="product-overlay"></div>

              <span *ngIf="product.stock === 0" class="product-badge badge-sold-out">Agotado</span>
              <span *ngIf="product.stock > 0 && product.stock < 5" class="product-badge badge-last">Últimas unidades</span>

              <div class="product-quick-view">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="product-info">
              <div class="product-category">{{ product.category?.nombre || 'General' }}</div>
              <div class="product-name">{{ product.nombre }}</div>
              <p class="product-desc">{{ product.descripcion }}</p>
              <div class="product-footer">
                <span class="product-price">S/. {{ product.precio }}</span>
                <a [routerLink]="['/product', product.id_producto]" class="product-arrow">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="products().length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>
        <h3 class="empty-title">Sin resultados</h3>
        <p class="empty-text">No encontramos productos que coincidan con tu búsqueda. Intenta con otros términos o explora todas las categorías.</p>
        <button class="empty-btn" (click)="searchTerm = ''; filterByCategory(null)">
          Ver todos los productos
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div>
            <div class="footer-brand-name">Mi Tienda</div>
            <span class="footer-gold-line"></span>
            <p class="footer-brand-desc">
              Ofrecemos productos de la más alta calidad, seleccionados con criterio y cuidado para satisfacer los estándares más exigentes.
            </p>
          </div>
          <div>
            <div class="footer-heading">Navegación</div>
            <ul class="footer-links">
              <li><a routerLink="/" class="footer-link">Inicio</a></li>
              <li><a routerLink="/products" class="footer-link">Catálogo</a></li>
              <li><a routerLink="/auth/login" class="footer-link">Ingresar</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-heading">Soporte</div>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">Preguntas frecuentes</a></li>
              <li><a href="#" class="footer-link">Devoluciones</a></li>
              <li><a href="#" class="footer-link">Envíos</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-heading">Contacto</div>
            <div class="footer-contact-item">contacto@mitienda.com</div>
            <div class="footer-contact-item">+51 999 999 999</div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copy">&copy; 2026 Mi Empresa. Todos los derechos reservados.</p>
          <div class="footer-gold-badge">
            <span class="gold-dot"></span>
            <span>Calidad garantizada</span>
            <span class="gold-dot"></span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class HomeComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  searchTerm = '';
  selectedCategoryId = signal<number | null>(null);
  apiUrl = 'http://localhost:3000';

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadProducts() {
    const params: any = { search: this.searchTerm };
    if (this.selectedCategoryId()) {
      params.category_id = this.selectedCategoryId();
    }

    this.productsService.getAll(params).subscribe({
      next: (res: any) => {
        let publicProducts = (res.products || []);
        if (this.selectedCategoryId()) {
          publicProducts = publicProducts.filter((p: Product) => p.categoria_id === this.selectedCategoryId());
        }
        publicProducts = publicProducts.filter((p: Product) => p.estado === 'activo' && p.visible_web);
        this.products.set(publicProducts);
      },
      error: (err: any) => console.error(err)
    });
  }

  filterByCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.loadProducts();
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return `${this.apiUrl}${product.images[0].url}`;
    }
    return 'assets/placeholder.png';
  }
}