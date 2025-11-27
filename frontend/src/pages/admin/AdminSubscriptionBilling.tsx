import AdminPolicyEditor, { PolicyConfig } from '@/components/admin/AdminPolicyEditor';

const config: PolicyConfig = {
  title: 'Subscription & Billing Policy',
  subtitle: 'Manage subscription and billing policy content',
  cardTitle: 'Edit Subscription & Billing Policy',
  storageKey: 'billing',
  apiType: 'billing',
  placeholder: 'Start writing Subscription & Billing Policy.',
  successMessage: 'Subscription & Billing policy saved successfully',
};

const AdminSubscriptionBilling = () => <AdminPolicyEditor config={config} />;

export default AdminSubscriptionBilling;
