import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { ProductCard } from '../../components/product-card/product-card';
import { detailWishlist } from '../../models/detailWishlist';
import { CartService } from '../../services/cart-service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-favorites-page',
  imports: [ProductCard],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.css'
})
export class FavoritesPage implements OnInit {


private aService = inject(AuthService)

cartService = inject(CartService)
wishlistService = inject(WishlistService)
wishList! : detailWishlist[]
userId = this.aService.user()?.id || undefined

ngOnInit(){
 this.renderWishlist()
}


renderWishlist(){
if(!this.userId){return}

this.wishlistService.getWishlist(this.userId).subscribe(
  {
    next:(value) => {
    this.wishList = value.products
    console.log(value)
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



addToCart(productId : number){
if(!this.userId){return}
this.cartService.addItem(this.userId,productId,1).subscribe({
  next() {
   Swal.fire({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      icon: 'success',
      title: `Agregado correctamente.`,
      customClass: {
        popup: 'swal2-toast-dark'
      }})
    
  },error() {
     Swal.fire({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      icon: 'error',
      title: `Stock insuficiente para agregar al carrito.`,
      customClass: {
        popup: 'swal2-toast-dark'
      }})
  },

})
}



}
