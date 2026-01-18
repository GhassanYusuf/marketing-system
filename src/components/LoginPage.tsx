import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types';
import { loginUser } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, Wrench } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const { setUser } = useAuth();

  const handleLogin = () => {
    if (email) {
      const user = loginUser(email, selectedRole);
      if (user) {
        setUser(user);
      }
    }
  };

  const quickLogin = (role: UserRole) => {
    const emails = {
      tenant: 'tenant@example.com',
      admin: 'admin@example.com',
      property_manager: 'manager@example.com'
    };
    
    const user = loginUser(emails[role]);
    if (user) {
      setUser(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your email and select your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="property_manager">Property Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleLogin} className="w-full" disabled={!email}>
              Sign In
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Demo Login</CardTitle>
            <CardDescription className="text-xs">Click to login as different roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => quickLogin('tenant')}
            >
              <Users className="mr-2 h-4 w-4" />
              Login as Tenant
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => quickLogin('admin')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Login as Admin
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => quickLogin('property_manager')}
            >
              <Wrench className="mr-2 h-4 w-4" />
              Login as Property Manager
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;