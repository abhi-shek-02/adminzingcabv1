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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Customer Numbers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          {showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="customer_name"
                value={newCustomer.customer_name}
                onChange={handleInputChange}
                placeholder="Customer Name"
                className="p-2 border rounded-md"
                required
              />
              <input
                type="text"
                name="contact_number"
                value={newCustomer.contact_number}
                onChange={handleInputChange}
                placeholder="Contact Number"
                className="p-2 border rounded-md"
                required
              />
              <input
                type="text"
                name="platform"
                value={newCustomer.platform}
                onChange={handleInputChange}
                placeholder="Platform (e.g., WhatsApp, Call)"
                className="p-2 border rounded-md"
              />
            </div>
            <textarea
              name="comment"
              value={newCustomer.comment}
              onChange={handleInputChange}
              placeholder="Comment"
              className="w-full p-2 border rounded-md"
              rows={3}
            ></textarea>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Save Customer
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
            ) : (
              customerNumbers.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.contact_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.platform}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.comment}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(item.created_at), 'dd MMM yyyy')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerNumbers; 