export interface Shipment {
    id: number
    status: string
    startDate: Date
    endDate: Date
    saleId: number
    pickup: boolean
    adress: string
}

export interface ShipmentRequest {
    pickup: boolean
    adress: string
}

export interface UpdateShipmentRequest {
    status: string
}