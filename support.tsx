import React, { useState } from 'react';
import { Sparkles, Mail, MessageCircle, HelpCircle, Book, AlertCircle, Send, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SupportPageProps {
  onNavigate: (page: string) => void;
}

export function SupportPage({ onNavigate }: SupportPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Save contact form submission to Supabase
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c9b0e48/waitlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email: formData.email, 
            source: `support-form-${formData.type}`,
            metadata: {
              name: formData.name,
              subject: formData.subject,
              message: formData.message,
              type: formData.type,
              timestamp: new Date().toISOString(),
            }
          }),
        }
      );

      if (response.ok) {
        setSubmitStatus({ 
          type: 'success', 
          message: "Thank you! We've received your message and will respond within 24-48 hours." 
        });
        setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: 'Failed to send message. Please try emailing us directly.' 
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Network error. Please try again or email us directly at support@betweenus.semprog.de' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <button onClick={() => onNavigate('terms')} className="hover:text-purple-300 transition-colors">
            Terms
          </button>
          <button onClick={() => onNavigate('support')} className="text-purple-300">
            Support
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-6 py-12 max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <MessageCircle className="size-16 text-purple-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-xl text-gray-300">We're here to help you every step of the way</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Mail className="size-6 text-purple-300" />
                Contact Us
              </h2>
              
              <div className="space-y-4">
                <ContactMethod
                  icon={<Mail className="size-5" />}
                  title="General Support"
                  contact="support@betweenus.semprog.de"
                  description="For general inquiries, technical issues, or account help"
                />
                
                <ContactMethod
                  icon={<AlertCircle className="size-5" />}
                  title="Privacy Concerns"
                  contact="privacy@betweenus.semprog.de"
                  description="For data privacy questions or GDPR requests"
                />
                
                <ContactMethod
                  icon={<Book className="size-5" />}
                  title="Legal Matters"
                  contact="legal@betweenus.semprog.de"
                  description="For legal inquiries, terms questions, or copyright issues"
                />
              </div>

              <div className="mt-8 p-4 bg-purple-500/10 border border-purple-400/30 rounded-xl">
                <p className="text-sm text-gray-300">
                  <strong>Response Time:</strong> We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>

            {/* Crisis Resources */}
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-red-300">
                <AlertCircle className="size-6" />
                Crisis Support
              </h2>
              
              <p className="text-gray-300 mb-4">
                If you're experiencing a mental health crisis or having thoughts of self-harm, please contact 
                emergency services or a crisis helpline immediately.
              </p>

              <div className="space-y-3">
                <CrisisResource
                  title="National Suicide Prevention Lifeline (US)"
                  contact="988"
                  description="24/7 free and confidential support"
                />
                <CrisisResource
                  title="Crisis Text Line (US)"
                  contact="Text HOME to 741741"
                  description="24/7 crisis support via text"
                />
                <CrisisResource
                  title="International Association for Suicide Prevention"
                  contact="iasp.info"
                  description="Find helplines worldwide"
                />
                <CrisisResource
                  title="Emergency Services"
                  contact="911 (US) / 112 (EU)"
                  description="For immediate emergencies"
                />
              </div>

              <p className="mt-4 text-sm text-gray-400">
                Between Us is a peer support community, not a replacement for professional mental health care.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Send className="size-6 text-purple-300" />
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-400"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-400"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2">
                  Type of Inquiry
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white"
                >
                  <option value="general" className="bg-gray-900">General Question</option>
                  <option value="technical" className="bg-gray-900">Technical Issue</option>
                  <option value="account" className="bg-gray-900">Account Help</option>
                  <option value="billing" className="bg-gray-900">Billing/Subscription</option>
                  <option value="privacy" className="bg-gray-900">Privacy Concern</option>
                  <option value="feedback" className="bg-gray-900">Feedback/Suggestion</option>
                  <option value="other" className="bg-gray-900">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-400"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-400 resize-none"
                  placeholder="Tell us more about your question or issue..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Send Message
                  </>
                )}
              </button>

              {submitStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                  submitStatus.type === 'success'
                    ? 'bg-green-500/10 border border-green-400/30'
                    : 'bg-red-500/10 border border-red-400/30'
                }`}>
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="size-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={submitStatus.type === 'success' ? 'text-green-200' : 'text-red-200'}>
                    {submitStatus.message}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <HelpCircle className="size-8 text-purple-300" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FAQItem
              question="How is my anonymity protected?"
              answer="Between Us separates your account identity from your community posts. When you share posts or replies, other users cannot see your name, email, or any identifying information. Only you can view your own posts in your profile."
            />

            <FAQItem
              question="Can I use Between Us for free?"
              answer="Yes! Between Us offers a free tier with daily mood check-ins, private journal entries, and the ability to share 3 community posts per month. Premium and Pro tiers unlock additional features like post editing and increased post limits."
            />

            <FAQItem
              question="Is Between Us a replacement for therapy?"
              answer="No. Between Us is a peer support community designed to complement professional mental health care, not replace it. We strongly encourage seeking help from licensed mental health professionals for clinical support."
            />

            <FAQItem
              question="How do I delete my account?"
              answer="You can delete your account anytime from the Profile tab in the app. Go to Settings > Account > Delete Account. Your personal data will be removed within 30 days, though anonymous community posts will remain (they cannot be traced back to you)."
            />

            <FAQItem
              question="What languages does Between Us support?"
              answer="Between Us currently supports 6 languages: English, Spanish, French, German, Italian, and Portuguese. You can select your preferred languages during signup or change them in your profile settings."
            />

            <FAQItem
              question="How do I report inappropriate content?"
              answer="If you see content that violates our Community Guidelines, tap the ••• menu on any post and select 'Report'. Our moderation team reviews all reports promptly and takes appropriate action."
            />

            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay for subscription upgrades and credit purchases."
            />

            <FAQItem
              question="How do I contact support?"
              answer="You can email us at support@betweenus.semprog.de or use the contact form on this page. We typically respond within 24-48 hours during business days."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          <p>&copy; 2025 Between Us. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ContactMethod({ icon, title, contact, description }: { 
  icon: React.ReactNode; 
  title: string; 
  contact: string; 
  description: string;
}) {
  const isEmail = contact.includes('@');
  
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
      <div className="text-purple-300 flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{title}</h3>
        {isEmail ? (
          <a href={`mailto:${contact}`} className="text-purple-300 hover:text-purple-200 text-sm block mb-1">
            {contact}
          </a>
        ) : (
          <p className="text-purple-300 text-sm mb-1">{contact}</p>
        )}
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function CrisisResource({ title, contact, description }: { 
  title: string; 
  contact: string; 
  description: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/20">
      <h4 className="font-semibold text-red-200 text-sm mb-1">{title}</h4>
      <p className="text-red-100 text-sm mb-1">{contact}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 text-left group"
      >
        <span className="font-semibold text-lg group-hover:text-purple-300 transition-colors">
          {question}
        </span>
        <HelpCircle className={`size-5 text-purple-300 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <p className="mt-4 text-gray-300 leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}