import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  Clock,
  DollarSign,
  FileText,
  Truck
} from 'lucide-react';
import { apiService } from '../services/api';
import { Booking } from '../types/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  const fetchBooking = async (id: string) => {
    try {
      const response = await apiService.getBooking(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: currentValue || '' });
  };

  const handleSave = async (field: string) => {
    if (!booking || !bookingId) return;

    try {
      const updates = { [field]: editValues[field] };
      await apiService.updateBooking(bookingId, updates);
      
      setBooking({ ...booking, [field]: editValues[field] });
      setEditingField(null);
      setEditValues({});
      toast.success('Booking updated successfully');
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const EditableField = ({ 
    field, 
    label, 
    value, 
    type = 'text', 
    options = null,
    icon: Icon,
    required = false 
  }: any) => {
    const isEditing = editingField === field;
    
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center min-w-0 flex-1">
          <Icon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-600">{label}</div>
            {isEditing ? (
              <div className="mt-1">
                {options ? (
                  <select
                    value={editValues[field] || ''}
                    onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {options.map((option: any) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={editValues[field] || ''}
                    onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-900 mt-1">
                {type === 'select' && options ? 
                  options.find((opt: any) => opt.value === value)?.label || value :
                  value || 'Not set'
                }
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {isEditing ? (
            <>
              <button
                onClick={() => handleSave(field)}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEdit(field, value)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Booking not found</h3>
        <p className="text-gray-500 mt-2">The booking you're looking for doesn't exist.</p>
        <Link
          to="/bookings"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Link>
      </div>
    );
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
  ];

  const paymentMethodOptions = [
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'wallet', label: 'Wallet' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/bookings"
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{booking.booking_id}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.ride_status)}`}>
                {booking.ride_status.replace('_', ' ')}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                Created {format(new Date(booking.created_at), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
            </div>
            <div className="px-6 py-4 space-y-1">
              <EditableField
                field="user_name"
                label="Name"
                value={booking.user_name}
                icon={User}
                required
              />
              <EditableField
                field="user_email"
                label="Email"
                value={booking.user_email}
                type="email"
                icon={Mail}
                required
              />
              <EditableField
                field="mobile_number"
                label="Mobile"
                value={booking.mobile_number}
                type="tel"
                icon={Phone}
                required
              />
            </div>
          </div>

          {/* Trip Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Trip Information</h2>
            </div>
            <div className="px-6 py-4 space-y-1">
              <div className="py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600">Route</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {booking.pick_up_location} → {booking.drop_location || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600">Journey Date & Time</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {format(new Date(booking.journey_date), 'EEEE, MMMM d, yyyy')} at {booking.pick_up_time}
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Car className="h-4 w-4 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600">Service & Car Type</div>
                    <div className="text-sm text-gray-900 mt-1 capitalize">
                      {booking.service_type} - {booking.car_type}
                    </div>
                  </div>
                </div>
              </div>

              {booking.return_date && (
                <div className="py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600">Return Date</div>
                      <div className="text-sm text-gray-900 mt-1">
                        {format(new Date(booking.return_date), 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <EditableField
                field="ride_status"
                label="Status"
                value={booking.ride_status}
                type="select"
                options={statusOptions}
                icon={FileText}
              />
            </div>
          </div>

          {/* Driver Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Driver Information</h2>
            </div>
            <div className="px-6 py-4 space-y-1">
              <EditableField
                field="driver_name"
                label="Driver Name"
                value={booking.driver_name}
                icon={User}
              />
              <EditableField
                field="driver_mobile"
                label="Driver Mobile"
                value={booking.driver_mobile}
                type="tel"
                icon={Phone}
              />
              <EditableField
                field="vehicle_number"
                label="Vehicle Number"
                value={booking.vehicle_number}
                icon={Truck}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Pricing</h2>
            </div>
            <div className="px-6 py-4 space-y-1">
              <div className="py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600">Estimated Fare</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      ₹{booking.estimated_fare.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <EditableField
                field="advance_amount_paid"
                label="Advance Paid"
                value={booking.advance_amount_paid}
                type="number"
                icon={DollarSign}
              />

              <EditableField
                field="amount_paid_to_driver"
                label="Amount Paid to Driver"
                value={booking.amount_paid_to_driver}
                type="number"
                icon={DollarSign}
              />

              {booking.discount_amount && (
                <div className="py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600">Discount</div>
                      <div className="text-sm text-green-600 mt-1">
                        -₹{booking.discount_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment</h2>
            </div>
            <div className="px-6 py-4 space-y-1">
              <EditableField
                field="payment_status"
                label="Payment Status"
                value={booking.payment_status}
                type="select"
                options={paymentStatusOptions}
                icon={DollarSign}
              />

              <EditableField
                field="payment_method"
                label="Payment Method"
                value={booking.payment_method}
                type="select"
                options={paymentMethodOptions}
                icon={DollarSign}
              />

              <EditableField
                field="payment_id"
                label="Payment ID"
                value={booking.payment_id}
                icon={FileText}
              />

              {booking.payment_date && (
                <div className="py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600">Payment Date</div>
                      <div className="text-sm text-gray-900 mt-1">
                        {format(new Date(booking.payment_date), 'MMM d, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Additional Info</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-600">KM Limit</div>
                <div className="text-sm text-gray-900 mt-1">{booking.km_limit} km</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-600">Booking Source</div>
                <div className="text-sm text-gray-900 mt-1 capitalize">{booking.booking_source}</div>
              </div>

              {booking.rental_booking_type && (
                <div>
                  <div className="text-sm font-medium text-gray-600">Rental Type</div>
                  <div className="text-sm text-gray-900 mt-1">{booking.rental_booking_type}</div>
                </div>
              )}

              {booking.cancellation_reason && (
                <div>
                  <div className="text-sm font-medium text-gray-600">Cancellation Reason</div>
                  <div className="text-sm text-gray-900 mt-1">{booking.cancellation_reason}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;