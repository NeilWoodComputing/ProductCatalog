import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../services/product.service';
import { ApiResponse } from '../../models/product.model';

@Component({
  selector: 'app-abstract-product-modal',
  standalone: true,
  template: '', 
  styleUrls: []
})
export class AbstractProductModalComponent {
  loading = false;
  error = '';
  response: ApiResponse | null = null;
  returnedJson = '';

  constructor(
    public productService: ProductService,
    public dialogRef: MatDialogRef<AbstractProductModalComponent>
  ) {
    // Prevent dialog from closing when Enter key is pressed
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    });
  }
  
  closeModal(): void {
    this.dialogRef.close();
  }
  
} 