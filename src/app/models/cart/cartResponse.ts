import { Product } from "../product"

export interface Cart{
    id: number
    total: number
    items: DetailCart[]
}

export interface DetailCart{
    id?:number
    quantity?:number
    subtotal?:number
    product?: Product
}