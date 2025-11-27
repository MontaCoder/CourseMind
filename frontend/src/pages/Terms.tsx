import PolicyPage, { PolicyPageConfig } from '@/components/PolicyPage';
import { FileText } from 'lucide-react';

const config: PolicyPageConfig = {
  title: 'Terms of Service',
  icon: FileText,
  dataKey: 'terms',
};

const Terms = () => <PolicyPage config={config} />;

export default Terms;
