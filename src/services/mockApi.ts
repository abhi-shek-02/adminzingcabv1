import { Booking, Contact, FareEstimate, CreateBookingRequest, FareEstimateRequest } from '../types/api';

// Mock data
const mockBookings: Booking[] = [
  {
    id: 1,
    booking_id: "ZC1234ABCD",
    user_name: "John Doe",
    user_email: "john@example.com",
    km_limit: 300,
    mobile_number: "9876543210",
    service_type: "oneway",
    pick_up_location: "Mumbai",
    pick_up_time: "09:00",
    journey_date: "2024-01-15",
    booking_date: "2024-01-01",
    car_type: "sedan",
    drop_location: "Pune",
    estimated_fare: 2500,
    booking_source: "admin",
    return_date: undefined,
    rental_booking_type: undefined,
    driver_name: "Rajesh Kumar",
    driver_mobile: "9876543211",
    vehicle_number: "MH12AB1234",
    amount_paid_to_driver: 2000,
    advance_amount_paid: 500,
    payment_id: "PAY123456",
    payment_status: "paid",
    payment_method: "upi",
    payment_date: "2024-01-01T10:00:00.000Z",
    refund_status: undefined,
    refund_amount: undefined,
    cancellation_reason: undefined,
    ride_status: "completed",
    discount_amount: 100,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    booking_id: "ZC5678EFGH",
    user_name: "Jane Smith",
    user_email: "jane@example.com",
    km_limit: 200,
    mobile_number: "9876543212",
    service_type: "roundtrip",
    pick_up_location: "Delhi",
    pick_up_time: "14:00",
    journey_date: "2024-01-20",
    booking_date: "2024-01-02",
    car_type: "suv",
    drop_location: "Agra",
    estimated_fare: 3500,
    booking_source: "admin",
    return_date: "2024-01-22",
    rental_booking_type: undefined,
    driver_name: "Amit Singh",
    driver_mobile: "9876543213",
    vehicle_number: "DL01CD5678",
    amount_paid_to_driver: 3000,
    advance_amount_paid: 1000,
    payment_id: "PAY789012",
    payment_status: "paid",
    payment_method: "card",
    payment_date: "2024-01-02T11:00:00.000Z",
    refund_status: undefined,
    refund_amount: undefined,
    cancellation_reason: undefined,
    ride_status: "confirmed",
    discount_amount: 200,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z"
  },
  {
    id: 3,
    booking_id: "ZC9012IJKL",
    user_name: "Mike Johnson",
    user_email: "mike@example.com",
    km_limit: 150,
    mobile_number: "9876543214",
    service_type: "airport",
    pick_up_location: "Bangalore",
    pick_up_time: "06:00",
    journey_date: "2024-01-25",
    booking_date: "2024-01-03",
    car_type: "hatchback",
    drop_location: "Bangalore Airport",
    estimated_fare: 1200,
    booking_source: "admin",
    return_date: undefined,
    rental_booking_type: undefined,
    driver_name: undefined,
    driver_mobile: undefined,
    vehicle_number: undefined,
    amount_paid_to_driver: undefined,
    advance_amount_paid: 300,
    payment_id: undefined,
    payment_status: "pending",
    payment_method: undefined,
    payment_date: undefined,
    refund_status: undefined,
    refund_amount: undefined,
    cancellation_reason: undefined,
    ride_status: "pending",
    discount_amount: undefined,
    created_at: "2024-01-03T00:00:00.000Z",
    updated_at: "2024-01-03T00:00:00.000Z"
  }
];

const mockContacts: Contact[] = [
  {
    id: 1,
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "9876543215",
    subject: "General Inquiry",
    message: "I would like to know more about your services and pricing.",
    created_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "Bob Wilson",
    email: "bob@example.com",
    phone: "9876543216",
    subject: "Booking Issue",
    message: "I had an issue with my recent booking. Can you help me resolve it?",
    created_at: "2024-01-02T00:00:00.000Z"
  }
];

class MockApiService {
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check
  async healthCheck() {
    await this.delay(100);
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: "development"
    };
  }

  // Bookings
  async getBookings(): Promise<{ success: boolean; data: Booking[] }> {
    await this.delay();
    return { success: true, data: mockBookings };
  }

  async getBooking(bookingId: string): Promise<{ success: boolean; data: Booking }> {
    await this.delay();
    const booking = mockBookings.find(b => b.booking_id === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return { success: true, data: booking };
  }

  async createBooking(booking: CreateBookingRequest): Promise<{ success: boolean; data: any }> {
    await this.delay();
    const newBooking: Booking = {
      id: mockBookings.length + 1,
      booking_id: `ZC${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      ...booking,
      booking_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ride_status: 'pending',
      driver_name: undefined,
      driver_mobile: undefined,
      vehicle_number: undefined,
      amount_paid_to_driver: undefined,
      payment_id: undefined,
      payment_status: undefined,
      payment_method: undefined,
      payment_date: undefined,
      refund_status: undefined,
      refund_amount: undefined,
      cancellation_reason: undefined,
      discount_amount: undefined,
    };
    mockBookings.push(newBooking);
    return { 
      success: true, 
      data: {
        booking_id: newBooking.booking_id,
        estimated_fare: newBooking.estimated_fare,
        advance_amount: newBooking.advance_amount_paid,
        status: newBooking.ride_status,
        pickup_date: newBooking.journey_date,
        pickup_time: newBooking.pick_up_time,
        service_type: newBooking.service_type,
        car_type: newBooking.car_type,
        km_limit: newBooking.km_limit,
        booking_date: newBooking.booking_date
      }
    };
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<{ success: boolean; data: Booking }> {
    await this.delay();
    const bookingIndex = mockBookings.findIndex(b => b.booking_id === bookingId);
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }
    mockBookings[bookingIndex] = { ...mockBookings[bookingIndex], ...updates, updated_at: new Date().toISOString() };
    return { success: true, data: mockBookings[bookingIndex] };
  }

  async getFareEstimate(request: FareEstimateRequest): Promise<{ success: boolean; data: FareEstimate }> {
    await this.delay();
    
    const baseFare = request.car_type === 'hatchback' ? 15 : 
                    request.car_type === 'sedan' ? 18 : 
                    request.car_type === 'suv' ? 22 : 
                    request.car_type === 'crysta' ? 25 : 28;
    
    const distance = request.km_limit;
    const estimatedFare = Math.round(baseFare * distance);
    
    const breakdown = {
      base_fare: Math.round(estimatedFare * 0.7),
      toll_charges: Math.round(estimatedFare * 0.1),
      state_tax: Math.round(estimatedFare * 0.05),
      gst: Math.round(estimatedFare * 0.12),
      driver_allowance: Math.round(estimatedFare * 0.03)
    };

    const allCarFares = {
      hatchback: { estimated_fare: Math.round(15 * distance), km_limit: distance, breakdown },
      sedan: { estimated_fare: Math.round(18 * distance), km_limit: distance, breakdown },
      suv: { estimated_fare: Math.round(22 * distance), km_limit: distance, breakdown },
      crysta: { estimated_fare: Math.round(25 * distance), km_limit: distance, breakdown },
      scorpio: { estimated_fare: Math.round(28 * distance), km_limit: distance, breakdown }
    };

    return {
      success: true,
      data: {
        selected_car: {
          car_type: request.car_type,
          estimated_fare: allCarFares[request.car_type as keyof typeof allCarFares].estimated_fare,
          km_limit: distance,
          breakdown
        },
        all_car_fares: allCarFares,
        service_details: {
          service_type: request.service_type,
          pick_up_location: request.pick_up_location,
          drop_location: request.drop_location,
          journey_date: request.journey_date,
          pick_up_time: request.pick_up_time,
          return_date: request.return_date,
          rental_duration: request.rental_booking_type,
          distance
        }
      }
    };
  }

  // Contacts
  async getContacts(): Promise<{ success: boolean; data: Contact[] }> {
    await this.delay();
    return { success: true, data: mockContacts };
  }

  // Export bookings to CSV
  async exportBookings(filters?: any): Promise<Blob> {
    await this.delay();
    const csvContent = "Booking ID,User Name,Email,Mobile,Service Type,Car Type,Pickup Location,Drop Location,Journey Date,Status,Fare\n" +
      mockBookings.map(b => 
        `${b.booking_id},${b.user_name},${b.user_email},${b.mobile_number},${b.service_type},${b.car_type},${b.pick_up_location},${b.drop_location || ''},${b.journey_date},${b.ride_status},${b.estimated_fare}`
      ).join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  }
}

export const mockApiService = new MockApiService(); 