import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  Car,
  Clock,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { Booking, Contact } from '../types/api';
import { format, isToday, isThisMonth } from 'date-fns';

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, contactsRes] = await Promise.all([
          apiService.getBookings(),
          apiService.getContacts()
        ]);
        
        setBookings(bookingsRes.data || []);
        setContacts(contactsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = React.useMemo(() => {
    const totalBookings = bookings.length;
    const todayBookings = bookings.filter(b => isToday(new Date(b.journey_date))).length;
    const thisMonthRevenue = bookings
      .filter(b => isThisMonth(new Date(b.created_at)))
      .reduce((sum, b) => sum + b.estimated_fare, 0);
    const pendingBookings = bookings.filter(b => b.ride_status === 'pending').length;
    const completedBookings = bookings.filter(b => b.ride_status === 'completed').length;
    const totalContacts = contacts.length;

    return {
      totalBookings,
      todayBookings,
      thisMonthRevenue,
      pendingBookings,
      completedBookings,
      totalContacts
    };
  }, [bookings, contacts]);

  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4" />
                    {Math.abs(trend)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

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
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to ZingCab Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Today's Trips"
          value={stats.todayBookings}
          icon={Car}
          color="green"
        />
        <StatCard
          title="This Month Revenue"
          value={`₹${stats.thisMonthRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Contact Inquiries"
          value={stats.totalContacts}
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Completed Trips"
          value={stats.completedBookings}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Active Bookings"
          value={bookings.filter(b => ['confirmed', 'in_progress'].includes(b.ride_status)).length}
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-hidden">
          {recentBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fare
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {booking.booking_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.user_name}</div>
                      <div className="text-sm text-gray-500">{booking.mobile_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.pick_up_location} → {booking.drop_location || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(booking.journey_date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.ride_status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.ride_status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.ride_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        booking.ride_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.ride_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{booking.estimated_fare.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No bookings found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;