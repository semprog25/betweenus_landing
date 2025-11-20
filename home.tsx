import React, { useState } from 'react';
import { Sparkles, Heart, MessageCircle, Shield, Globe, ArrowRight, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c9b0e48/waitlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, source: 'landing-page' }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({ 
          type: 'success', 
          text: data.alreadyExists 
            ? "You're already on the waitlist! We'll be in touch soon." 
            : "Thanks for joining! We'll notify you when we launch." 
        });
        if (!data.alreadyExists) {
          setEmail('');
        }
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setSubmitMessage({ type: 'error', text: 'Network error. Please check your connection.' });
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
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="size-8 text-purple-300" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Between Us
          </span>
        </div>
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
          <button onClick={() => onNavigate('support')} className="hover:text-purple-300 transition-colors">
            Support
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 mb-8">
            <Sparkles className="size-4 text-purple-300" />
            <span className="text-sm text-purple-200">Anonymous Mental Wellness Support</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
            Your Safe Space for Mental Wellness
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Share your thoughts anonymously, receive support from a caring community, 
            and track your wellness journey with beautiful daily check-ins.
          </p>

          {/* Email Signup Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                <ArrowRight className="size-5" />
              </button>
            </div>
            {submitMessage && (
              <div className={`mt-4 px-4 py-3 rounded-lg ${
                submitMessage.type === 'success' 
                  ? 'bg-green-500/20 border border-green-400/30 text-green-200' 
                  : 'bg-red-500/20 border border-red-400/30 text-red-200'
              }`}>
                {submitMessage.text}
              </div>
            )}
          </form>

          <p className="text-sm text-gray-400">
            Join thousands waiting for early access. No spam, ever. 🌟
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="size-8" />}
            title="100% Anonymous"
            description="Share your thoughts safely without revealing your identity. Your privacy is our top priority."
          />
          <FeatureCard
            icon={<Heart className="size-8" />}
            title="Daily Check-ins"
            description="Track your emotional wellness with beautiful interactive mood bubbles in 6 languages."
          />
          <FeatureCard
            icon={<MessageCircle className="size-8" />}
            title="Community Support"
            description="Receive caring responses from a supportive community who understands what you're going through."
          />
          <FeatureCard
            icon={<Globe className="size-8" />}
            title="Multi-Language"
            description="Express yourself in your preferred language: English, Spanish, French, German, Italian, or Portuguese."
          />
          <FeatureCard
            icon={<Sparkles className="size-8" />}
            title="Vibrant Design"
            description="Beautiful neon aesthetics with smooth animations, floating orbs, and calming gradients."
          />
          <FeatureCard
            icon={<Check className="size-8" />}
            title="Gamified Wellness"
            description="Earn points and rewards for maintaining your mental health journey and supporting others."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <StatCard number="10K+" label="Community Members" />
          <StatCard number="50K+" label="Supportive Messages" />
          <StatCard number="100K+" label="Daily Check-ins" />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-6 text-purple-300" />
                <span className="font-bold text-xl">Between Us</span>
              </div>
              <p className="text-sm text-gray-400">
                Your anonymous mental wellness companion.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => onNavigate('home')} className="hover:text-purple-300 transition-colors">Features</button></li>
                <li><button className="hover:text-purple-300 transition-colors">Pricing</button></li>
                <li><button className="hover:text-purple-300 transition-colors">Download</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => onNavigate('privacy')} className="hover:text-purple-300 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => onNavigate('terms')} className="hover:text-purple-300 transition-colors">Terms of Service</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => onNavigate('support')} className="hover:text-purple-300 transition-colors">Contact Us</button></li>
                <li><a href="mailto:support@betweenus.semprog.de" className="hover:text-purple-300 transition-colors">support@betweenus.semprog.de</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>&copy; 2025 Between Us. All rights reserved. Made with 💜 for mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all group">
      <div className="mb-4 text-purple-300 group-hover:text-purple-200 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30">
      <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-gray-300">{label}</div>
    </div>
  );
}