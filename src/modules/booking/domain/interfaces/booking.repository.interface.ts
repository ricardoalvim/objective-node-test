import { Booking } from '../entity/booking.entity'

export interface IBookingRepository {
  save(booking: Booking): Promise<void>
  findById(id: string): Promise<Booking | null>
  findByScheduleId(scheduleId: string): Promise<Booking | null>
  findExpiredWaiting(): Promise<Booking[]>
  findAll(): Promise<Booking[]>
  delete(id: string): Promise<void>
}
