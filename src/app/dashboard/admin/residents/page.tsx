import { ResidentsList } from '@/components/admin/ResidentsList';

export const metadata = {
  title: 'Manage Residents | OurApartment',
  description: 'View residents and manage admin roles',
};

export default function ResidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          Community Members
        </h1>
        <p className="max-w-2xl text-sm text-gray-500">
          View all approved residents and existing admins. Use the controls to
          filter by role or promote trustworthy residents to help manage the
          community.
        </p>
      </div>

      <ResidentsList />
    </div>
  );
}
