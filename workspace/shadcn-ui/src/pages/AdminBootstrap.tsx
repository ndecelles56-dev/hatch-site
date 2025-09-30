import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { bootstrapAdmin, checkAdminExists, AdminBootstrapResult } from '@/utils/adminBootstrap';
import { createEmergencyAdmin, EmergencyAdminResult } from '@/utils/emergencyAdminSetup';

const AdminBootstrap: React.FC = () => {
  const [email, setEmail] = useState('admin@realestate.com');
  const [password, setPassword] = useState('admin123!');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AdminBootstrapResult | EmergencyAdminResult | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const checkExistingAdmin = async () => {
    try {
      const { exists } = await checkAdminExists();
      setAdminExists(exists);
    } catch (error) {
      console.error('Error checking admin:', error);
      setAdminExists(false);
    }
  };

  React.useEffect(() => {
    checkExistingAdmin();
  }, []);

  const handleBootstrap = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const bootstrapResult = await bootstrapAdmin(email, password);
      setResult(bootstrapResult);
    } catch (error) {
      console.error('Bootstrap error:', error);
      setResult({
        success: false,
        message: `Bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencySetup = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const emergencyResult = await createEmergencyAdmin();
      setResult(emergencyResult);
    } catch (error) {
      console.error('Emergency setup error:', error);
      setResult({
        success: false,
        message: `Emergency setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    return result.success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getResultVariant = () => {
    if (!result) return 'default';
    return result.success ? 'default' : 'destructive';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Bootstrap</h1>
          <p className="text-gray-600 mt-2">Set up your administrator account</p>
        </div>

        {adminExists === true && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              An admin account already exists. You may still proceed to create additional admin accounts.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create Admin Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleBootstrap}
                disabled={isLoading || !email || !password}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </Button>

              <Button
                onClick={handleEmergencySetup}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Emergency Setup...
                  </>
                ) : (
                  'Emergency Admin Setup'
                )}
              </Button>
            </div>

            {result && (
              <Alert variant={getResultVariant()}>
                <div className="flex items-center gap-2">
                  {getResultIcon()}
                  <AlertDescription>{result.message}</AlertDescription>
                </div>
              </Alert>
            )}

            <div className="text-sm text-gray-500 space-y-1">
              <p>• Use "Create Admin Account" for full setup with sample data</p>
              <p>• Use "Emergency Admin Setup" if database setup is incomplete</p>
              <p>• Default credentials: admin@realestate.com / admin123!</p>
            </div>
          </CardContent>
        </Card>

        {result?.success && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold text-green-700">Setup Complete!</h3>
                <p className="text-sm text-gray-600">
                  You can now navigate to the admin dashboard
                </p>
                <Button
                  onClick={() => window.location.href = '/admin'}
                  className="mt-4"
                >
                  Go to Admin Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBootstrap;