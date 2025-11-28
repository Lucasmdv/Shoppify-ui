import { HalResource } from "./hal/halResource";

export interface Product extends HalResource{
  id: number;
  name: string;
  price: number;
  unitPrice: number;
  stock: number;
  sku: string;
  discountPercentage : number
  priceWithDiscount?: number 
  barcode: string;
  description: string;
  brand: string;
  imgURL: string;
  soldQuantity:number;
  categories: string[];
  inactive: boolean;
}
