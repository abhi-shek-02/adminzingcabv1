import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Save } from 'lucide-react';
import { apiService } from '../services/api';
import { CreateBookingRequest, FareEstimateRequest, FareEstimate } from '../types/api';
import toast from 'react-hot-toast';

const CreateBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Fare Estimate, 2: Booking Details
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [fareRequest, setFareRequest] = useState<FareEstimateRequest>({
    km_limit: 300,
    mobile_number: '',
    service_type: 'oneway',
    pick_up_location: '',
    pick_up_time: '',
    journey_date: '',
    car_type: 'sedan',
    booking_source: 'admin',
    drop_location: '',
  });

  const [bookingData, setBookingData] = useState<Partial<CreateBookingRequest>>({
    user_name: '',
    user_email: '',
    advance_amount_paid: 0,
  });

  const handleFareEstimate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.getFareEstimate(fareRequest);
      setFareEstimate(response.data);
      setStep(2);
      toast.success('Fare calculated successfully');
    } catch (error) {
      console.error('Failed to calculate fare:', error);
      toast.error('Failed to calculate fare');
    } finally {
      setLoading(false);
    }
  }, [fareRequest]);

  const handleCreateBooking = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fareEstimate) return;

    setLoading(true);

    try {
      const booking: CreateBookingRequest = {
        ...fareRequest,
        user_name: bookingData.user_name!,
        user_email: bookingData.user_email!,
        estimated_fare: fareEstimate.selected_car.estimated_fare,
        advance_amount_paid: bookingData.advance_amount_paid!,
      };

      const response = await apiService.createBooking(booking);
      toast.success('Booking created successfully');
      navigate(`/bookings/${response.data.booking_id}`);
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  }, [fareRequest, fareEstimate, bookingData, navigate]);

  const handleFareRequestChange = useCallback((field: keyof FareEstimateRequest, value: any) => {
    setFareRequest(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBookingDataChange = useCallback((field: keyof CreateBookingRequest, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  }, []);

  const renderFareEstimateForm = () => (
    <form onSubmit={handleFareEstimate} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Type</label>
          <select
            value={fareRequest.service_type}
            onChange={(e) => handleFareRequestChange('service_type', e.target.value as any)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="oneway">One Way</option>
            <option value="roundtrip">Round Trip</option>
            <option value="airport">Airport</option>
            <option value="rental">Rental</option>
          </select>
        </div>

        {/* Car Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Car Type</label>
          <select
            value={fareRequest.car_type}
            onChange={(e) => handleFareRequestChange('car_type', e.target.value as any)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="hatchback">Hatchback</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="crysta">Crysta</option>
            <option value="scorpio">Scorpio</option>
          </select>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
          <input
            type="tel"
            value={fareRequest.mobile_number}
            onChange={(e) => handleFareRequestChange('mobile_number', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* KM Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">KM Limit</label>
          <input
            type="number"
            value={fareRequest.km_limit}
            onChange={(e) => handleFareRequestChange('km_limit', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
          <input
            type="text"
            value={fareRequest.pick_up_location}
            onChange={(e) => handleFareRequestChange('pick_up_location', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Drop Location */}
        {fareRequest.service_type !== 'rental' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Drop Location</label>
            <input
              type="text"
              value={fareRequest.drop_location}
              onChange={(e) => handleFareRequestChange('drop_location', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required={fareRequest.service_type !== 'rental'}
            />
          </div>
        )}

        {/* Journey Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Journey Date</label>
          <input
            type="date"
            value={fareRequest.journey_date}
            onChange={(e) => handleFareRequestChange('journey_date', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Pickup Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pickup Time</label>
          <input
            type="time"
            value={fareRequest.pick_up_time}
            onChange={(e) => handleFareRequestChange('pick_up_time', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Return Date (for Round Trip) */}
        {fareRequest.service_type === 'roundtrip' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Return Date</label>
            <input
              type="date"
              value={fareRequest.return_date || ''}
              onChange={(e) => handleFareRequestChange('return_date', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Rental Type (for Rental) */}
        {fareRequest.service_type === 'rental' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Rental Type</label>
            <select
              value={fareRequest.rental_booking_type || ''}
              onChange={(e) => handleFareRequestChange('rental_booking_type', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Duration</option>
              <option value="4hr">4 Hours</option>
              <option value="8hr">8 Hours</option>
              <option value="12hr">12 Hours</option>
              <option value="1day">1 Day</option>
              <option value="2day">2 Days</option>
              <option value="3day">3 Days</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Calculator className="h-4 w-4 mr-2" />
          {loading ? 'Calculating...' : 'Calculate Fare'}
        </button>
      </div>
    </form>
  );

  const renderBookingForm = () => (
    <div className="space-y-6">
      {/* Fare Summary */}
      {fareEstimate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Fare Estimate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-blue-700">Selected Car: {fareEstimate.selected_car.car_type}</div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{fareEstimate.selected_car.estimated_fare.toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-blue-700">
              <div>Base Fare: ₹{fareEstimate.selected_car.breakdown.base_fare}</div>
              <div>Toll Charges: ₹{fareEstimate.selected_car.breakdown.toll_charges}</div>
              <div>State Tax: ₹{fareEstimate.selected_car.breakdown.state_tax}</div>
              <div>GST: ₹{fareEstimate.selected_car.breakdown.gst}</div>
              <div>Driver Allowance: ₹{fareEstimate.selected_car.breakdown.driver_allowance}</div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Form */}
      <form onSubmit={handleCreateBooking} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              value={bookingData.user_name}
              onChange={(e) => handleBookingDataChange('user_name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Email</label>
            <input
              type="email"
              value={bookingData.user_email}
              onChange={(e) => handleBookingDataChange('user_email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Advance Amount</label>
            <input
              type="number"
              value={bookingData.advance_amount_paid}
              onChange={(e) => handleBookingDataChange('advance_amount_paid', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fare
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/bookings"
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Booking</h1>
          <p className="text-gray-600">
            {step === 1 ? 'Calculate fare estimate' : 'Enter customer details'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">Fare Estimate</span>
        </div>
        
        <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">Booking Details</span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-8">
          {step === 1 ? renderFareEstimateForm() : renderBookingForm()}
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;