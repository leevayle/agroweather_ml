import type { AuthUser } from '../../lib/api'

export default function Insights({ user }: { user: AuthUser | null }) {
  const crops = user?.crops ?? []

  return (
    <div className="pb-24 md:pb-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">AI Insights</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Crop information from your account
        </p>
      </div>

      <section className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
          Your registered crops
        </h2>
        {crops.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {crops.map(crop => (
              <li
                key={crop}
                className="rounded-full bg-[var(--secondary)] px-3 py-1.5 text-sm font-medium text-[var(--primary)]"
              >
                {crop}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No crops have been added to this account.
          </p>
        )}
      </section>

      <section className="bg-[var(--background)] border border-dashed border-[var(--border)] rounded-2xl p-6 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Personalized recommendations are not available yet.
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Recommendations will appear here when the insights service is connected.
        </p>
      </section>
    </div>
  )
}
