export const metadata = {
  title: "Sign In",
  description: "Sign in to your NutraCloud account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand flex-col justify-between p-12 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-white/5" />

        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2.5 mb-10">
            <span className="size-2 rounded-full bg-white" />
            <span className="font-semibold text-white text-lg tracking-tight">NutraCloud</span>
          </a>

          <h2 className="text-3xl font-bold text-white leading-snug mb-8">
            Your supplement formulation workspace awaits.
          </h2>

          <ul className="space-y-5 mb-10">
            {[
              "Access your formulation workspaces",
              "Review compliance for your products",
              "Connect with manufacturers",
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-purple-100 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative molecule */}
        <div className="relative z-10 flex justify-center mt-8 opacity-30">
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            <circle cx="100" cy="100" r="30" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <circle cx="160" cy="80" r="20" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <circle cx="50" cy="80" r="20" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <circle cx="80" cy="150" r="18" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <circle cx="140" cy="150" r="18" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="100" y1="100" x2="160" y2="80" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="100" y1="100" x2="50" y2="80" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="100" y1="100" x2="80" y2="150" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="100" y1="100" x2="140" y2="150" stroke="white" strokeWidth="2" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-5 py-12">
        {children}
      </div>
    </div>
  );
}
