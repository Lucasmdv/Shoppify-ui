import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Wishlist } from '../models/wishlist';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  
  
  readonly API_URL = `${environment.apiUrl}/user`
  
  constructor(private http: HttpClient) {
  }

  getWishlist(userId: number) {
  return this.http.get<Wishlist>(this.API_URL+"/"+userId+"/wishlist");
  }

  clearWishlist(userId: number){
  return this.http.delete<void>(this.API_URL+userId+"/wishlist/products");
  }

 toggleItem(userId: number, productId: number) {
  return this.http.patch<boolean>(`${this.API_URL}/${userId}/wishlist/products/`+productId+"/toggle",null);
  }

  isFavorite(userId:number, productId:number){
    return this.http.get<boolean>(`${this.API_URL}/${userId}/wishlist/products/`+productId)
  }

}
