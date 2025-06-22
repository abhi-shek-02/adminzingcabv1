import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, User, Calendar, Search } from 'lucide-react';
import { apiService } from '../services/api';
import { Contact } from '../types/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-gray-600">Manage customer inquiries and feedback</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-lg shadow-sm border cursor-pointer transition-all ${
                selectedContact?.id === contact.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(contact.created_at), 'MMM d, yyyy')}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-1">{contact.subject}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{contact.message}</p>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-1" />
                  {contact.phone}
                </div>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'No contact submissions yet'}
              </p>
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-600">Contact Details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </div>
                    <p className="text-sm text-gray-900 break-all">{selectedContact.email}</p>
                  </div>

                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </div>
                    <p className="text-sm text-gray-900">{selectedContact.phone}</p>
                  </div>

                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Submitted
                    </div>
                    <p className="text-sm text-gray-900">
                      {format(new Date(selectedContact.created_at), 'EEEE, MMMM d, yyyy HH:mm')}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Subject</div>
                    <p className="text-sm text-gray-900 font-medium">{selectedContact.subject}</p>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Message</div>
                    <div className="text-sm text-gray-900 bg-gray-50 rounded-md p-3 whitespace-pre-wrap">
                      {selectedContact.message}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                  
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">Select a Contact</h3>
              <p className="text-sm text-gray-500 mt-1">
                Click on a contact to view details and take actions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;