import AdminPolicyEditor, { PolicyConfig } from '@/components/admin/AdminPolicyEditor';

const config: PolicyConfig = {
  title: 'Terms of Service',
  subtitle: 'Manage your terms of service content',
  cardTitle: 'Edit Terms of Service',
  storageKey: 'terms',
  apiType: 'terms',
  placeholder: 'Start writing Terms of Service.',
  successMessage: 'Terms of Service saved successfully',
};

const AdminTerms = () => <AdminPolicyEditor config={config} />;

export default AdminTerms;
