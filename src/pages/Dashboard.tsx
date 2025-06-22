import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  IndianRupee, 
  MessageSquare, 
  TrendingUp, 
  Car,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { apiService } from '../services/api';
import { Booking, Contact } from '../types/api';
import { format, isToday, isThisMonth } from 'date-fns';
import { Link } from 'react-router-dom';

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

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue", gradient = "from-blue-500 to-blue-600" }: any) => (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold">Welcome to ZingCab Admin</h1>
        <p className="text-blue-100 mt-2">Manage your cab booking operations efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Today's Trips"
          value={stats.todayBookings}
          icon={Car}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="This Month Revenue"
          value={`₹${stats.thisMonthRevenue.toLocaleString()}`}
          icon={IndianRupee}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Contact Inquiries"
          value={stats.totalContacts}
          icon={MessageSquare}
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={Clock}
          gradient="from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Completed Trips"
          value={stats.completedBookings}
          icon={CheckCircle}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Active Bookings"
          value={bookings.filter(b => ['confirmed', 'in_progress'].includes(b.ride_status)).length}
          icon={Users}
          gradient="from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <Link
              to="/bookings"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="overflow-hidden">
          {recentBookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.booking_id}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.ride_status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.ride_status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.ride_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.ride_status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.ride_status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            {booking.user_name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {booking.mobile_number}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.pick_up_location} → {booking.drop_location || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(booking.journey_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{booking.estimated_fare.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.car_type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Car className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No bookings found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/bookings/new"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Create Booking</h3>
              <p className="text-blue-100">Add a new cab booking</p>
            </div>
          </div>
        </Link>

        <Link
          to="/bookings"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Manage Bookings</h3>
              <p className="text-green-100">View and update bookings</p>
            </div>
          </div>
        </Link>

        <Link
          to="/contacts"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Contact Inquiries</h3>
              <p className="text-purple-100">View customer messages</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;