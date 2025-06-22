export interface Booking {
  id: number;
  booking_id: string;
  user_name: string;
  user_email: string;
  km_limit: number;
  mobile_number: string;
  service_type: 'oneway' | 'airport' | 'roundtrip' | 'rental';
  pick_up_location: string;
  pick_up_time: string;
  journey_date: string;
  booking_date: string;
  car_type: 'hatchback' | 'sedan' | 'suv' | 'crysta' | 'scorpio';
  drop_location?: string;
  estimated_fare: number;
  booking_source: string;
  return_date?: string;
  rental_booking_type?: string;
  driver_name?: string;
  driver_mobile?: string;
  vehicle_number?: string;
  amount_paid_to_driver?: number;
  advance_amount_paid: number;
  payment_id?: string;
  payment_status?: 'paid' | 'pending' | 'failed';
  payment_method?: 'upi' | 'card' | 'cash' | 'wallet';
  payment_date?: string;
  refund_status?: 'initiated' | 'completed' | 'failed';
  refund_amount?: number;
  cancellation_reason?: string;
  ride_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  discount_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface FareEstimate {
  selected_car: {
    car_type: string;
    estimated_fare: number;
    km_limit: number;
    breakdown: {
      base_fare: number;
      toll_charges: number;
      state_tax: number;
      gst: number;
      driver_allowance: number;
    };
  };
  all_car_fares: Record<string, {
    estimated_fare: number;
    km_limit: number;
    breakdown: {
      base_fare: number;
      toll_charges: number;
      state_tax: number;
      gst: number;
      driver_allowance: number;
    };
  }>;
  service_details: {
    service_type: string;
    pick_up_location: string;
    drop_location?: string;
    journey_date: string;
    pick_up_time: string;
    return_date?: string;
    rental_duration?: string;
    distance: number;
  };
}

export interface CreateBookingRequest {
  user_name: string;
  user_email: string;
  km_limit: number;
  mobile_number: string;
  service_type: 'oneway' | 'airport' | 'roundtrip' | 'rental';
  pick_up_location: string;
  pick_up_time: string;
  journey_date: string;
  car_type: 'hatchback' | 'sedan' | 'suv' | 'crysta' | 'scorpio';
  drop_location?: string;
  estimated_fare: number;
  booking_source: string;
  return_date?: string;
  rental_booking_type?: string;
  advance_amount_paid: number;
}

export interface FareEstimateRequest {
  km_limit: number;
  mobile_number: string;
  service_type: 'oneway' | 'airport' | 'roundtrip' | 'rental';
  pick_up_location: string;
  pick_up_time: string;
  journey_date: string;
  car_type: 'hatchback' | 'sedan' | 'suv' | 'crysta' | 'scorpio';
  drop_location?: string;
  booking_source: string;
  return_date?: string;
  rental_booking_type?: string;
}

export interface CustomerNumber {
  id: number;
  customer_name: string;
  contact_number: string;
  platform: string;
  comment: string;
  created_at: string;
}