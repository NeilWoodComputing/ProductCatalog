import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../services/product.service';
import { Product, ApiResponse } from '../../models/product.model';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-product-modal.component.html',
  styleUrls: ['./add-product-modal.component.scss']
})
export class AddProductModalComponent implements OnInit {
  productForm!: FormGroup;
  loading = false;
  error = '';
  response: ApiResponse | null = null;
  returnedJson = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<AddProductModalComponent>
  ) {
    // Prevent dialog from closing when Enter key is pressed
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    });
  }
  
  ngOnInit(): void {
    this.initForm();
  }
  
  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      data: this.fb.group({
        year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
        price: ['', [Validators.required, Validators.pattern(/^£\d{1,3}(,\d{3})*\.\d{2}$/)]],
        'CPU model': ['', [Validators.required, Validators.maxLength(25)]],
        'Hard disk size': ['', [Validators.required, Validators.maxLength(25)]]
      })
    });
  }
  
  onClose(): void {
    this.dialogRef.close();
  }
  
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    const product: Product = this.productForm.value;
    
    this.productService.addProduct(product)
      .pipe()
      .subscribe({
        next: (response) => {
          this.loading = false;
 
          // Add the ID from the response to our product
          const newProduct: Product = {
            ...product,
            id: response.id
          };
          
          // Return the product object with the raw response
          this.dialogRef.close({newProduct, response});
        },
        error: (err) => {
          this.loading = false;
          this.returnedJson = JSON.stringify(err, null, 2);
          this.error = err.error ? err.error.error : 'Failed to add product';
          console.error('Error adding product:', err);
        }
      });
  }
  
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  isInvalid(controlName: string, useData: boolean = false): boolean {
    let control;
    if (useData) {
      control = this.productForm.get('data')?.get(controlName);
    } else {
     control = this.productForm.get(controlName);
    }
    return this.GetControlValid(control);
  }
   
  getErrorMessage(controlName: string, useData: boolean = false): string {
   let control;
    if(useData){
      control = this.productForm.get('data')?.get(controlName);
    } else {
      control = this.productForm.get(controlName);
    }
    return this.GetControlError(control, controlName);
  }

  private GetControlValid(control: any) {
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private GetControlError(control: any, controlName: string) {
    if (!control) return '';
    
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    if (control.hasError('pattern')) {
      if (controlName === 'year') return 'Year must be a 4-digit number';
      if (controlName === 'price') return 'Price must be in format £X,XXX.XX';
    }
    
    return 'Invalid value';
  }
} 