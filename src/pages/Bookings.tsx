import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  MapPin,
  User,
  Phone,
  Car,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';
import { Booking } from '../types/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [carTypeFilter, setCarTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, serviceTypeFilter, carTypeFilter, dateFilter, paymentStatusFilter]);

  const fetchBookings = async () => {
    try {
      const response = await apiService.getBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.mobile_number.includes(searchTerm) ||
        booking.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pick_up_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.drop_location && booking.drop_location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.ride_status === statusFilter);
    }

    // Service type filter
    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.service_type === serviceTypeFilter);
    }

    // Car type filter
    if (carTypeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.car_type === carTypeFilter);
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === paymentStatusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      
      filtered = filtered.filter(booking => {
        const journeyDate = booking.journey_date;
        const createdDate = format(new Date(booking.created_at), 'yyyy-MM-dd');
        
        switch (dateFilter) {
          case 'today':
            return journeyDate === todayStr;
          case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return journeyDate === format(tomorrow, 'yyyy-MM-dd');
          case 'this_week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return journeyDate >= format(weekStart, 'yyyy-MM-dd') && 
                   journeyDate <= format(weekEnd, 'yyyy-MM-dd');
          case 'created_today':
            return createdDate === todayStr;
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        service_type: serviceTypeFilter !== 'all' ? serviceTypeFilter : undefined,
        car_type: carTypeFilter !== 'all' ? carTypeFilter : undefined,
        payment_status: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Bookings exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status || 'Pending'}
      </span>
    );
  };

  const getServiceTypeBadge = (type: string) => {
    const colors = {
      oneway: 'bg-blue-100 text-blue-800',
      roundtrip: 'bg-green-100 text-green-800',
      airport: 'bg-purple-100 text-purple-800',
      rental: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || colors.oneway}`}>
        {type.replace('_', ' ')}
      </span>
    );
  };

  const formatTime = (timeStr: string) => {
    try {
      // If timeStr is already in 12-hour format with AM/PM, return as is
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        return timeStr;
      }
      
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr; // Return original if parsing fails
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage all cab bookings</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link
            to="/bookings/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            New Booking
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              <option value="oneway">One Way</option>
              <option value="roundtrip">Round Trip</option>
              <option value="airport">Airport</option>
              <option value="rental">Rental</option>
            </select>
          </div>

          {/* Car Type Filter */}
          <div>
            <select
              value={carTypeFilter}
              onChange={(e) => setCarTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Cars</option>
              <option value="hatchback">Hatchback</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="crysta">Crysta</option>
              <option value="scorpio">Scorpio</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Trips</option>
              <option value="tomorrow">Tomorrow's Trips</option>
              <option value="this_week">This Week</option>
              <option value="created_today">Created Today</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-blue-600">{booking.booking_id}</h3>
                  {getServiceTypeBadge(booking.service_type)}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(booking.ride_status)}
                  {getPaymentStatusBadge(booking.payment_status || 'pending')}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{booking.user_name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{booking.mobile_number}</span>
                </div>
              </div>

              {/* Trip Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">
                    {booking.pick_up_location} → {booking.drop_location || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(booking.journey_date), 'MMM d, yyyy')} at {formatTime(booking.pick_up_time)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Car className="h-4 w-4 mr-2" />
                  <span className="capitalize">{booking.car_type}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Estimated Fare</span>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{booking.estimated_fare.toLocaleString()}
                </span>
              </div>

              {/* Payment Info */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Advance Paid:</span>
                  <span className="font-medium">₹{booking.advance_amount_paid.toLocaleString()}</span>
                </div>
                {booking.discount_amount && booking.discount_amount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-₹{booking.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                {booking.refund_amount && booking.refund_amount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Refund:</span>
                    <span className="font-medium text-blue-600">₹{booking.refund_amount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Driver Info (if assigned) */}
              {booking.driver_name && (
                <div className="bg-gray-50 rounded-md p-3 mb-4">
                  <div className="text-sm font-medium text-gray-900">{booking.driver_name}</div>
                  {booking.driver_mobile && (
                    <div className="text-sm text-gray-600">{booking.driver_mobile}</div>
                  )}
                  {booking.vehicle_number && (
                    <div className="text-sm text-gray-600">{booking.vehicle_number}</div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end">
                <Link
                  to={`/bookings/${booking.booking_id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </div>

              {/* Created at */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Created {format(new Date(booking.created_at), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || serviceTypeFilter !== 'all' || carTypeFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating a new booking'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Bookings;