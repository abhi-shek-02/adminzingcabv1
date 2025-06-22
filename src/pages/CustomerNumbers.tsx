import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Send } from 'lucide-react';
import { apiService } from '../services/api';
import { CustomerNumber } from '../types/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CustomerNumbers = () => {
  const [customerNumbers, setCustomerNumbers] = useState<CustomerNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_name: '',
    contact_number: '',
    platform: '',
    comment: ''
  });

  const fetchCustomerNumbers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomerNumbers();
      if (response.success) {
        setCustomerNumbers(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch customer numbers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerNumbers();
  }, [fetchCustomerNumbers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.customer_name || !newCustomer.contact_number) {
      toast.error('Customer name and contact number are required.');
      return;
    }
    try {
      const response = await apiService.createCustomerNumber(newCustomer);
      if (response.success) {
        toast.success('Customer number added successfully');
        setShowForm(false);
        setNewCustomer({ customer_name: '', contact_number: '', platform: '', comment: '' });
        fetchCustomerNumbers();
      }
    } catch (error) {
      toast.error('Failed to add customer number');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Numbers</h1>
          <p className="text-gray-600">Manage customer contact information</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          {showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                name="customer_name"
                value={newCustomer.customer_name}
                onChange={handleInputChange}
                placeholder="Customer Name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="contact_number"
                value={newCustomer.contact_number}
                onChange={handleInputChange}
                placeholder="Contact Number"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="platform"
                value={newCustomer.platform}
                onChange={handleInputChange}
                placeholder="Platform (e.g., WhatsApp, Call)"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:col-span-2"
              />
            </div>
            <textarea
              name="comment"
              value={newCustomer.comment}
              onChange={handleInputChange}
              placeholder="Comment"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            ></textarea>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Send className="h-4 w-4 mr-2" />
              Save Customer
            </button>
          </form>
        </div>
      )}

      {/* Customer Numbers List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading customer numbers...</p>
          </div>
        ) : customerNumbers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerNumbers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.contact_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.platform || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.comment || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(item.created_at), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customer numbers</h3>
            <p className="text-gray-500">Get started by adding your first customer number.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerNumbers; 