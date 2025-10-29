
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { api } from '@/lib/apiClient';
import StyledText from '@/components/styledText';

const SubscriptionBillingPolicy = () => {

  const [data, setData] = useState('');

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await api.admin.getPolicies();
        const payload = response?.data?.data ?? response?.data ?? [];
        const policies = Array.isArray(payload) ? payload : [];
        if (policies.length > 0) {
          setData(policies[0].billing ?? '');
        }
      } catch (error) {
        console.error('Failed to load policies', error);
      }
    }
    fetchPolicies();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="space-y-12">
          <div className="text-center mb-12">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold">Subscription Billing Policy</h1>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <StyledText text={data} />
          </div>

          <div className="text-center mt-16">
            <Button asChild>
              <Link to="/contact">Contact Our Legal Team</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBillingPolicy;
