export interface Shipment {
    id: number
    status: Status
    startDate: Date
    endDate: Date
    saleId: number
    pickup: boolean
    adress: string
}

export enum Status {
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED'
}

export interface ShipmentRequest {
    pickup: boolean
    adress: string
}

export interface UpdateShipmentRequest {
    status: string
}