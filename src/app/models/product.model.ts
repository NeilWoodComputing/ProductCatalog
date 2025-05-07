export interface ProductData {
  year?: string;
  price?: string;
  'CPU model'?: string;
  'Hard disk size'?: string;
}

export interface Product {
  id?: string;
  name: string;
  data?: ProductData;
}

export interface ApiResponse {
  id?: string;
  name?: string;
  data?: ProductData;
  message?: string;
  error?: string;
} 