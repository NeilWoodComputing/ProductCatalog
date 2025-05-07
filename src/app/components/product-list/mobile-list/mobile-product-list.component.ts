import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-mobile-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './mobile-product-list.component.html',
  styleUrls: ['./mobile-product-list.component.scss']
})
export class MobileProductListComponent {
  @Input() products: Product[] = [];
  @Output() deleteProduct = new EventEmitter<Product>();

  constructor(
    public elementRef: ElementRef
  ) {}

  confirmDelete(product: Product): void {
    this.deleteProduct.emit(product);
  }

  productHasAttributes(product: Product): boolean {
    return !!product.data?.year || 
      !!product.data?.price ||
      !!product.data?.['CPU model'] ||
      !!product.data?.['Hard disk size'];
  }
} 