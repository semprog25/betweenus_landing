import React from 'react';
import { Sparkles, FileText, AlertCircle, Shield, Users, DollarSign } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (page: string) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
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
          <button onClick={() => onNavigate('privacy')} className="hover:text-purple-300 transition-colors">
            Privacy
          </button>
          <button onClick={() => onNavigate('terms')} className="text-purple-300">
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
          <FileText className="size-16 text-purple-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-300">Last updated: November 20, 2025</p>
        </div>

        <div className="space-y-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
          <Section icon={<FileText className="size-6" />} title="1. Acceptance of Terms">
            <p>
              By accessing or using Between Us ("the App"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, please do not use the App.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and Between Us. We reserve the right to 
              modify these Terms at any time. Continued use of the App after changes indicates acceptance of the new Terms.
            </p>
          </Section>

          <Section icon={<Users className="size-6" />} title="2. Eligibility">
            <p>You must meet the following requirements to use Between Us:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Be at least 13 years old (or the age of digital consent in your jurisdiction)</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Not be prohibited from using the App under applicable laws</li>
              <li>Provide accurate information during registration</li>
            </ul>
            <p className="mt-4">
              If you are under 18, you represent that you have parental or guardian consent to use the App.
            </p>
          </Section>

          <Section icon={<Shield className="size-6" />} title="3. Account Registration and Security">
            <h4 className="font-semibold text-purple-300 mb-2">Account Creation</h4>
            <p className="mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Account Termination</h4>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms or engage in 
              harmful behavior. You may delete your account at any time through the App settings.
            </p>
          </Section>

          <Section icon={<Users className="size-6" />} title="4. Community Guidelines">
            <p className="mb-4">
              Between Us is a safe space for mental wellness support. You agree to:
            </p>
            
            <h4 className="font-semibold text-green-300 mb-2">✓ DO:</h4>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Be kind, supportive, and empathetic</li>
              <li>Share your genuine thoughts and feelings</li>
              <li>Respect others' anonymity and privacy</li>
              <li>Report harmful content or behavior</li>
              <li>Use content warnings for sensitive topics</li>
            </ul>

            <h4 className="font-semibold text-red-300 mb-2">✗ DO NOT:</h4>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Post content that is hateful, abusive, or discriminatory</li>
              <li>Share graphic descriptions of self-harm or suicide methods</li>
              <li>Attempt to identify or dox other users</li>
              <li>Spam, advertise, or post promotional content</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Share illegal content or promote illegal activities</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Post sexually explicit or inappropriate content</li>
            </ul>

            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 mt-6">
              <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                <AlertCircle className="size-5" />
                Crisis Support
              </h4>
              <p>
                If you're experiencing a mental health crisis or having thoughts of self-harm, please contact 
                emergency services or a crisis helpline immediately. Between Us is a peer support community, 
                not a replacement for professional mental health care.
              </p>
              <p className="mt-2">
                <strong>Crisis Resources:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>National Suicide Prevention Lifeline: 988 (US)</li>
                <li>Crisis Text Line: Text HOME to 741741 (US)</li>
                <li>International Association for Suicide Prevention: iasp.info</li>
              </ul>
            </div>
          </Section>

          <Section icon={<Shield className="size-6" />} title="5. User Content">
            <h4 className="font-semibold text-purple-300 mb-2">Your Content</h4>
            <p className="mb-4">
              You retain ownership of content you create (posts, journal entries, check-ins). By posting content, 
              you grant Between Us a worldwide, non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Store and display your content within the App</li>
              <li>Moderate content for safety and compliance</li>
              <li>Create anonymized analytics and insights</li>
              <li>Improve our services and develop new features</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Content Moderation</h4>
            <p>
              We reserve the right to remove content that violates these Terms or our Community Guidelines. 
              We use a combination of automated tools and human moderators to keep the community safe.
            </p>
          </Section>

          <Section icon={<DollarSign className="size-6" />} title="6. Subscriptions and Payments">
            <h4 className="font-semibold text-purple-300 mb-2">Free Tier</h4>
            <p className="mb-4">
              Between Us offers a free tier with limited features, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Daily mood check-ins</li>
              <li>Private journal entries</li>
              <li>3 community posts per month</li>
              <li>Basic support</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Premium and Pro Tiers</h4>
            <p className="mb-4">
              Paid subscriptions include additional features such as:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Ability to edit posts with credits</li>
              <li>Increased monthly post limits</li>
              <li>Priority support</li>
              <li>Advanced analytics</li>
              <li>Ad-free experience</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Billing</h4>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Subscriptions are billed monthly or annually in advance</li>
              <li>Prices are in USD unless otherwise stated</li>
              <li>All sales are final; refunds are provided at our discretion</li>
              <li>You can cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Edit Credits</h4>
            <p>
              Premium users can purchase additional edit credits. Credits do not expire but are non-refundable 
              and cannot be transferred to other users.
            </p>
          </Section>

          <Section icon={<Shield className="size-6" />} title="7. Privacy and Data Protection">
            <p>
              Your privacy is important to us. Our collection and use of personal information is governed by our 
              Privacy Policy, which is incorporated into these Terms by reference. Please review our{' '}
              <button 
                onClick={() => onNavigate('privacy')} 
                className="text-purple-300 hover:text-purple-200 underline"
              >
                Privacy Policy
              </button>{' '}
              to understand our practices.
            </p>
          </Section>

          <Section icon={<AlertCircle className="size-6" />} title="8. Disclaimers and Limitations">
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-6 mb-4">
              <h4 className="font-semibold text-yellow-300 mb-2">Not Medical Advice</h4>
              <p>
                Between Us is a peer support community and does NOT provide medical or professional mental health 
                advice, diagnosis, or treatment. Content shared by users represents their personal experiences and 
                should not be considered professional guidance.
              </p>
              <p className="mt-2">
                Always consult with qualified healthcare professionals for medical or mental health concerns.
              </p>
            </div>

            <h4 className="font-semibold text-purple-300 mb-2">Service Provided "As Is"</h4>
            <p className="mb-4">
              The App is provided "as is" and "as available" without warranties of any kind, either express or implied, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties of accuracy, completeness, or reliability</li>
              <li>Warranties of uninterrupted or error-free service</li>
              <li>Warranties regarding third-party content or advice</li>
            </ul>

            <h4 className="font-semibold text-purple-300 mb-2">Limitation of Liability</h4>
            <p>
              To the maximum extent permitted by law, Between Us shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, including loss of profits, data, or other intangible losses 
              resulting from your use of the App.
            </p>
          </Section>

          <Section icon={<FileText className="size-6" />} title="9. Intellectual Property">
            <p>
              The App and its original content (excluding user-generated content), features, and functionality are 
              owned by Between Us and are protected by international copyright, trademark, and other intellectual 
              property laws.
            </p>
            <p className="mt-4">
              You may not copy, modify, distribute, sell, or lease any part of our services without explicit 
              written permission.
            </p>
          </Section>

          <Section icon={<Shield className="size-6" />} title="10. Indemnification">
            <p>
              You agree to indemnify and hold harmless Between Us and its affiliates, officers, directors, employees, 
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your use or misuse of the App</li>
              <li>Content you post or share</li>
            </ul>
          </Section>

          <Section icon={<FileText className="size-6" />} title="11. Governing Law and Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>
            <p className="mt-4">
              Any disputes arising from these Terms or the App shall be resolved through binding arbitration in 
              accordance with [Arbitration Rules]. You waive your right to participate in class action lawsuits.
            </p>
          </Section>

          <Section icon={<Shield className="size-6" />} title="12. Severability">
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
              limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in 
              full force and effect.
            </p>
          </Section>

          <Section icon={<FileText className="size-6" />} title="13. Entire Agreement">
            <p>
              These Terms, together with our Privacy Policy and any other agreements referenced herein, constitute 
              the entire agreement between you and Between Us regarding the use of the App and supersede all prior 
              agreements and understandings.
            </p>
          </Section>

          <Section icon={<AlertCircle className="size-6" />} title="14. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you via:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Email notification to your registered address</li>
              <li>In-app notification</li>
              <li>Prominent notice on our website</li>
            </ul>
            <p className="mt-4">
              Your continued use of the App after changes take effect constitutes acceptance of the modified Terms.
            </p>
          </Section>

          <Section icon={<Users className="size-6" />} title="15. Contact Information">
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-6 space-y-2">
              <p><strong>General Inquiries:</strong> <a href="mailto:support@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">support@betweenus.semprog.de</a></p>
              <p><strong>Legal Matters:</strong> <a href="mailto:legal@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">legal@betweenus.semprog.de</a></p>
              <p><strong>Privacy Concerns:</strong> <a href="mailto:privacy@betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">privacy@betweenus.semprog.de</a></p>
              <p><strong>Website:</strong> <a href="https://betweenus.semprog.de" className="text-purple-300 hover:text-purple-200 underline">betweenus.semprog.de</a></p>
            </div>
          </Section>

          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <p className="text-center">
              By using Between Us, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service and our Privacy Policy.
            </p>
          </div>
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
