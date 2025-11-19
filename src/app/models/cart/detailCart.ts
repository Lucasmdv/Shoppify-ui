import { Product } from "../product"

export interface DetailCart{
    id?:number
    quantity?:number
    subtotal?:number
    product?: Product
}