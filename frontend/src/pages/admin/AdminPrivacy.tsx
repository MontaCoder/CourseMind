import AdminPolicyEditor, { PolicyConfig } from '@/components/admin/AdminPolicyEditor';

const config: PolicyConfig = {
  title: 'Privacy Policy',
  subtitle: 'Manage your privacy policy content',
  cardTitle: 'Edit Privacy Policy',
  storageKey: 'privacy',
  apiType: 'privacy',
  placeholder: 'Start writing Privacy Policy.',
  successMessage: 'Privacy policy saved successfully',
};

const AdminPrivacy = () => <AdminPolicyEditor config={config} />;

export default AdminPrivacy;
