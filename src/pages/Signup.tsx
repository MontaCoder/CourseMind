
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { appName, facebookClientId } from '@/constants';
import Logo from '../res/logo.svg';
import api, { setAuthData } from '@/lib/api';
import type { AuthResponse } from '@/lib/api-types';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLoginImport from '@greatsumini/react-facebook-login';

interface FacebookAuthResponse {
  accessToken?: string;
}

type FacebookLoginComponent = React.ComponentType<{
  appId: string;
  style?: React.CSSProperties;
  onFail?: (error: unknown) => void;
  onSuccess?: (response: FacebookAuthResponse) => void;
}>;

const FacebookLogin = ((FacebookLoginImport as unknown as { default?: unknown }).default ?? FacebookLoginImport) as FacebookLoginComponent;

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      redirectHome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function redirectHome() {
    navigate("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!name || !email || !password) {
      setError('Please fill out all fields');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    if (password.length < 9) {
      setError('Password should be at least 9 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>('/api/signup', { email, mName: name, password, type: 'free' });
      if (response.data.success && response.data.token) {
        setAuthData({ token: response.data.token, userData: response.data.userData });
        toast({
          title: "Account created!",
          description: "Welcome to " + appName + ".",
        });
        redirectHome();
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-4">
            <img src={Logo} alt="Logo" className='h-12 md:h-14 max-w-[220px] w-auto object-contain' />
            <span className="font-display font-medium text-lg">{appName}</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Sign up to get started with {appName}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 9 characters long
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    terms of service
                  </Link>
                  {" "}and{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <GoogleLogin
              theme='outline'
              type='standard'
              width={400}
              onSuccess={async (credentialResponse) => {
                const credential = credentialResponse.credential;
                if (!credential) {
                  setError('Google login failed. Please try again.');
                  return;
                }
                try {
                  setIsLoading(true);
                  const response = await api.post<AuthResponse>('/api/social', { provider: 'google', credential });
                  if (response.data.success && response.data.token) {
                    setAuthData({ token: response.data.token, userData: response.data.userData });
                    toast({
                      title: "Account created!",
                      description: "Welcome to " + appName,
                    });
                    redirectHome();
                  } else {
                    setError(response.data.message ?? 'Unable to sign in with Google.');
                  }
                } catch (error) {
                  console.error(error);
                  setError('Internal Server Error');
                } finally {
                  setIsLoading(false);
                }

              }}
              onError={() => {
                setIsLoading(false);
                setError('Internal Server Error');
              }}
            />

            <FacebookLogin
              appId={facebookClientId}
              style={{
                backgroundColor: '#4267b2',
                color: '#fff',
                fontSize: '15px',
                padding: '8px 24px',
                width: '100%',
                border: 'none',
                marginTop: '16px',
                borderRadius: '0px',
              }}
              onFail={(error) => {
                console.error(error);
                setIsLoading(false);
                setError('Internal Server Error');
              }}
              onSuccess={async (response: FacebookAuthResponse) => {
                if (!response.accessToken) {
                  setError('Facebook login failed. Please try again.');
                  return;
                }
                try {
                  setIsLoading(true);
                  const authResponse = await api.post<AuthResponse>('/api/social', { provider: 'facebook', accessToken: response.accessToken });
                  if (authResponse.data.success && authResponse.data.token) {
                    setAuthData({ token: authResponse.data.token, userData: authResponse.data.userData });
                    toast({
                      title: "Account created!",
                      description: "Welcome to " + appName,
                    });
                    redirectHome();
                  } else {
                    setError(authResponse.data.message ?? 'Unable to sign in with Facebook.');
                  }
                } catch (error) {
                  console.error(error);
                  setError('Internal Server Error');
                } finally {
                  setIsLoading(false);
                }
              }}
            />

          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t p-6">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
