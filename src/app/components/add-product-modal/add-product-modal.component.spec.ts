import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AddProductModalComponent } from './add-product-modal.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

describe('AddProductModalComponent', () => {
  let component: AddProductModalComponent;
  let fixture: ComponentFixture<AddProductModalComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AddProductModalComponent>>;

  beforeEach(async () => {
    // Create spies for dependencies
    productServiceSpy = jasmine.createSpyObj('ProductService', ['addProduct']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close', 'keydownEvents']);
    
    // Mock the keydownEvents observable with a properly typed KeyboardEvent
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    dialogRefSpy.keydownEvents.and.returnValue(of(mockKeyboardEvent));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        AddProductModalComponent
      ],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the form with empty fields', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('data')?.get('year')?.value).toBe('');
      expect(component.productForm.get('data')?.get('price')?.value).toBe('');
      expect(component.productForm.get('data')?.get('CPU model')?.value).toBe('');
      expect(component.productForm.get('data')?.get('Hard disk size')?.value).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when empty', () => {
      expect(component.productForm.valid).toBeFalsy();
    });

    it('should validate name field requirements', () => {
      const nameControl = component.productForm.get('name');
      
      // Required validation
      nameControl?.setValue('');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('required')).toBeTruthy();
      
      // Max length validation
      nameControl?.setValue('a'.repeat(51)); // Exceeds max length of 50
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('maxlength')).toBeTruthy();
      
      // Valid value
      nameControl?.setValue('Valid Product Name');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should validate year field pattern', () => {
      const yearControl = component.productForm.get('data')?.get('year');
      
      // Required validation
      yearControl?.setValue('');
      expect(yearControl?.valid).toBeFalsy();
      
      // Pattern validation - not 4 digits
      yearControl?.setValue('123');
      expect(yearControl?.valid).toBeFalsy();
      expect(yearControl?.hasError('pattern')).toBeTruthy();
      
      yearControl?.setValue('12345');
      expect(yearControl?.valid).toBeFalsy();
      
      yearControl?.setValue('abcd');
      expect(yearControl?.valid).toBeFalsy();
      
      // Valid value
      yearControl?.setValue('2023');
      expect(yearControl?.valid).toBeTruthy();
    });

    it('should validate price field pattern', () => {
      const priceControl = component.productForm.get('data')?.get('price');
      
      // Invalid formats
      priceControl?.setValue('123.45');
      expect(priceControl?.valid).toBeFalsy();
      
      priceControl?.setValue('£123');
      expect(priceControl?.valid).toBeFalsy();
      
      // Valid format
      priceControl?.setValue('£1,234.56');
      expect(priceControl?.valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should not call service when form is invalid', () => {
      // Form is initially invalid
      component.onSubmit();
      expect(productServiceSpy.addProduct).not.toHaveBeenCalled();
    });

    it('should show loading indicator during submission', fakeAsync(() => {
      // Set up form with valid values
      component.productForm.setValue({
        name: 'Test Product',
        data: {
          year: '2023',
          price: '£1,234.56',
          'CPU model': 'Intel i7',
          'Hard disk size': '1 TB'
        }
      });

      // Set up the service to return a response that will be delayed
      const mockResponse = { id: '123', name: 'Test Product' };
      productServiceSpy.addProduct.and.returnValue(
        of(mockResponse).pipe(
          // Force the observable to not complete immediately
          delay(100)
        )
      );

      // Submit the form
      component.onSubmit();

      // Should show loading immediately (before observable completes)
      expect(component.loading).toBeTruthy();

      // Complete the observable
      tick(100);

      // Loading should be false after completion
      expect(component.loading).toBeFalsy();
    }));

    it('should close dialog with product when submission is successful', fakeAsync(() => {
      // Set up form with valid values
      const formValue = {
        name: 'Test Product',
        data: {
          year: '2023',
          price: '£1,234.56',
          'CPU model': 'Intel i7',
          'Hard disk size': '1 TB'
        }
      };
      component.productForm.setValue(formValue);

      // Set up the service to return a response
      const mockResponse = { id: '123', name: 'Test Product' };
      productServiceSpy.addProduct.and.returnValue(of(mockResponse));

      // Submit the form
      component.onSubmit();
      tick();

      // Dialog should be closed with the product including the new ID
      expect(dialogRefSpy.close).toHaveBeenCalled();
      const closeArg = dialogRefSpy.close.calls.mostRecent().args[0];
      expect(closeArg.newProduct).toBeDefined();
      expect(closeArg.newProduct.id).toBe('123');
      expect(closeArg.newProduct.name).toBe('Test Product');
    }));

    it('should handle API errors during submission', fakeAsync(() => {
      // Set up form with valid values
      component.productForm.setValue({
        name: 'Test Product',
        data: {
          year: '2023',
          price: '£1,234.56',
          'CPU model': 'Intel i7',
          'Hard disk size': '1 TB'
        }
      });

      // Set up the service to return an error
      const errorResponse = { error: { error: 'API Error' } };
      productServiceSpy.addProduct.and.returnValue(throwError(() => errorResponse));

      // Submit the form
      component.onSubmit();
      tick();

      // Dialog should not be closed
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
      
      // Error message should be set
      expect(component.error).toBe('API Error');
      
      // Loading should be set to false
      expect(component.loading).toBeFalsy();
      
      // Should display JSON error
      expect(component.returnedJson).toBeDefined();
    }));
  });

  describe('Dialog Interaction', () => {
    it('should close dialog when onClose is called', () => {
      component.onClose();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should correctly evaluate control validity', () => {
      const nameControl = component.productForm.get('name');
      
      // Initially pristine and untouched, should be considered valid by the UI
      expect(component.isInvalid('name')).toBeFalsy();
      
      // Mark as touched
      nameControl?.markAsTouched();
      expect(component.isInvalid('name')).toBeTruthy();
      
      // Make valid
      nameControl?.setValue('Valid Name');
      expect(component.isInvalid('name')).toBeFalsy();
    });

    it('should return appropriate error messages', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      
      expect(component.getErrorMessage('name')).toContain('required');
      
      // Year pattern error
      const yearControl = component.productForm.get('data')?.get('year');
      yearControl?.setValue('abc');
      yearControl?.markAsTouched();
      
      expect(component.getErrorMessage('year', true)).toContain('Year must be');
    });
  });
}); 