import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product, ApiResponse } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AbstractProductModalComponent } from '../abstract-components/abstract-product-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ConfirmDialogData {
  product: Product;
  response?: ApiResponse | null;
}

@Component({
  selector: 'app-confirm-delete-product',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule, 
    MatProgressSpinnerModule
  ],
  templateUrl: './confirm-delete-product.component.html',
  styleUrls: ['./confirm-delete-product.component.scss', '../../../assets/scss/_modal-styles.scss']
})
export class ConfirmDeleteProductComponent extends AbstractProductModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    productService: ProductService,
    dialogRef: MatDialogRef<ConfirmDeleteProductComponent>
  ) {
    super(productService, dialogRef);
  }
  
  confirm(): void {
    this.loading = true;

    if (!this.data.product.id) {
      this.error = 'Product ID is required';
      this.loading = false;
      return;
    }

    this.productService.deleteProduct(this.data.product.id)
      .pipe()
      .subscribe({
        next: (response) => {
          this.dialogRef.close({response: response, product: this.data.product});
        },
        error: (err) => {
          this.error = err.error.error;
          this.returnedJson = JSON.stringify(err, null, 2);
          this.loading = false;
        }
      });
  }
} 