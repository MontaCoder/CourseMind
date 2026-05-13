import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, LucideIcon } from 'lucide-react';
import api from '@/lib/api';
import StyledText from '@/components/styledText';

export interface PolicyPageConfig {
  title: string;
  icon: LucideIcon;
  dataKey: 'privacy' | 'terms' | 'refund' | 'cancel' | 'billing';
  contactText?: string;
}

interface PolicyPageProps {
  config: PolicyPageConfig;
}

const PolicyPage = ({ config }: PolicyPageProps) => {
  const [data, setData] = useState('');
  const { title, icon: Icon, dataKey, contactText = 'Contact Our Legal Team' } = config;

  useEffect(() => {
    async function fetchPolicy() {
      const response = await api.get('/api/policies');
      setData(response.data[0][dataKey]);
    }
    fetchPolicy();
  }, [dataKey]);

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
            <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold">{title}</h1>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <StyledText text={data} />
          </div>

          <div className="text-center mt-16">
            <Button asChild>
              <Link to="/contact">{contactText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
