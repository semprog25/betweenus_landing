import React from 'react';
import { Sparkles, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
          <Sparkles className="size-8 text-purple-300" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Between Us
          </span>
        </button>
        <div className="hidden md:flex gap-6 text-sm">
          <button onClick={() => onNavigate('home')} className="hover:text-purple-300 transition-colors">
            Home
          </button>
          <button onClick={() => onNavigate('privacy')} className="text-purple-300">
            Privacy
          </button>
          <button onClick={() => onNavigate('terms')} className="hover:text-purple-300 transition-colors">
            Terms
          </button>
          <button onClick={() => onNavigate('support')} className="hover:text-purple-300 transition-colors">
            Support
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-6 py-12 max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <Shield className="size-16 text-purple-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-300">Last updated: November 20, 2025</p>
        </div>

        <div className="space-y-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
          <Section icon={<Shield className="size-6" />} title="Our Commitment to Privacy">
            <p>
              At Between Us, we take your privacy seriously. This policy explains how we collect, use, and protect 
              your personal information when you use our anonymous mental wellness and support app.
            </p>
            <p>
              Our core principle: <strong>Your anonymity is paramount.</strong> We've designed Between Us to allow 
              you to share your thoughts and feelings without revealing your identity to other users.
            </p>
          </Section>

          <Section icon={<Database className="size-6" />} title="Information We Collect">
            <h4 className="font-semibold text-purple-300 mb-2">Account Information</h4>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Email address (for authentication and account recovery)</li>
              <li>Display name (optional, never shown to other users)</li>
              <li>Language preferences</li>
              <li>Subscription tier (free, premium, or pro)</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Wellness Data</h4>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Daily mood check-ins and emotional tracking data</li>
              <li>Journal entries (private, never shared)</li>
              <li>Posts shared to the community (anonymous)</li>
              <li>Replies and support given to others (anonymous)</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Technical Information</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Device type and operating system</li>
              <li>App usage analytics (anonymized)</li>
              <li>Error logs for debugging</li>
            </ul>
          </Section>

          <Section icon={<Lock className="size-6" />} title="How We Use Your Information">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>To provide the service:</strong> Process your check-ins, journal entries, and community posts</li>
              <li><strong>To maintain anonymity:</strong> Separate your identity from your shared content</li>
              <li><strong>To improve the app:</strong> Analyze usage patterns to enhance features and user experience</li>
              <li><strong>To communicate:</strong> Send important updates, security alerts, and feature announcements</li>
              <li><strong>To provide support:</strong> Respond to your questions and troubleshoot issues</li>
              <li><strong>To process payments:</strong> Handle subscription upgrades and credit purchases securely</li>
            </ul>
          </Section>

          <Section icon={<UserCheck className="size-6" />} title="Your Anonymity">
            <p>
              When you share posts or replies in the community:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Your identity is <strong>never revealed</strong> to other users</li>
              <li>Posts are displayed without your name or email</li>
              <li>We use internal identifiers to prevent abuse while maintaining your privacy</li>
              <li>Only you can see your own posts in your profile</li>
              <li>Even we (Between Us staff) cannot easily link your account to your anonymous posts</li>
            </ul>
          </Section>

          <Section icon={<Eye className="size-6" />} title="Data Sharing and Disclosure">
            <p className="mb-4">
              We <strong>do not sell</strong> your personal information to third parties. We may share data only in these limited circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Service providers:</strong> Trusted vendors who help operate our app (e.g., Supabase for database, payment processors)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect safety</li>
              <li><strong>With your consent:</strong> When you explicitly authorize data sharing</li>
            </ul>
          </Section>

          <Section icon={<Shield className="size-6" />} title="Data Security">
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>End-to-end encryption for data transmission</li>
              <li>Secure cloud storage with Supabase</li>
              <li>Regular security audits and updates</li>
              <li>Limited employee access to personal data</li>
              <li>Two-factor authentication (coming soon)</li>
            </ul>
          </Section>

          <Section icon={<Database className="size-6" />} title="Your Rights">
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correct:</strong> Update or fix incorrect information</li>
              <li><strong>Delete:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your journal entries and check-in history</li>
              <li><strong>Object:</strong> Opt-out of certain data processing activities</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">privacy@betweenus.semprog.de</a>
            </p>
          </Section>

          <Section icon={<Shield className="size-6" />} title="Data Retention">
            <p>
              We retain your data for as long as your account is active. When you delete your account:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Personal information is deleted within 30 days</li>
              <li>Anonymous community posts remain (they cannot be traced back to you)</li>
              <li>Backup copies are removed within 90 days</li>
              <li>Legal retention requirements may require keeping some data longer</li>
            </ul>
          </Section>

          <Section icon={<UserCheck className="size-6" />} title="Children's Privacy">
            <p>
              Between Us is not intended for users under 13 years old. We do not knowingly collect data from children. 
              If you believe a child has provided us with personal information, please contact us immediately at{' '}
              <a href="mailto:privacy@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">
                privacy@betweenus.semprog.de
              </a>
            </p>
          </Section>

          <Section icon={<Globe className="size-6" />} title="International Data Transfers">
            <p>
              Your data may be processed in countries other than where you reside. We ensure appropriate safeguards 
              are in place to protect your data, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Standard contractual clauses</li>
              <li>GDPR compliance for EU users</li>
              <li>CCPA compliance for California users</li>
            </ul>
          </Section>

          <Section icon={<Lock className="size-6" />} title="Cookies and Tracking">
            <p>
              We use minimal cookies and tracking technologies:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong>Essential cookies:</strong> Required for authentication and app functionality</li>
              <li><strong>Analytics:</strong> Anonymized usage data to improve the app</li>
              <li><strong>No advertising cookies:</strong> We don't use cookies for targeted advertising</li>
            </ul>
          </Section>

          <Section icon={<Shield className="size-6" />} title="Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We'll notify you of significant changes via:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Email notification</li>
              <li>In-app announcement</li>
              <li>Updated "Last modified" date at the top of this page</li>
            </ul>
            <p className="mt-4">
              Continued use of Between Us after changes indicates your acceptance of the updated policy.
            </p>
          </Section>

          <Section icon={<UserCheck className="size-6" />} title="Contact Us">
            <p className="mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-6 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:privacy@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">privacy@betweenus.semprog.de</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">support@betweenus.semprog.de</a></p>
              <p><strong>Legal:</strong> <a href="mailto:legal@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">legal@betweenus.semprog.de</a></p>
              <p><strong>Website:</strong> <a href="https://betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">betweenus.semprog.de</a></p>
            </div>
          </Section>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          <p>&copy; 2025 Between Us. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-purple-300">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="text-gray-300 space-y-4 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
