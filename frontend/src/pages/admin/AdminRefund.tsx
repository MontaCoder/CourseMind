import AdminPolicyEditor, { PolicyConfig } from '@/components/admin/AdminPolicyEditor';

const config: PolicyConfig = {
  title: 'Refund Policy',
  subtitle: 'Manage your refund policy content',
  cardTitle: 'Edit Refund Policy',
  storageKey: 'refund',
  apiType: 'refund',
  placeholder: 'Start writing Refund Policy.',
  successMessage: 'Refund policy saved successfully',
};

const AdminRefund = () => <AdminPolicyEditor config={config} />;

export default AdminRefund;
