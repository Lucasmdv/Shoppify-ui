import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Product } from '../../models/product';
import { WishlistService } from '../../services/wishlist-service';
import { ProductCard } from '../../components/product-card/product-card';
import { detailWishlist } from '../../models/detailWishlist';
import { Wishlist } from '../../models/wishlist';

@Component({
  selector: 'app-favorites-page',
  imports: [ProductCard],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.css'
})
export class FavoritesPage implements OnInit {


private aService = inject(AuthService)


wishlistService = inject(WishlistService)
wishList! : Wishlist
userId = this.aService.user()?.id || undefined

ngOnInit(){
 this.renderWishlist()
}


renderWishlist(){
if(!this.userId){return}

this.wishlistService.getWishlist(this.userId).subscribe(
  {
    next:(value) => {
    this.wishList = value
},})
}

deleteItem(productId: number){
if(!this.userId){return}

this.wishlistService.toggleItem(this.userId,productId).subscribe(
  {
    next:(value) => {
    this.renderWishlist()
},})
}

}
