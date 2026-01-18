export type UserRole = 'tenant' | 'admin' | 'property_manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  images: string[];
  createdAt: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string;
  completedAt?: string;
  completionReport?: string;
  completionImages?: string[];
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface Assignment {
  id: string;
  requestId: string;
  adminId: string;
  propertyManagerId: string;
  assignedAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  requestId: string;
  tenantId: string;
  status: 'approved' | 'rejected';
  feedback?: string;
  reviewedAt: string;
}