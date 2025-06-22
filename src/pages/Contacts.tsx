import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';
import { Contact } from '../types/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm]);

  const fetchContacts = async () => {
    try {
      const response = await apiService.getContacts();
      setContacts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  const handleReply = (contact: Contact) => {
    const subject = `Re: ${contact.subject}`;
    const body = `Dear ${contact.name},\n\nThank you for contacting us. We have received your inquiry regarding "${contact.subject}".\n\nWe will get back to you shortly.\n\nBest regards,\nZingCab Team`;
    
    const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    toast.success(`Opening email client for ${contact.name}`);
  };

  const handleCall = (contact: Contact) => {
    const phoneNumber = contact.phone.replace(/\s+/g, '');
    const telLink = `tel:${phoneNumber}`;
    window.open(telLink, '_blank');
    
    toast.success(`Initiating call to ${contact.name}`);
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold">Contact Inquiries</h1>
        <p className="text-purple-100 mt-2">Manage customer messages and inquiries</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>{filteredContacts.length} of {contacts.length} contacts</span>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        {filteredContacts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(contact.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-1" />
                        {contact.phone}
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{contact.subject}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{contact.message}</p>
                    </div>

                    <div className="mt-4 flex items-center space-x-4">
                      <button 
                        onClick={() => handleReply(contact)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Reply
                      </button>
                      <button 
                        onClick={() => handleCall(contact)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors cursor-pointer"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No contact inquiries yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Inquiries</dt>
                <dd className="text-2xl font-bold text-gray-900">{contacts.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {contacts.filter(c => {
                    const contactDate = new Date(c.created_at);
                    const now = new Date();
                    return contactDate.getMonth() === now.getMonth() && 
                           contactDate.getFullYear() === now.getFullYear();
                  }).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Unique Customers</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {new Set(contacts.map(c => c.email)).size}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;