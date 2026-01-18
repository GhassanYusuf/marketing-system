import { User, MaintenanceRequest, UserRole } from '@/types';

// Mock users for demonstration
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'tenant@example.com',
    name: 'John Tenant',
    role: 'tenant',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Sarah Admin',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'manager@example.com',
    name: 'Mike Manager',
    role: 'property_manager',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock maintenance requests
export const mockRequests: MaintenanceRequest[] = [
  {
    id: '1',
    tenantId: '1',
    tenantName: 'John Tenant',
    title: 'AC Unit Leaking Water',
    description: 'The AC unit in the living room is leaking water onto the floor. It started yesterday and is getting worse.',
    category: 'HVAC',
    priority: 'high',
    status: 'pending',
    images: [],
    createdAt: '2024-12-07T10:00:00Z'
  },
  {
    id: '2',
    tenantId: '1',
    tenantName: 'John Tenant',
    title: 'Broken Kitchen Faucet',
    description: 'Kitchen faucet handle is loose and water pressure is very low.',
    category: 'Plumbing',
    priority: 'medium',
    status: 'assigned',
    images: [],
    createdAt: '2024-12-06T14:30:00Z',
    assignedTo: '3',
    assignedBy: '2',
    assignedAt: '2024-12-06T15:00:00Z'
  }
];

// Local storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'property_mgmt_current_user',
  USERS: 'property_mgmt_users',
  REQUESTS: 'property_mgmt_requests',
  UPLOADED_IMAGES: 'property_mgmt_images'
};

// Initialize local storage with mock data
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockRequests));
  }
  if (!localStorage.getItem(STORAGE_KEYS.UPLOADED_IMAGES)) {
    localStorage.setItem(STORAGE_KEYS.UPLOADED_IMAGES, JSON.stringify({}));
  }
};

// Auth helpers
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const loginUser = (email: string, role?: UserRole): User | null => {
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  let user = users.find(u => u.email === email);
  
  // If user doesn't exist and role is provided, create new user
  if (!user && role) {
    user = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  
  if (user) {
    setCurrentUser(user);
  }
  
  return user || null;
};

export const logoutUser = () => {
  setCurrentUser(null);
};

// Request helpers
export const getRequests = (): MaintenanceRequest[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
};

export const saveRequests = (requests: MaintenanceRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
};

export const addRequest = (request: Omit<MaintenanceRequest, 'id' | 'createdAt'>) => {
  const requests = getRequests();
  const newRequest: MaintenanceRequest = {
    ...request,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  requests.push(newRequest);
  saveRequests(requests);
  return newRequest;
};

export const updateRequest = (id: string, updates: Partial<MaintenanceRequest>) => {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    saveRequests(requests);
    return requests[index];
  }
  return null;
};

// Image helpers
export const saveImageToLocal = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store image data in localStorage
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADED_IMAGES) || '{}');
      images[imageId] = {
        data: imageData,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.UPLOADED_IMAGES, JSON.stringify(images));
      
      resolve(imageId);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getImageData = (imageId: string): string | null => {
  const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADED_IMAGES) || '{}');
  return images[imageId]?.data || null;
};

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};