import PolicyPage, { PolicyPageConfig } from '@/components/PolicyPage';
import { Shield } from 'lucide-react';

const config: PolicyPageConfig = {
  title: 'Privacy Policy',
  icon: Shield,
  dataKey: 'privacy',
  contactText: 'Contact Us With Questions',
};

const PrivacyPolicy = () => <PolicyPage config={config} />;

export default PrivacyPolicy;
