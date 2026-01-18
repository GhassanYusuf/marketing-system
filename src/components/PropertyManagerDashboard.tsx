import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceRequest } from '@/types';
import { getRequests, updateRequest, saveImageToLocal, getImageData } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, AlertCircle, CheckCircle, XCircle, Upload, X, Camera } from 'lucide-react';

const PropertyManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>(() => 
    getRequests().filter(r => r.assignedTo === user?.id)
  );
  const [completingRequest, setCompletingRequest] = useState<string | null>(null);
  const [completionReport, setCompletionReport] = useState('');
  const [completionImages, setCompletionImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleStartWork = (requestId: string) => {
    const updatedRequest = updateRequest(requestId, {
      status: 'in_progress'
    });

    if (updatedRequest) {
      setRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
      toast({
        title: "Work started",
        description: "The maintenance work has been marked as in progress.",
      });
    }
  };

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
    
    setCompletionImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setCompletionImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteWork = async (requestId: string) => {
    if (!completionReport.trim()) {
      toast({
        title: "Missing report",
        description: "Please provide a completion report.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Upload completion images
      const imageIds: string[] = [];
      for (const file of completionImages) {
        const imageId = await saveImageToLocal(file);
        imageIds.push(imageId);
      }

      const updatedRequest = updateRequest(requestId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        completionReport: completionReport,
        completionImages: imageIds
      });

      if (updatedRequest) {
        setRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
        setCompletingRequest(null);
        setCompletionReport('');
        setCompletionImages([]);
        
        toast({
          title: "Work completed",
          description: "The maintenance work has been marked as completed and is ready for tenant review.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete work. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const stats = {
    assigned: requests.filter(r => r.status === 'assigned').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    approved: requests.filter(r => r.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Property Manager Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Assigned Tasks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Assigned Tasks</h2>
        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No tasks assigned to you yet.</p>
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
                      {request.category} • By {request.tenantName} • Assigned {request.assignedAt ? new Date(request.assignedAt).toLocaleDateString() : 'Recently'}
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

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {request.status === 'assigned' && (
                    <Button onClick={() => handleStartWork(request.id)}>
                      Start Work
                    </Button>
                  )}
                  
                  {request.status === 'in_progress' && (
                    <Button onClick={() => setCompletingRequest(request.id)}>
                      <Camera className="mr-2 h-4 w-4" />
                      Complete Work
                    </Button>
                  )}
                </div>

                {/* Completion Form */}
                {completingRequest === request.id && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-4">Complete Work Report</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="completion-report">Completion Report *</Label>
                        <Textarea
                          id="completion-report"
                          placeholder="Describe what was fixed and any additional notes..."
                          value={completionReport}
                          onChange={(e) => setCompletionReport(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Before/After Photos</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/heic"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="completion-image-upload"
                          />
                          <label htmlFor="completion-image-upload" className="cursor-pointer flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Click to upload completion photos</span>
                            <span className="text-xs text-gray-400">JPG, PNG, HEIC up to 10MB each</span>
                          </label>
                        </div>
                        
                        {completionImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {completionImages.map((file, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Completion ${index + 1}`}
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
                        <Button 
                          onClick={() => handleCompleteWork(request.id)} 
                          disabled={uploading || !completionReport.trim()}
                        >
                          {uploading ? 'Submitting...' : 'Submit Completion'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setCompletingRequest(null);
                            setCompletionReport('');
                            setCompletionImages([]);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completion Report Display */}
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
                    <h4 className="font-medium mb-2 text-red-800">Tenant Rejection Reason:</h4>
                    <p className="text-sm text-red-700">{request.rejectionReason}</p>
                    <p className="text-xs text-red-600 mt-1">Please address these issues and resubmit.</p>
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

export default PropertyManagerDashboard;