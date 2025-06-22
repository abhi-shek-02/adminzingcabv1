import { Booking, Contact, FareEstimate, CreateBookingRequest, FareEstimateRequest } from '../types/api';

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Bookings
  async getBookings(): Promise<{ success: boolean; data: Booking[] }> {
    return this.request('/api/booking');
  }

  async getBooking(bookingId: string): Promise<{ success: boolean; data: Booking }> {
    return this.request(`/api/booking/${bookingId}`);
  }

  async createBooking(booking: CreateBookingRequest): Promise<{ success: boolean; data: any }> {
    return this.request('/api/booking', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<{ success: boolean; data: Booking }> {
    return this.request(`/api/booking/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getFareEstimate(request: FareEstimateRequest): Promise<{ success: boolean; data: FareEstimate }> {
    return this.request('/api/fare/estimate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Contacts
  async getContacts(): Promise<{ success: boolean; data: Contact[] }> {
    return this.request('/api/contact');
  }

  // Export bookings to CSV
  async exportBookings(filters?: any): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/booking/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters || {}),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

export const apiService = new ApiService();