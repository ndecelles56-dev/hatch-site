import TourBookerForm from '@/components/tour-booker-form';
import { listContacts, listListings } from '@/lib/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.VITE_TENANT_ID ?? 'tenant-hatch';

export default async function TourBookerPage() {
  const [contacts, listings] = await Promise.all([
    listContacts(TENANT_ID),
    listListings(TENANT_ID)
  ]);

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tour Booker</h1>
        <p className="text-sm text-slate-500">Tours require an active buyer-rep agreement before confirmation.</p>
      </div>
      <TourBookerForm tenantId={TENANT_ID} contacts={contacts} listings={listings} />
    </div>
  );
}
