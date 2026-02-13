import { Db, Filter } from 'mongodb'
import { BaseRepository } from '@shared/infra/repository.base'
import { IBookingRepository } from '../domain/interfaces/booking.repository.interface'
import { Booking } from '../domain/entity/booking.entity'
import { BookingStatus } from '@shared/enum/booking-status.enum'

export class BookingRepository extends BaseRepository<Booking> implements IBookingRepository {
    constructor(db: Db) {
        super(db, 'bookings')
    }

    async save(booking: Booking): Promise<void> {
        const query: Filter<Booking> = { id: booking.id }
        await this.collection.replaceOne(query, booking, { upsert: true })
    }

    async findById(id: string): Promise<Booking | null> {
        const query: Filter<Booking> = { id }
        const result = await this.collection.findOne(query)
        return result as Booking | null
    }

    async findByScheduleId(scheduleId: string): Promise<Booking | null> {
        const query: Filter<Booking> = { scheduleId }
        const result = await this.collection.findOne(query)
        return result as Booking | null
    }

    async findExpiredWaiting(): Promise<Booking[]> {
        const query: Filter<Booking> = {
            status: BookingStatus.WAITING,
            expiresAt: { $lt: new Date() },
        }
        return this.collection.find(query).toArray() as Promise<Booking[]>
    }

    async delete(id: string): Promise<void> {
        const query: Filter<Booking> = { id }
        await this.collection.deleteOne(query)
    }
}
