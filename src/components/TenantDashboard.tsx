import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceRequest } from '@/types';
import { getRequests, addRequest, saveImageToLocal, getImageData } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import TenantReviewModal from './TenantReviewModal';
import { Plus, Upload, X, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const TenantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>(() => 
    getRequests().filter(r => r.tenantId === user?.id)
  );
  const [reviewingRequest, setReviewingRequest] = useState<MaintenanceRequest | null>(null);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Some files were skipped. Only JPG, PNG, and HEIC files under 10MB are allowed.",
        variant: "destructive"
      });
    }
    
    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.title || !newRequest.description || !newRequest.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Upload images
      const imageIds: string[] = [];
      for (const file of selectedImages) {
        const imageId = await saveImageToLocal(file);
        imageIds.push(imageId);
      }

      // Create request
      const request = addRequest({
        tenantId: user!.id,
        tenantName: user!.name,
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        priority: newRequest.priority,
        status: 'pending',
        images: imageIds
      });

      // Update local state
      setRequests(prev => [request, ...prev]);
      
      // Reset form
      setNewRequest({ title: '', description: '', category: '', priority: 'medium' });
      setSelectedImages([]);
      setShowNewRequestForm(false);

      toast({
        title: "Request submitted",
        description: "Your maintenance request has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <AlertCircle className="h-4 w-4" />;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenant Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Button onClick={() => setShowNewRequestForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {showNewRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Maintenance Request</CardTitle>
            <CardDescription>Describe the issue and upload photos if needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={newRequest.category} onValueChange={(value) => setNewRequest(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Appliances">Appliances</SelectItem>
                    <SelectItem value="Doors/Windows">Doors/Windows</SelectItem>
                    <SelectItem value="Flooring">Flooring</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={newRequest.priority} onValueChange={(value: any) => setNewRequest(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the issue..."
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Photos (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/heic"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <span className="text-xs text-gray-400">JPG, PNG, HEIC up to 10MB each</span>
                </label>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitRequest} disabled={uploading}>
                {uploading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewRequestForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Maintenance Requests</h2>
        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No maintenance requests yet.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
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
                      {request.category} • Submitted {new Date(request.createdAt).toLocaleDateString()}
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
                    <h4 className="font-medium mb-2">Submitted Photos:</h4>
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

                {request.completionReport && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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

                {request.status === 'completed' && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => setReviewingRequest(request)}
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review Completed Work
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {reviewingRequest && (
        <TenantReviewModal
          request={reviewingRequest}
          onClose={() => setReviewingRequest(null)}
          onUpdate={(updatedRequest) => {
            setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
            setReviewingRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default TenantDashboard;