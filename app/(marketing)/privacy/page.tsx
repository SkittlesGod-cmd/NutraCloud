import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – FormLayer",
  description: "FormLayer Privacy Policy",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly: account details (name, email, password), formulation data you create, and payment information processed by Paddle (we do not store card numbers).\n\nWe also collect usage data automatically: pages visited, features used, browser type, IP address, and session identifiers. This is used to operate and improve the Platform.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to: (a) provide and maintain the FormLayer platform; (b) process payments through Paddle; (c) send transactional emails (account confirmations, billing receipts); (d) improve our AI models and features using anonymized, aggregated data; and (e) comply with legal obligations.\n\nWe do not sell your personal data to third parties.`,
  },
  {
    title: "3. AI and Third-Party Processing",
    body: `FormLayer uses AI models provided by third-party services (including OpenRouter and its underlying model providers). When you submit content for AI processing, that content is transmitted to these providers subject to their privacy policies. We recommend not submitting proprietary trade secrets in plain text — use descriptive terms instead.\n\nPayment processing is handled by Paddle, who acts as Merchant of Record. Paddle's privacy policy governs the handling of your payment data.`,
  },
  {
    title: "4. Data Storage and Security",
    body: `Your data is stored in Supabase-hosted databases in the United States. We use industry-standard security practices including encryption in transit (TLS) and at rest. Access is restricted to authorized personnel on a need-to-know basis.\n\nNo method of transmission over the internet is 100% secure. We cannot guarantee absolute security but take reasonable steps to protect your information.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your account and formulation data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes (typically 7 years for billing records).`,
  },
  {
    title: "6. Your Rights",
    body: `Depending on your location, you may have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data; object to or restrict processing; and data portability.\n\nTo exercise these rights, email us at privacy@formlayer.co. We will respond within 30 days.`,
  },
  {
    title: "7. Cookies",
    body: `We use essential cookies to maintain your session and authentication state. We do not use third-party advertising cookies. You can disable cookies in your browser settings, but this may prevent you from signing in to the Platform.`,
  },
  {
    title: "8. Children's Privacy",
    body: `FormLayer is not directed at children under 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact us at privacy@formlayer.co and we will delete it promptly.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notice. Continued use of the Platform after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact",
    body: `For privacy-related questions or requests:\n\nFormLayer, Inc.\nprivacy@formlayer.co`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-16 md:py-24">
      <div className="mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Legal</p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em] text-gray-950 md:text-[40px]">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[14px] text-gray-500">
          Last updated: May 30, 2026 &nbsp;·&nbsp; Effective: May 30, 2026
        </p>
      </div>

      <div className="mb-10 rounded-xl border border-black/[0.06] bg-gray-50 px-6 py-5">
        <p className="text-[13px] leading-relaxed text-gray-600">
          FormLayer is committed to protecting your privacy. We collect only what we need to operate the platform, never sell your data, and give you control over your information. This policy explains what we collect, how we use it, and your rights.
        </p>
      </div>

      <div className="space-y-10">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-[16px] font-semibold text-gray-950">{title}</h2>
            <div className="mt-3 space-y-3">
              {body.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-[14px] leading-relaxed text-gray-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-black/[0.06] pt-8">
        <p className="text-[13px] text-gray-400">
          © 2026 FormLayer, Inc. All rights reserved.{" "}
          <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
