# Between Us Landing Pages

This folder contains the complete landing page system for Between Us, including all pages required for Android and iOS app store submissions.

## Pages Included

1. **Home Page** (`home.tsx`)
   - Hero section with email waitlist signup
   - Feature showcase
   - Statistics section
   - Footer with navigation

2. **Privacy Policy** (`privacy.tsx`)
   - Complete GDPR & CCPA compliant privacy policy
   - Data collection and usage disclosure
   - User rights and contact information
   - Required for Google Play Store & Apple App Store

3. **Terms of Service** (`terms.tsx`)
   - Comprehensive terms and conditions
   - Community guidelines
   - Subscription and payment terms
   - Required for Google Play Store & Apple App Store

4. **Support Page** (`support.tsx`)
   - Contact form with email submission
   - FAQ section
   - Crisis resources
   - Multiple contact methods

## Features

- ✅ **Fully Responsive**: Works on mobile, tablet, and desktop
- ✅ **Email Collection**: All email submissions saved to Supabase backend
- ✅ **Beautiful Design**: Matches Between Us neon aesthetic with animated gradients
- ✅ **Navigation**: Client-side routing with browser history support
- ✅ **Form Validation**: Email validation and error handling
- ✅ **App Store Compliant**: Meets all requirements for iOS and Android

## Domain Configuration

**Primary Domain**: betweenus.semprog.de

**Email Addresses**:
- General Support: support@betweenus.semprog.de
- Privacy Inquiries: privacy@betweenus.semprog.de
- Legal Matters: legal@betweenus.semprog.de

## Backend Integration

All email submissions are stored in Supabase using the `/make-server-6c9b0e48/waitlist` endpoint.

### Waitlist Data Structure
```typescript
{
  email: string,
  source: 'landing-page' | 'support-form-{type}',
  timestamp: ISO date string,
  createdAt: Unix timestamp,
  metadata?: {
    name?: string,
    subject?: string,
    message?: string,
    type?: string
  }
}
```

### Retrieving Waitlist Emails

To view all collected emails (for analytics/marketing):

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6c9b0e48/waitlist \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Response:
```json
{
  "emails": [...],
  "count": 123
}
```

## Deployment

### Option 1: Standalone Deployment

Deploy the landing pages separately from the main app:

1. Build the landing pages:
   ```bash
   npm run build
   ```

2. Deploy to your hosting provider (Vercel, Netlify, etc.)

3. Configure your domain to point to the deployment

### Option 2: Same Domain with Routing

Integrate with your main app routing:

```tsx
// In your main app router
import { LandingPages } from './landing-pages';

// Route configuration
{
  path: '/landing/*',
  element: <LandingPages />
}
```

### Option 3: Subdomain

Deploy to a subdomain like `landing.betweenus.semprog.de` or `www.betweenus.semprog.de`

## App Store Requirements

### Google Play Store
- ✅ Privacy Policy URL: `https://betweenus.semprog.de/landing/privacy`
- ✅ Terms of Service URL: `https://betweenus.semprog.de/landing/terms`
- ✅ Support Email: `support@betweenus.semprog.de`

### Apple App Store
- ✅ Privacy Policy URL: `https://betweenus.semprog.de/landing/privacy`
- ✅ Terms of Use URL: `https://betweenus.semprog.de/landing/terms`
- ✅ Support URL: `https://betweenus.semprog.de/landing/support`
- ✅ Marketing URL: `https://betweenus.semprog.de/landing`

## Customization

### Update Contact Emails

Search and replace in all files:
- `support@betweenus.semprog.de` → your support email
- `privacy@betweenus.semprog.de` → your privacy email
- `legal@betweenus.semprog.de` → your legal email

### Update Domain

Search and replace:
- `betweenus.semprog.de` → your domain

### Modify Content

All content is in the respective `.tsx` files. Update the text, sections, and FAQ items as needed.

## Testing

### Test Email Submission

1. Navigate to home page
2. Enter an email address
3. Submit the form
4. Check Supabase KV store for `waitlist:email@example.com` key

### Test Contact Form

1. Navigate to support page
2. Fill out and submit the contact form
3. Check Supabase for the email submission with source `support-form-{type}`

### Test Navigation

1. Click through all navigation links
2. Use browser back/forward buttons
3. Test on mobile, tablet, and desktop viewports

## Environment Variables

The landing pages use these environment variables:

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

These are typically set in your `.env` file or deployment platform.

## Maintenance

### Update Legal Documents

Privacy Policy and Terms of Service should be reviewed regularly:
- When adding new features
- When changing data collection practices
- When updating subscription/payment terms
- At least annually

Update the "Last updated" date at the top of each legal document.

### Monitor Email Submissions

Regularly export and process waitlist emails:

```bash
# Get all emails
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6c9b0e48/waitlist \
  -H "Authorization: Bearer YOUR_ANON_KEY" > waitlist.json
```

## Support

For questions or issues with the landing pages, contact the development team or refer to the main Between Us documentation.

---

**Made with 💜 for mental wellness**
