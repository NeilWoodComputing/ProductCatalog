import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent {
  @Input() product?: Product;

  productHasAttributes(product?: Product): boolean {
    if (!product) return false;
    
    return !!product.data?.year || 
      !!product.data?.price ||
      !!product.data?.['CPU model'] ||
      !!product.data?.['Hard disk size'];
  }
} 