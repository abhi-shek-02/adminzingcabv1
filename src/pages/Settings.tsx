import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Car, 
  DollarSign, 
  MapPin, 
  Clock,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('fare');
  const [loading, setLoading] = useState(false);

  // Mock settings data (in real app, this would come from API)
  const [fareRates, setFareRates] = useState({
    hatchback: { base: 12, per_km: 8, toll: 150, tax: 100, allowance: 200 },
    sedan: { base: 15, per_km: 10, toll: 200, tax: 150, allowance: 250 },
    suv: { base: 20, per_km: 12, toll: 250, tax: 200, allowance: 300 },
    crysta: { base: 25, per_km: 15, toll: 300, tax: 250, allowance: 350 },
    scorpio: { base: 28, per_km: 18, toll: 350, tax: 300, allowance: 400 },
  });

  const [locations, setLocations] = useState([
    'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Solapur'
  ]);

  const [rentalTypes, setRentalTypes] = useState([
    { id: '4hr', name: '4 Hours', rate: 1000 },
    { id: '8hr', name: '8 Hours', rate: 1800 },
    { id: '12hr', name: '12 Hours', rate: 2500 },
    { id: '1day', name: '1 Day', rate: 3000 },
    { id: '2day', name: '2 Days', rate: 5500 },
    { id: '3day', name: '3 Days', rate: 8000 },
  ]);

  const [newLocation, setNewLocation] = useState('');
  const [newRentalType, setNewRentalType] = useState({ name: '', rate: 0 });

  const handleSaveFareRates = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Fare rates updated successfully');
    } catch (error) {
      toast.error('Failed to update fare rates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
      toast.success('Location added successfully');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter(loc => loc !== location));
    toast.success('Location removed successfully');
  };

  const handleAddRentalType = () => {
    if (newRentalType.name.trim() && newRentalType.rate > 0) {
      const id = newRentalType.name.toLowerCase().replace(/\s+/g, '');
      setRentalTypes([...rentalTypes, { ...newRentalType, id }]);
      setNewRentalType({ name: '', rate: 0 });
      toast.success('Rental type added successfully');
    }
  };

  const handleRemoveRentalType = (id: string) => {
    setRentalTypes(rentalTypes.filter(type => type.id !== id));
    toast.success('Rental type removed successfully');
  };

  const tabs = [
    { id: 'fare', name: 'Fare Rates', icon: DollarSign },
    { id: 'cars', name: 'Car Types', icon: Car },
    { id: 'locations', name: 'Locations', icon: MapPin },
    { id: 'rental', name: 'Rental Types', icon: Clock },
  ];

  const renderFareRates = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fare Rate Configuration</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure base rates, per kilometer charges, and additional fees for each car type.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(fareRates).map(([carType, rates]) => (
          <div key={carType} className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 capitalize">{carType}</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Rate (₹)</label>
                <input
                  type="number"
                  value={rates.base}
                  onChange={(e) => setFareRates({
                    ...fareRates,
                    [carType]: { ...rates, base: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Per KM (₹)</label>
                <input
                  type="number"
                  value={rates.per_km}
                  onChange={(e) => setFareRates({
                    ...fareRates,
                    [carType]: { ...rates, per_km: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Toll Charges (₹)</label>
                <input
                  type="number"
                  value={rates.toll}
                  onChange={(e) => setFareRates({
                    ...fareRates,
                    [carType]: { ...rates, toll: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State Tax (₹)</label>
                <input
                  type="number"
                  value={rates.tax}
                  onChange={(e) => setFareRates({
                    ...fareRates,
                    [carType]: { ...rates, tax: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver Allowance (₹)</label>
                <input
                  type="number"
                  value={rates.allowance}
                  onChange={(e) => setFareRates({
                    ...fareRates,
                    [carType]: { ...rates, allowance: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveFareRates}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderCarTypes = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Car Type Management</h3>
        <p className="text-sm text-gray-600 mb-6">
          Manage available car types and their configurations.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Per KM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(fareRates).map(([carType, rates]) => (
                <tr key={carType}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900 capitalize">{carType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{rates.base}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{rates.per_km}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location Management</h3>
        <p className="text-sm text-gray-600 mb-6">
          Manage pickup and drop-off locations available for booking.
        </p>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter new location"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
          />
        </div>
        <button
          onClick={handleAddLocation}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">{location}</span>
            </div>
            <button
              onClick={() => handleRemoveLocation(location)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRentalTypes = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Type Management</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure available rental durations and their rates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <input
          type="text"
          value={newRentalType.name}
          onChange={(e) => setNewRentalType({ ...newRentalType, name: e.target.value })}
          placeholder="Rental type name"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <input
          type="number"
          value={newRentalType.rate}
          onChange={(e) => setNewRentalType({ ...newRentalType, rate: parseFloat(e.target.value) || 0 })}
          placeholder="Rate (₹)"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          onClick={handleAddRentalType}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rental Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentalTypes.map((type) => (
                <tr key={type.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{type.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{type.rate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRemoveRentalType(type.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        {activeTab === 'fare' && renderFareRates()}
        {activeTab === 'cars' && renderCarTypes()}
        {activeTab === 'locations' && renderLocations()}
        {activeTab === 'rental' && renderRentalTypes()}
      </div>
    </div>
  );
};

export default Settings;