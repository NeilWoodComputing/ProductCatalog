import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-desktop-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './desktop-product-list.component.html',
  styleUrls: ['./desktop-product-list.component.scss']
})
export class DesktopProductListComponent {
  @Input() products: Product[] = [];
  @Output() deleteProduct = new EventEmitter<Product>();

  constructor(
    public elementRef: ElementRef
  ) {}

  confirmDelete(product: Product): void {
    this.deleteProduct.emit(product);
  }
} 