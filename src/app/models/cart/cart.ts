import { DetailCart } from "./detailCart"

export interface Cart{
    id: number
    total: number
    items: DetailCart[]
}