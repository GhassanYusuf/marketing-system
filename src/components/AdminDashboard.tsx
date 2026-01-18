import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import { useToast } from '@/hooks/use-toast';
import { MaintenanceRequest, Property } from '@/types';
import { getRequests, updateRequest, getUsers, getImageData, getProperties } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, CheckCircle, XCircle, Eye, UserCheck, Users, DollarSign, Wrench, Zap, Droplets, Building, Wifi } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>(() => getRequests());
  const [properties, setProperties] = useState<Property[]>(() => getProperties());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const propertyManagers = getUsers().filter(u => u.role === 'property_manager');

  // Get default currency from settings
  const getDefaultCurrency = () => {
    const defaultCurrencies = [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
      { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
    ];
    const selectedCode = localStorage.getItem('selectedCurrency') || 'USD';
    return defaultCurrencies.find(c => c.code === selectedCode) || defaultCurrencies[0];
  };

  const selectedCurrencyData = getDefaultCurrency();

  const handleAssignRequest = (requestId: string, managerId: string) => {
    const updatedRequest = updateRequest(requestId, {
      status: 'assigned',
      assignedTo: managerId,
      assignedBy: user!.id,
      assignedAt: new Date().toISOString()
    });

    if (updatedRequest) {
      setRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
      toast({
        title: "Request assigned",
        description: "The maintenance request has been assigned successfully.",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <UserCheck className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (selectedFilter === 'all') return true;
    return request.status === selectedFilter;
  });

  const getManagerName = (managerId: string) => {
    const manager = propertyManagers.find(m => m.id === managerId);
    return manager?.name || 'Unknown';
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    approved: requests.filter(r => r.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const occupancyRate = (property.rentedFlats / property.totalFlats) * 100;
            const revenueLoss = ((property.nonRentedFlats || 0) * (property.monthlyRent || 0)) || 0;
            const monthlyRevenue = ((property.rentedFlats || 0) * (property.monthlyRent || 0)) || 0;

            return (
              <Card key={property.id} className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video relative">
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <CardDescription>
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{property.description}</p>

                  {/* Occupancy Statistics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Occupancy</span>
                      <span className="text-sm text-gray-600">{property.rentedFlats}/{property.totalFlats} flats</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${occupancyRate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{occupancyRate.toFixed(1)}% occupied</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Revenue Loss */}
                    <div className="flex items-center justify-between p-2 bg-red-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-red-700" />
                        <span className="text-sm font-medium">Revenue Loss</span>
                      </div>
                      <span className="text-sm font-bold text-red-700">{selectedCurrencyData.symbol}{revenueLoss.toLocaleString()}</span>
                    </div>

                    {/* Monthly Revenue */}
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Revenue</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{selectedCurrencyData.symbol}{monthlyRevenue.toLocaleString()}</span>
                    </div>

                    {/* Maintenance */}
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Maintenance</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{selectedCurrencyData.symbol}{property.maintenanceCost.toLocaleString()}</span>
                    </div>

                    {/* EWA */}
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">EWA</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{selectedCurrencyData.symbol}{(property.ewaCost || 0).toLocaleString()}</span>
                    </div>

                    {/* Municipality */}
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Municipality</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{selectedCurrencyData.symbol}{(property.municipalityCost || 0).toLocaleString()}</span>
                    </div>

                    {/* Internet */}
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Internet</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{selectedCurrencyData.symbol}{(property.internetCost || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {property.propertyManagerId && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Managed by: {getManagerName(property.propertyManagerId)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Maintenance Requests</h2>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No requests found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {request.title}
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {request.category} • By {request.tenantName} • {new Date(request.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{request.description}</p>
                
                {request.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Tenant Photos:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {request.images.map((imageId, index) => {
                        const imageData = getImageData(imageId);
                        return imageData ? (
                          <img
                            key={index}
                            src={imageData}
                            alt={`Request image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex items-center gap-4 mt-4">
                    <Select onValueChange={(managerId) => handleAssignRequest(request.id, managerId)}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Assign to Property Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {manager.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {request.assignedTo && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Assigned to:</strong> {getManagerName(request.assignedTo)}
                      {request.assignedAt && (
                        <span className="text-gray-600 ml-2">
                          on {new Date(request.assignedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {request.completionReport && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">Completion Report:</h4>
                    <p className="text-sm text-gray-700">{request.completionReport}</p>
                    
                    {request.completionImages && request.completionImages.length > 0 && (
                      <div className="mt-2">
                        <h5 className="font-medium mb-1">Completion Photos:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {request.completionImages.map((imageId, index) => {
                            const imageData = getImageData(imageId);
                            return imageData ? (
                              <img
                                key={index}
                                src={imageData}
                                alt={`Completion image ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {request.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-red-800">Rejection Reason:</h4>
                    <p className="text-sm text-red-700">{request.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;