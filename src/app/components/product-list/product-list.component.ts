import { Component, OnInit, HostListener, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { AddProductModalComponent } from '../add-product-modal/add-product-modal.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { DesktopProductListComponent } from './desktop-list/desktop-product-list.component';
import { MobileProductListComponent } from './mobile-list/mobile-product-list.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule,
    DesktopProductListComponent,
    MobileProductListComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  returnedJson = '';
  offset = 0;
  productLimit = 10;
  hasMore = true;
  isMobile = false;
  readonly MOBILE_BREAKPOINT = 768;

  @ViewChild('desktopGrid') desktopGrid!: DesktopProductListComponent;
  @ViewChild('mobileGrid') mobileGrid!: MobileProductListComponent;

  @ViewChild('lazyLoadTrigger', {static: false}) private lazyLoadTrigger!: ElementRef<HTMLDivElement>;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) {
    // Check initial screen size
    this.checkScreenSize();
  }

  ngOnInit(): void {   
    this.loadProducts(); 
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  @HostListener('window:scroll', ['$event'])
  isScrolledIntoView(){
    if (this.lazyLoadTrigger){
      const rect = this.lazyLoadTrigger.nativeElement.getBoundingClientRect();
      if(rect.bottom <= window.innerHeight){
        this.loadMoreProducts();
      }
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    
    this.productService.getProducts()
      .pipe()
      .subscribe({
        next: (products) => {
          // Since the API doesn't support pagination, handle it client-side for the demo
          const allProducts = products;
          this.products = allProducts.slice(0, this.productLimit);
          this.loading = false;
          this.hasMore = allProducts.length > this.productLimit;
          this.logJsonObject(products);
        },
        error: (err) => {
          this.logJsonObject(err);
          this.error = err.error.error;
          this.loading = false;
        }
      })
  }

  loadMoreProducts(): void {
    if (this.loading || !this.hasMore) return;
    
    this.loading = true;
    this.offset += this.productLimit;
    
    this.productService.getProducts()
      .pipe()
      .subscribe({
        next: (products) => {
          // Handle pagination client-side
          const allProducts = products;
          // Get remaining products to load
          const newProducts = allProducts.slice(this.offset, (this.offset + this.productLimit));
          
          if (newProducts.length === 0) {
            this.hasMore = false;
          } else {
            this.products = [...this.products, ...newProducts];
          }

          this.logJsonObject(products);
          this.loading = false;
        },
        error: (err) => {
            this.error = err.error.error;
            this.logJsonObject(err);
            this.loading = false;
        }
      });
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddProductModalComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.newProduct) {
        //  Add new product to the top of the list as if we add to the bottom it may sandwich
        // the new product between two existing products due to the local pagination
        this.products.unshift(result.newProduct);
        this.logJsonObject(result.response);
      }
    });
  }
  
  openDeleteModal(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { product, response: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteProduct(product);
      }
    });
  }
  
  deleteProduct(product: Product): void {
    if (!product || !product.id) return;
    
    this.loading = true;
    
    this.productService.deleteProduct(product.id)
      .pipe()
      .subscribe({
        next: (response) => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.logJsonObject(response);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error.error;
          this.logJsonObject(err);
          this.loading = false;
        }
      });
  }

  private logJsonObject(jsonObject: any){
    this.returnedJson = JSON.stringify(jsonObject, null, 2);
  }
} 