import { getBrokerDashboard } from '@/lib/api';

export const dynamic = 'force-dynamic';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? process.env.VITE_TENANT_ID ?? 'tenant-hatch';

export default async function DashboardPage() {
  const dashboard = await getBrokerDashboard(TENANT_ID);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Broker Dashboard</h1>
        <p className="text-sm text-slate-500">
          Snapshot of lead-to-appointment conversion, buyer-rep coverage, deliverability, and risk.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Lead → Kept Appointment</h2>
          <p className="mt-2 text-3xl font-bold text-brand-600">
            {(dashboard.leadToKeptRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Tours with Active Buyer-Rep</h2>
          <p className="mt-2 text-3xl font-bold text-brand-600">
            {(dashboard.toursWithBbaRate * 100).toFixed(1)}%
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Deliverability</h2>
        <div className="mt-3 space-y-2 text-sm">
          {dashboard.deliverability.map((row) => (
            <div key={row.channel} className="flex justify-between border-b border-slate-100 pb-2 last:border-b-0">
              <span className="font-medium text-slate-600">{row.channel}</span>
              <span className="text-slate-500">
                Delivered {row.delivered} / Accepted {row.accepted} • Bounced {row.bounced} • Opt-outs {row.optOuts}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Clear Cooperation</h2>
        <div className="mt-3 space-y-2 text-sm">
          {dashboard.clearCooperation.map((timer) => (
            <div key={timer.timerId} className="flex items-center justify-between rounded border border-slate-100 p-3">
              <div>
                <p className="font-medium text-slate-700">{timer.listing?.addressLine1 ?? 'Unassigned Listing'}</p>
                <p className="text-xs text-slate-500">Status: {timer.status}</p>
              </div>
              <span className="text-xs text-slate-500">
                Deadline {timer.deadlineAt ? new Date(timer.deadlineAt).toLocaleString() : 'pending'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
