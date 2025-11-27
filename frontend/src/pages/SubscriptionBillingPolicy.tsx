import PolicyPage, { PolicyPageConfig } from '@/components/PolicyPage';
import { FileText } from 'lucide-react';

const config: PolicyPageConfig = {
  title: 'Subscription Billing Policy',
  icon: FileText,
  dataKey: 'billing',
};

const SubscriptionBillingPolicy = () => <PolicyPage config={config} />;

export default SubscriptionBillingPolicy;
