import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceRequest } from '@/types';
import { getRequests, updateRequest, getImageData } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const TenantReviewModal: React.FC<{
  request: MaintenanceRequest;
  onClose: () => void;
  onUpdate: (updatedRequest: MaintenanceRequest) => void;
}> = ({ request, onClose, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const updatedRequest = updateRequest(request.id, {
        status: 'approved',
        reviewedAt: new Date().toISOString()
      });

      if (updatedRequest) {
        onUpdate(updatedRequest);
        toast({
          title: "Work approved",
          description: "The maintenance work has been approved successfully.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve work. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Missing reason",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const updatedRequest = updateRequest(request.id, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        reviewedAt: new Date().toISOString()
      });

      if (updatedRequest) {
        onUpdate(updatedRequest);
        toast({
          title: "Work rejected",
          description: "The maintenance work has been rejected with feedback.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject work. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review Completed Work
          </CardTitle>
          <CardDescription>
            {request.title} - {request.category}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Request */}
          <div>
            <h4 className="font-medium mb-2">Original Request:</h4>
            <p className="text-sm text-gray-700 mb-2">{request.description}</p>
            
            {request.images.length > 0 && (
              <div>
                <h5 className="font-medium mb-1 text-sm">Your Photos:</h5>
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
          </div>

          {/* Completion Report */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">Completion Report:</h4>
            <p className="text-sm text-gray-700 mb-3">{request.completionReport}</p>
            
            {request.completionImages && request.completionImages.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Completion Photos:</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {request.completionImages.map((imageId, index) => {
                    const imageData = getImageData(imageId);
                    return imageData ? (
                      <img
                        key={index}
                        src={imageData}
                        alt={`Completion image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Review Actions */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={handleApprove} 
                disabled={submitting}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Work
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={submitting || !rejectionReason.trim()}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Work
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason (required if rejecting)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain what needs to be fixed or redone..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantReviewModal;