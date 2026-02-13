export interface MovieStats {
    total: number
    available: number
    reserved: number
    leased: number
}

export interface BookingStats {
    activeReservations: number
    expiredReservations: number
    activeLeases: number
    totalReturns: number
}

export interface TopMovie {
    id: string
    name: string
    rentalCount: number
}

export interface TopCustomer {
    name: string
    email: string
    rentalCount: number
}

export interface SystemStatus {
    movies: MovieStats
    bookings: BookingStats
    statistics: {
        utilizationRate: string
        mostRentedMovie?: TopMovie
        topCustomers: TopCustomer[]
    }
}
