import { Product } from "./product"


export interface Wishlist{
    id: number
    clientId:number
    products: Product[]
}