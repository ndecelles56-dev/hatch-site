import ContactActions from '@/components/contact-actions';
import { getContact } from '@/lib/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'tenant-hatch';

export default async function ContactPage({ params }: { params: { id: string } }) {
  const contact = await getContact(TENANT_ID, params.id);
  const messages = contact.messages ?? [];
  const consents = contact.consents ?? [];
  const activitySummary = contact.activitySummary ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            {contact.firstName} {contact.lastName}
          </h1>
          <p className="text-sm text-slate-500">Stage: {contact.stage}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {consents.map((consent: any) => (
              <span
                key={consent.id}
                className={`rounded-full px-2 py-1 font-medium ${
                  consent.status === 'GRANTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {consent.channel} · {consent.scope} · {consent.status}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Timeline</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            {messages.map((message: any) => (
              <div key={message.id} className="rounded border border-slate-100 p-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                  <span>
                    {message.channel} · {message.direction}
                  </span>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{message.body ?? message.subject}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Activity Summary</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {activitySummary.map((entry: any) => (
              <li key={entry.type} className="flex items-center justify-between">
                <span>{entry.type}</span>
                <span className="text-slate-500">{entry._count.type}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="space-y-4">
        <ContactActions contact={contact} tenantId={TENANT_ID} />
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Agreements</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {contact.agreements?.map((agreement: any) => (
              <li key={agreement.id}>
                {agreement.type} · {agreement.status} ·{' '}
                {agreement.signedAt ? new Date(agreement.signedAt).toLocaleDateString() : 'pending'}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Upcoming Tours</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {contact.tours?.map((tour: any) => (
              <li key={tour.id}>
                {tour.status} · {tour.listing?.addressLine1 ?? 'Listing'} ·{' '}
                {new Date(tour.startAt).toLocaleString()}
              </li>
            )) ?? <li>No tours scheduled.</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}
