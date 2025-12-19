export interface ShipmentsParams {
    orderId?: string;
    clientId?: string;
    page?: number;
    size?: number;
    startDate: string | null;
    endDate: string | null;
    minPrice?: number;
    maxPrice?: number;
    pickup?: boolean;
    status: string,
    city: string
}