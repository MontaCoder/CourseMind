import PolicyPage, { PolicyPageConfig } from '@/components/PolicyPage';
import { FileText } from 'lucide-react';

const config: PolicyPageConfig = {
  title: 'Refund Policy',
  icon: FileText,
  dataKey: 'refund',
};

const RefundPolicy = () => <PolicyPage config={config} />;

export default RefundPolicy;
