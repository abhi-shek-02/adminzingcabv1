import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Calendar, TrendingUp, Car, IndianRupee } from 'lucide-react';
import { apiService } from '../services/api';
import { Booking } from '../types/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

const Analytics = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiService.getBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const analytics = React.useMemo(() => {
    if (!bookings.length) return null;

    const currentMonth = new Date(selectedMonth);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthlyBookings = bookings.filter(booking => 
      isWithinInterval(new Date(booking.created_at), { start: monthStart, end: monthEnd })
    );

    // Revenue by service type
    const revenueByService = bookings.reduce((acc, booking) => {
      const service = booking.service_type;
      acc[service] = (acc[service] || 0) + booking.estimated_fare;
      return acc;
    }, {} as Record<string, number>);

    const serviceData = Object.entries(revenueByService).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      count: bookings.filter(b => b.service_type === name).length
    }));

    // Bookings by status
    const statusData = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => ({
      name: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
      value: bookings.filter(b => b.ride_status === status).length
    })).filter(item => item.value > 0);

    // Car type distribution
    const carTypeData = ['hatchback', 'sedan', 'suv', 'crysta', 'scorpio'].map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: bookings.filter(b => b.car_type === type).length,
      revenue: bookings.filter(b => b.car_type === type).reduce((sum, b) => sum + b.estimated_fare, 0)
    })).filter(item => item.value > 0);

    // Daily bookings for the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dailyData = daysInMonth.map(day => {
      const dayBookings = monthlyBookings.filter(booking => 
        format(new Date(booking.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      return {
        date: format(day, 'dd'),
        bookings: dayBookings.length,
        revenue: dayBookings.reduce((sum, booking) => sum + booking.estimated_fare, 0)
      };
    });

    // Top routes
    const routeCount = bookings.reduce((acc, booking) => {
      if (booking.drop_location) {
        const route = `${booking.pick_up_location} → ${booking.drop_location}`;
        acc[route] = (acc[route] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topRoutes = Object.entries(routeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));

    // Monthly stats
    const monthlyStats = {
      totalBookings: monthlyBookings.length,
      totalRevenue: monthlyBookings.reduce((sum, b) => sum + b.estimated_fare, 0),
      completedTrips: monthlyBookings.filter(b => b.ride_status === 'completed').length,
      averageFare: monthlyBookings.length > 0 ? 
        monthlyBookings.reduce((sum, b) => sum + b.estimated_fare, 0) / monthlyBookings.length : 0
    };

    return {
      serviceData,
      statusData,
      carTypeData,
      dailyData,
      topRoutes,
      monthlyStats
    };
  }, [bookings, selectedMonth]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">No bookings found for analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Monthly Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{analytics.monthlyStats.totalBookings}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ₹{analytics.monthlyStats.totalRevenue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Trips</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{analytics.monthlyStats.completedTrips}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Fare</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ₹{Math.round(analytics.monthlyStats.averageFare).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings Trend */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Bookings & Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="bookings" />
              <YAxis yAxisId="revenue" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bookings'
                ]}
              />
              <Legend />
              <Bar yAxisId="bookings" dataKey="bookings" fill="#3B82F6" name="Bookings" />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Type Distribution */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Service Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.serviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.statusData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Car Type Performance */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Car Type Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.carTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="bookings" />
              <YAxis yAxisId="revenue" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bookings'
                ]}
              />
              <Legend />
              <Bar yAxisId="bookings" dataKey="value" fill="#3B82F6" name="Bookings" />
              <Bar yAxisId="revenue" dataKey="revenue" fill="#10B981" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Popular Routes</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topRoutes.map((route, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {route.route}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((route.count / bookings.length) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {analytics.topRoutes.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No route data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;