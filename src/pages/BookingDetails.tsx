import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Truck,
  Copy,
  CheckCircle,
  Download
} from 'lucide-react';
import { apiService } from '../services/api';
import { Booking } from '../types/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../assets/logo.png';

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  const fetchBooking = useCallback(async (id: string) => {
    try {
      const response = await apiService.getBooking(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback((field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: currentValue || '' });
  }, []);

  const handleSave = useCallback(async (field: string) => {
    if (!booking || !bookingId) return;

    try {
      const updates = { [field]: editValues[field] };
      await apiService.updateBooking(bookingId, updates);
      
      setBooking((prev: Booking | null) => prev ? { ...prev, [field]: editValues[field] } : null);
      setEditingField(null);
      setEditValues({});
      toast.success('Booking updated successfully');
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking');
    }
  }, [booking, bookingId, editValues]);

  const handleCancel = useCallback(() => {
    setEditingField(null);
    setEditValues({});
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setEditValues((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  }, []);

  const generateBookingMessage = useCallback(() => {
    if (!booking) return '';

    const formatDate = (dateStr: string) => {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    };

    const formatTime = (timeStr: string) => {
      return timeStr.split(' ')[0]; // Remove timezone part
    };

    const message = `🚗 ZingCab Booking Confirmation

📋 Booking ID: ${booking.booking_id}
${booking.user_name ? `Customer: ${booking.user_name}` : ''}
Phone: ${booking.mobile_number}
${booking.user_email ? `Email: ${booking.user_email}` : ''}

Pickup: ${booking.pick_up_location}
Drop: ${booking.drop_location || 'N/A'}
Date: ${formatDate(booking.journey_date)}
Time: ${formatTime(booking.pick_up_time)}
Car Type: ${booking.car_type.toUpperCase()}
Service: ${booking.service_type.replace('_', ' ').toUpperCase()}

Estimated Fare: ₹${booking.estimated_fare.toLocaleString()}
Advance Paid: ₹${booking.advance_amount_paid.toLocaleString()}
${booking.discount_amount ? `Discount: ₹${booking.discount_amount.toLocaleString()}` : ''}

🚘 Vehicle Details:
   Registration Number: ${booking.vehicle_number || 'To be assigned'}
   Driver Name: ${booking.driver_name || 'To be assigned'}
   Driver Phone: ${booking.driver_mobile || 'To be assigned'}

We strive to provide you with the best possible service and a smooth, hassle-free journey. Thank you for choosing ZingCab!

Visit us at: zingcab.in`;

    return message;
  }, [booking]);

  const copyToClipboard = useCallback(async () => {
    const message = generateBookingMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('Booking details copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  }, [generateBookingMessage]);

  const generateInvoiceHTML = useCallback(() => {
    if (!booking) return '';

    const formatDate = (dateStr: string) => {
      try {
        return format(new Date(dateStr), 'dd MMMM yyyy');
      } catch (e) {
        return 'Invalid Date';
      }
    };

    const formatCurrency = (amount: number | null | undefined) => {
      const num = amount || 0;
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const tripDescription = `${booking.pick_up_location || 'N/A'} to ${booking.drop_location || 'N/A'}`;
    const tripType = booking.service_type ? booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
    const totalAmount = booking.estimated_fare || 0;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 40px 50px; background: white; color: #333; font-size: 14px;">
        
        <!-- Header -->
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <img src="${logo}" alt="ZingCab Logo" style="width: 60px; height: auto; margin-bottom: 10px;">
              <h1 style="font-size: 24px; margin: 0; font-weight: bold;">ZingCab</h1>
              <p style="font-size: 13px; margin: 5px 0 0 0; line-height: 1.5; color: #555;">
                59/60 Bagmari Road BRS-3 Kolkata - 700054<br>
                Phone: 7003848501, 7003371343<br>
                Email: support@zingcab.in<br>
                Website: www.zingcab.in
              </p>
            </td>
            <td style="width: 50%; text-align: right; vertical-align: top;">
              <h2 style="font-size: 36px; color: #6d28d9; margin: 0; font-weight: bold; letter-spacing: 1px;">INVOICE</h2>
              <table style="width: 100%; text-align: right; margin-top: 10px; font-size: 13px; color: #555;">
                <tr><td style="padding: 2px 0; text-align: left; padding-right: 10px;">Invoice Number:</td><td style="padding: 2px 0; font-weight: bold; color: #000;">${booking.booking_id}</td></tr>
                <tr><td style="padding: 2px 0; text-align: left; padding-right: 10px;">Booking Date:</td><td style="padding: 2px 0; font-weight: bold; color: #000;">${formatDate(booking.created_at)}</td></tr>
                <tr><td style="padding: 2px 0; text-align: left; padding-right: 10px;">Journey Date:</td><td style="padding: 2px 0; font-weight: bold; color: #000;">${formatDate(booking.journey_date)}</td></tr>
                <tr><td style="padding: 2px 0; text-align: left; padding-right: 10px;">KM Limit:</td><td style="padding: 2px 0; font-weight: bold; color: #000;">${booking.km_limit || 'N/A'}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="border-bottom: 1px solid #eee; margin-top: 25px; margin-bottom: 25px;"></div>

        <!-- Bill To & Trip Details -->
        <table style="width: 100%; font-size: 13px; line-height: 1.6;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;">Bill To:</p>
              <p style="margin: 0; font-weight: bold; color: #000;">${booking.user_name || 'N/A'}</p>
              <p style="margin: 0; color: #555;">Phone: ${booking.mobile_number}</p>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;">Trip Details:</p>
              <p style="margin: 0; color: #555;">Car Type: <strong style="color: #000;">${booking.car_type ? booking.car_type.charAt(0).toUpperCase() + booking.car_type.slice(1) : 'N/A'}</strong></p>
              <p style="margin: 0; color: #555;">Trip Type: <strong style="color: #000;">${tripType}</strong></p>
              <p style="margin: 0; color: #555;">Driver: <strong style="color: #000;">${booking.driver_name || 'N/A'}</strong></p>
              <p style="margin: 0; color: #555;">Vehicle No: <strong style="color: #000;">${booking.vehicle_number || 'N/A'}</strong></p>
            </td>
          </tr>
        </table>

        <!-- Invoice Table -->
        <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f7f7f7; font-size: 12px; color: #666; text-align: left;">
              <th style="padding: 12px 15px; font-weight: bold; border-bottom: 1px solid #ddd;">DESCRIPTION</th>
              <th style="padding: 12px 15px; font-weight: bold; border-bottom: 1px solid #ddd;">TRIP TYPE</th>
              <th style="padding: 12px 15px; font-weight: bold; text-align: right; border-bottom: 1px solid #ddd;">RATE</th>
              <th style="padding: 12px 15px; font-weight: bold; text-align: right; border-bottom: 1px solid #ddd;">AMOUNT</th>
            </tr>
          </thead>
          <tbody style="font-size: 14px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px; vertical-align: top;">${tripDescription}</td>
              <td style="padding: 15px; vertical-align: top;">${tripType}</td>
              <td style="padding: 15px; text-align: right; vertical-align: top;">${formatCurrency(totalAmount)}</td>
              <td style="padding: 15px; text-align: right; vertical-align: top;"><strong style="color: #000;">${formatCurrency(totalAmount)}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <table style="width: 100%; margin-top: 20px;">
          <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%;">
              <table style="width: 100%; font-size: 14px; color: #333;">
                <tr>
                  <td style="padding: 8px 0; text-align: right;">Subtotal:</td>
                  <td style="text-align: right; padding: 8px 0; padding-left: 20px;">${formatCurrency(totalAmount)}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 16px;">
                  <td style="padding: 8px 0; text-align: right; border-top: 2px solid #333;">Total:</td>
                  <td style="text-align: right; padding: 8px 0; padding-left: 20px; border-top: 2px solid #333;">${formatCurrency(totalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="border-bottom: 1px solid #eee; margin-top: 30px; margin-bottom: 20px;"></div>

        <!-- Footer -->
        <table style="width: 100%; font-size: 13px; line-height: 1.5; color: #555;">
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    <p style="margin: 0; font-weight: bold; color: #333;">Notes:</p>
                    <p style="margin: 5px 0 0 0;">Thank you for choosing ZingCab for your transportation needs. We hope you had a pleasant journey.</p>
                </td>
                <td style="width: 50%; vertical-align: top;">
                    <p style="margin: 0; font-weight: bold; color: #333;">Terms & Conditions:</p>
                    <p style="margin: 5px 0 0 0;">For any invoice-related queries, contact ZingCab Support within 48 hours of trip completion.</p>
                </td>
            </tr>
        </table>
        
      </div>
    `;
  }, [booking]);

  const downloadInvoice = useCallback(async () => {
    if (!booking) return;

    try {
      toast.loading('Generating invoice...');
      
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateInvoiceHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`ZingCab_Invoice_${booking.booking_id}.pdf`);
      toast.dismiss();
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast.dismiss();
      toast.error('Failed to generate invoice');
    }
  }, [booking, generateInvoiceHTML]);

  const EditableField = useMemo(() => ({ 
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
      <div key={`${field}-${isEditing}`} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center min-w-0 flex-1">
          <Icon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-600">{label}</div>
            {isEditing ? (
              <div className="mt-1">
                {options ? (
                  <select
                    value={editValues[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    autoFocus
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
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    autoFocus
                  />
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-900 mt-1">
                {type === 'select' && options ? 
                  options.find((opt: any) => opt.value === value)?.label || value :
                  type === 'number' ? (value ? `₹${Number(value).toLocaleString()}` : 'Not set') :
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
  }, [editingField, editValues, handleEdit, handleSave, handleCancel, handleInputChange]);

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

  const refundStatusOptions = [
    { value: 'initiated', label: 'Initiated' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
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
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Download Invoice Button */}
          <button
            onClick={downloadInvoice}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            title="Download invoice PDF"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </button>
          
          {/* Copy Booking Message Button */}
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            title="Copy booking message to clipboard"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Message
              </>
            )}
          </button>
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

              <EditableField
                field="cancellation_reason"
                label="Cancellation Reason"
                value={booking.cancellation_reason}
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

              <EditableField
                field="discount_amount"
                label="Discount Amount"
                value={booking.discount_amount}
                type="number"
                icon={DollarSign}
              />
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

              <EditableField
                field="payment_date"
                label="Payment Date"
                value={booking.payment_date}
                type="date"
                icon={Calendar}
              />
            </div>
          </div>

          {/* Refund Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Refund</h2>
            </div>
            <div className="px-6 py-4 space-y-1">
              <EditableField
                field="refund_status"
                label="Refund Status"
                value={booking.refund_status}
                type="select"
                options={refundStatusOptions}
                icon={DollarSign}
              />

              <EditableField
                field="refund_amount"
                label="Refund Amount"
                value={booking.refund_amount}
                type="number"
                icon={DollarSign}
              />
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
            </div>
          </div>
        </div>
      </div>

      {/* Booking Message Preview */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Booking Confirmation Message</h2>
          <p className="text-sm text-gray-600 mt-1">Click "Copy Message" above to copy this message for sharing with customers</p>
        </div>
        <div className="px-6 py-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {generateBookingMessage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;