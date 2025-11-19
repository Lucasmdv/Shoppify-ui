import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../models/cart/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  readonly API_URL = `${environment.apiUrl}/user/`
  
  constructor(private http: HttpClient) {
  }

  getCart(userId: number) {
  return this.http.get<Cart>(this.API_URL+userId+"/cart");
  }

  clearCart(userId: number){
  return this.http.delete<void>(this.API_URL+userId+"/cart/items");
  }

 addItem(userId: number, productId: number, quantity: number) {
 
    const body = { 
        productId: productId, 
        quantity: quantity 
    };
    
    return this.http.post<Cart>(`${this.API_URL}/${userId}/cart/items`, body);
  }

  removeItem(userId: number, itemId:number) {
  return this.http.delete<void>(this.API_URL+userId+"/cart/items/"+itemId);
  }

  updateItemQuantity(userId: number, itemId:number,quantity:number){
     return this.http.put<Cart>(this.API_URL+userId+"/cart/items/"+itemId,quantity)
  }

  
  addItems(){
  //TODO 
  }
  removeItems(){
  //TODO
  }

  prepareSaleRequest(formValue: any, userId: number, items: any[]): any { 
    //TODO
  }

}
