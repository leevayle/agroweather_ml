type LegalDocument = 'privacy' | 'terms'

interface LegalPageProps {
  document: LegalDocument
  onBack: () => void
}

const content: Record<LegalDocument, { title: string; sections: { title: string; text: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        title: 'Information we collect',
        text: 'When you create an account, AgroWeather stores information you provide, such as your name, email address, farm name, location, farm size, crop selections, and station code. Connected weather stations may send sensor readings, including temperature, humidity, rainfall, wind, pressure, and timestamps.',
      },
      {
        title: 'How information is used',
        text: 'We use account and station information to provide the dashboard, display weather readings, generate available forecasts, maintain account access, and operate and improve AgroWeather.',
      },
      {
        title: 'Storage and security',
        text: 'Account and weather data are stored by the AgroWeather backend. The service uses authentication to protect account endpoints. No method of storage or transmission can be guaranteed completely secure; keep your password private and contact us if you suspect unauthorized access.',
      },
      {
        title: 'Sharing and retention',
        text: 'We do not sell personal information. Information may be processed by the hosting, database, and infrastructure providers needed to operate the service, or disclosed when required by law. We retain information while it is needed to provide your account and service, subject to applicable legal requirements.',
      },
      {
        title: 'Your choices and contact',
        text: 'You can review and update crop selections in your profile. Use the contact form on the AgroWeather landing page for questions or requests about your account information.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      {
        title: 'Using AgroWeather',
        text: 'By using AgroWeather, you agree to these terms. You must provide accurate account information, keep your login credentials secure, and use the service only in ways permitted by applicable law. You are responsible for activity under your account.',
      },
      {
        title: 'Weather data and guidance',
        text: 'Readings depend on your station, sensors, network, and submitted data. Forecasts and other generated information may be incomplete, delayed, or inaccurate. AgroWeather provides informational tools, not guaranteed predictions or professional agricultural, safety, or emergency advice. Make operational decisions using your own judgment and other appropriate sources.',
      },
      {
        title: 'Acceptable use',
        text: 'Do not misuse, disrupt, or attempt to gain unauthorized access to the service, its accounts, or infrastructure. Do not upload unlawful content or interfere with other users’ access.',
      },
      {
        title: 'Availability and changes',
        text: 'Features may change as AgroWeather is developed. We aim to keep the service available but do not guarantee uninterrupted access. We may suspend access when reasonably necessary to protect users or operate the service.',
      },
      {
        title: 'Disclaimer and liability',
        text: 'AgroWeather is provided “as is” and, to the extent permitted by law, without warranties of accuracy, availability, or fitness for a particular purpose. To the extent permitted by law, AgroWeather is not liable for indirect or consequential losses resulting from use of the service or reliance on its readings or forecasts. These terms do not limit rights that cannot legally be excluded.',
      },
      {
        title: 'Questions',
        text: 'Use the contact form on the AgroWeather landing page if you have questions about these terms.',
      },
    ],
  },
}

export default function LegalPage({ document, onBack }: LegalPageProps) {
  const page = content[document]

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" onClick={event => { event.preventDefault(); onBack() }} className="flex items-center gap-2">
            <img src="/logo.webp" alt="AgroWeather" className="w-9 h-9 object-contain" />
            <span className="font-semibold text-[var(--foreground)]">AgroWeather</span>
          </a>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Back to home
          </button>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
          {page.title}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-10">Last updated: October 27, 2026</p>
        <div className="space-y-7">
          {page.sections.map(section => (
            <section key={section.title}>
              <h2 className="font-semibold text-[var(--foreground)] mb-2">{section.title}</h2>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{section.text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
