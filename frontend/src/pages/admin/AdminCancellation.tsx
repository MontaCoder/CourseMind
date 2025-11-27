import AdminPolicyEditor, { PolicyConfig } from '@/components/admin/AdminPolicyEditor';

const config: PolicyConfig = {
  title: 'Cancellation Policy',
  subtitle: 'Manage your cancellation policy content',
  cardTitle: 'Edit Cancellation Policy',
  storageKey: 'cancel',
  apiType: 'cancel',
  placeholder: 'Start writing Cancellation Policy.',
  successMessage: 'Cancellation policy saved successfully',
};

const AdminCancellation = () => <AdminPolicyEditor config={config} />;

export default AdminCancellation;
