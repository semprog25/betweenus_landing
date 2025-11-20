import React, { useState, useEffect } from 'react';
import { HomePage } from './home';
import { PrivacyPage } from './privacy';
import { TermsPage } from './terms';
import { SupportPage } from './support';

type Page = 'home' | 'privacy' | 'terms' | 'support';

export function LandingPages() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Handle browser back/forward buttons and initial route
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('privacy')) {
        setCurrentPage('privacy');
      } else if (path.includes('terms')) {
        setCurrentPage('terms');
      } else if (path.includes('support')) {
        setCurrentPage('support');
      } else {
        setCurrentPage('home');
      }
    };

    // Set initial page based on URL
    handlePopState();

    // Listen for browser navigation
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    
    // Update URL without page reload
    const path = page === 'home' ? '/landing' : `/landing/${page}`;
    window.history.pushState({ page }, '', path);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render the appropriate page
  switch (currentPage) {
    case 'privacy':
      return <PrivacyPage onNavigate={navigate} />;
    case 'terms':
      return <TermsPage onNavigate={navigate} />;
    case 'support':
      return <SupportPage onNavigate={navigate} />;
    default:
      return <HomePage onNavigate={navigate} />;
  }
}
