export default function LoginPage() {
  return (
    <div className="mx-auto mt-20 max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Sign in to Hatch CRM</h1>
      <p className="mt-2 text-sm text-slate-500">
        Staff authenticate via single sign-on with Google or Microsoft. This demo simulates an authenticated session.
      </p>
      <button className="mt-6 w-full rounded bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
        Continue with SSO
      </button>
    </div>
  );
}
