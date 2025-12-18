export interface Shipment {
    id: number
    status: Status
    startDate: Date
    endDate: Date
    saleId: number
    pickup: boolean
    street: string
    number: number
    city: string
    zip: number
    notes: string
}

export enum Status {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED'
}

export interface ShipmentRequest {
    pickup: boolean
    street?: string
    number?: number
    city?: string
    zip?: number
    notes?: string
}

export interface UpdateShipmentRequest {
    status: string
}