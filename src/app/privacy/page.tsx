import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Anteres AI',
  description: 'Privacy Policy for Anteres AI content generation platform.',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen text-slate-200 px-6 py-16 md:px-12 selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors mb-8 inline-block">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: April 11, 2025</p>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Anteres AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the Anteres AI platform 
              (anteres-ai.vercel.app). This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Account Information:</strong> When you create an account via Clerk authentication, we collect your name, email address, and profile information.</li>
              <li><strong className="text-white">Content Inputs:</strong> Text prompts, raw thoughts, news signals, and domain context you submit for AI-powered content generation.</li>
              <li><strong className="text-white">Generated Content:</strong> AI-generated posts, hashtags, and metadata stored in our database for your access.</li>
              <li><strong className="text-white">Usage Data:</strong> Information about how you interact with our platform, including timestamps and generation history.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve the Anteres AI content generation service.</li>
              <li>To process your content generation requests through our AI engine.</li>
              <li>To store your generation history for future reference and archival.</li>
              <li>To sync generation data with connected third-party services (Google Sheets) at your request.</li>
              <li>To authenticate your identity and protect your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage & Security</h2>
            <p>
              Your data is stored securely in MongoDB with encryption at rest. Authentication is managed 
              through Clerk, an enterprise-grade identity platform. We implement industry-standard 
              security measures including HTTPS encryption, server-side validation, and access controls 
              to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p className="mb-3">We integrate with the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Clerk:</strong> Authentication and user management.</li>
              <li><strong className="text-white">Hugging Face:</strong> AI model inference for content generation.</li>
              <li><strong className="text-white">MongoDB Atlas:</strong> Secure database storage.</li>
              <li><strong className="text-white">Google Sheets API:</strong> Optional data synchronization.</li>
              <li><strong className="text-white">LinkedIn API:</strong> Optional direct posting to LinkedIn.</li>
              <li><strong className="text-white">Vercel:</strong> Application hosting and deployment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your generation data for as long as your account is active or as needed to 
              provide you services. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access, update, or delete your personal information.</li>
              <li>Request a copy of your stored data.</li>
              <li>Opt out of optional data synchronization features.</li>
              <li>Delete your account and all associated data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:rahulpandey1878@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                rahulpandey1878@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-600">
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  );
}
