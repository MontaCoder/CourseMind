import PolicyPage, { PolicyPageConfig } from '@/components/PolicyPage';
import { FileText } from 'lucide-react';

const config: PolicyPageConfig = {
  title: 'Subscription Cancellation Policy',
  icon: FileText,
  dataKey: 'cancel',
};

const CancellationPolicy = () => <PolicyPage config={config} />;

export default CancellationPolicy;
