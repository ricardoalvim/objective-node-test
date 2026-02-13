import { IMovieRepository } from '@modules/catalog/domain/interfaces/catalog.repository.interface'
import { IBookingRepository } from '@modules/booking/domain/interfaces/booking.repository.interface'
import { BookingStatus } from '@shared/enum/booking-status.enum'
import {
    MovieStats,
    BookingStats,
    TopMovie,
    TopCustomer,
    SystemStatus,
} from '../presentation/dto/monitoring.dto'

export class MonitoringService {
    constructor(
        private readonly movieRepository: IMovieRepository,
        private readonly bookingRepository: IBookingRepository,
    ) { }

    async getStatus(): Promise<SystemStatus> {
        const movieStats = await this.getMovieStats()
        const bookingStats = await this.getBookingStats()
        const mostRented = await this.getMostRentedMovie()
        const topCustomers = await this.getTopCustomers()

        const totalMovies = movieStats.total
        const leasedMovies = movieStats.leased
        const utilizationRate = totalMovies > 0
            ? `${Math.round((leasedMovies / totalMovies) * 100)}%`
            : '0%'

        return {
            movies: movieStats,
            bookings: bookingStats,
            statistics: {
                utilizationRate,
                mostRentedMovie: mostRented,
                topCustomers,
            },
        }
    }

    private async getMovieStats(): Promise<MovieStats> {
        const allMovies = await this.movieRepository.findAll()
        const total = allMovies.length
        const available = allMovies.filter(m => m.available).length

        const activeBookings = await this.bookingRepository.findAll()
        const reserved = activeBookings.filter(
            b => b.status === BookingStatus.WAITING
        ).length
        const leased = activeBookings.filter(
            b => b.status === BookingStatus.LEASED
        ).length

        return { total, available, reserved, leased }
    }

    private async getBookingStats(): Promise<BookingStats> {
        const allBookings = await this.bookingRepository.findAll()
        const currentTime = new Date()

        const activeReservations = allBookings.filter(b => {
            if (b.status !== BookingStatus.WAITING) return false
            if (b.expiresAt && new Date(b.expiresAt) < currentTime) return false
            return true
        }).length

        const expiredReservations = allBookings.filter(b => {
            if (b.status !== BookingStatus.WAITING) return false
            if (b.expiresAt && new Date(b.expiresAt) < currentTime) return true
            return false
        }).length

        const activeLeases = allBookings.filter(
            b => b.status === BookingStatus.LEASED
        ).length

        const totalReturns = allBookings.filter(
            b => b.status === BookingStatus.RETURNED
        ).length

        return {
            activeReservations,
            expiredReservations,
            activeLeases,
            totalReturns,
        }
    }

    private async getMostRentedMovie(): Promise<TopMovie | undefined> {
        const allBookings = await this.bookingRepository.findAll()
        const rentalsByMovie = new Map<string, number>()

        allBookings
            .filter(b => b.status === BookingStatus.RETURNED)
            .forEach(b => {
                const count = rentalsByMovie.get(b.movieId) || 0
                rentalsByMovie.set(b.movieId, count + 1)
            })

        if (rentalsByMovie.size === 0) return undefined

        const [mostRentedId, maxRentals] = Array.from(rentalsByMovie.entries())
            .reduce((acc, [id, count]) => count > acc[1] ? [id, count] : acc)

        const movie = await this.movieRepository.findById(mostRentedId)
        return movie ? { id: movie.id, name: movie.name, rentalCount: maxRentals } : undefined
    }

    private async getTopCustomers(): Promise<TopCustomer[]> {
        const allBookings = await this.bookingRepository.findAll()
        const rentalsByCustomer = new Map<string, { name: string; email: string; count: number }>()

        allBookings
            .filter(b => b.status === BookingStatus.RETURNED && b.customer)
            .forEach(b => {
                const email = b.customer!.email
                const current = rentalsByCustomer.get(email) || {
                    name: b.customer!.name,
                    email,
                    count: 0,
                }
                current.count += 1
                rentalsByCustomer.set(email, current)
            })

        return Array.from(rentalsByCustomer.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(({ name, email, count }) => ({
                name,
                email,
                rentalCount: count,
            }))
    }
}
