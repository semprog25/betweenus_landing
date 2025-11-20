# 🚀 Landing Pages Deployment Checklist

Use this checklist to deploy your Between Us landing pages and prepare for app store submissions.

## ✅ Phase 1: Testing (Do This First!)

- [ ] **Test Home Page**
  - [ ] Navigate to home page
  - [ ] Enter email and submit waitlist form
  - [ ] Verify success message appears
  - [ ] Test with duplicate email (should show "already on waitlist")
  - [ ] Test with invalid email format (should show error)

- [ ] **Test Privacy Policy Page**
  - [ ] Navigate to privacy page
  - [ ] Scroll through entire document
  - [ ] Click all internal navigation links
  - [ ] Verify email links work (mailto:)

- [ ] **Test Terms of Service Page**
  - [ ] Navigate to terms page  
  - [ ] Read through all sections
  - [ ] Click navigation links
  - [ ] Verify legal email links work

- [ ] **Test Support Page**
  - [ ] Navigate to support page
  - [ ] Fill out contact form with all fields
  - [ ] Submit form
  - [ ] Verify success message
  - [ ] Click all FAQ items to expand/collapse
  - [ ] Test all email links

- [ ] **Test Navigation**
  - [ ] Click between all pages using nav menu
  - [ ] Use browser back button (should work!)
  - [ ] Use browser forward button (should work!)
  - [ ] Test footer links
  - [ ] Direct URL access to each page

- [ ] **Test Responsive Design**
  - [ ] View on mobile phone (< 640px)
  - [ ] View on tablet (768px - 1024px)
  - [ ] View on desktop (> 1024px)
  - [ ] Test form inputs on mobile
  - [ ] Test navigation menu on mobile

- [ ] **Test Data Storage**
  - [ ] Submit waitlist email
  - [ ] Check Supabase KV store for `waitlist:email@example.com`
  - [ ] Submit contact form
  - [ ] Verify data saved with correct source tag
  - [ ] Try to retrieve all emails via API endpoint

## ✅ Phase 2: Customization (Optional)

- [ ] **Update Content**
  - [ ] Review and update home page copy
  - [ ] Modify feature descriptions if needed
  - [ ] Update statistics numbers
  - [ ] Customize FAQ answers
  - [ ] Adjust privacy policy if needed
  - [ ] Review terms of service

- [ ] **Update Contact Info**
  - [ ] Verify all email addresses are correct
  - [ ] Test that email addresses work
  - [ ] Update any placeholder text

- [ ] **Branding**
  - [ ] Ensure logo/branding matches your app
  - [ ] Verify color scheme matches Between Us
  - [ ] Check that gradients look good

## ✅ Phase 3: Domain & Hosting Setup

- [ ] **Configure Domain**
  - [ ] Point betweenus.semprog.de to hosting
  - [ ] Set up SSL certificate (HTTPS)
  - [ ] Configure DNS records
  - [ ] Test domain access
  - [ ] Set up www redirect if needed

- [ ] **Set Up Email Addresses**
  - [ ] Create support@betweenus.semprog.de
  - [ ] Create privacy@betweenus.semprog.de
  - [ ] Create legal@betweenus.semprog.de
  - [ ] Set up email forwarding
  - [ ] Send test emails to verify working
  - [ ] Set up auto-reply (optional)

- [ ] **Deploy Landing Pages**
  - [ ] Choose hosting provider (Vercel, Netlify, etc.)
  - [ ] Deploy landing pages code
  - [ ] Configure build settings
  - [ ] Set environment variables
  - [ ] Test deployed site
  - [ ] Verify all pages accessible

## ✅ Phase 4: Final Verification

- [ ] **Test Live Site**
  - [ ] Visit https://betweenus.semprog.de/landing
  - [ ] Test all page navigation
  - [ ] Submit test waitlist email
  - [ ] Submit test contact form
  - [ ] Verify data reaching Supabase
  - [ ] Test on multiple devices
  - [ ] Test on multiple browsers (Chrome, Safari, Firefox)

- [ ] **Performance Check**
  - [ ] Page loads quickly (< 3 seconds)
  - [ ] Images load properly
  - [ ] Animations are smooth
  - [ ] No console errors
  - [ ] Mobile performance is good

- [ ] **SEO & Meta Tags**
  - [ ] Page titles are descriptive
  - [ ] Meta descriptions set
  - [ ] Open Graph tags configured
  - [ ] Favicon set
  - [ ] Sitemap created (optional)

## ✅ Phase 5: App Store Preparation

### Google Play Store
- [ ] **Required Information**
  - [ ] Privacy Policy URL: `https://betweenus.semprog.de/landing/privacy`
  - [ ] Terms of Service URL: `https://betweenus.semprog.de/landing/terms`
  - [ ] Support Email: `support@betweenus.semprog.de`
  - [ ] App Screenshots (phone + tablet)
  - [ ] Feature Graphic (1024x500)
  - [ ] App Icon (512x512)

- [ ] **App Listing**
  - [ ] Write short description (80 chars)
  - [ ] Write full description (4000 chars)
  - [ ] Select app category
  - [ ] Set content rating
  - [ ] Add app tags/keywords

### Apple App Store
- [ ] **Required Information**
  - [ ] Privacy Policy URL: `https://betweenus.semprog.de/landing/privacy`
  - [ ] Terms of Use URL: `https://betweenus.semprog.de/landing/terms`
  - [ ] Support URL: `https://betweenus.semprog.de/landing/support`
  - [ ] Marketing URL: `https://betweenus.semprog.de/landing`
  - [ ] App Screenshots (6.5", 5.5", iPad)
  - [ ] App Preview Videos (optional)
  - [ ] App Icon (1024x1024)

- [ ] **App Listing**
  - [ ] Write app description
  - [ ] Add keywords (100 chars)
  - [ ] Select category
  - [ ] Set age rating
  - [ ] Add what's new text

## ✅ Phase 6: Submit to App Stores

### Google Play Store Submission
- [ ] Create Google Play Console account
- [ ] Create new app listing
- [ ] Fill in app details
- [ ] Upload APK/AAB file
- [ ] Add store listing assets
- [ ] Set pricing (Free)
- [ ] Configure distribution countries
- [ ] Submit for review
- [ ] Monitor review status

### Apple App Store Submission
- [ ] Create Apple Developer account
- [ ] Create App Store Connect listing
- [ ] Fill in app information
- [ ] Upload build via Xcode/Transporter
- [ ] Add store listing assets
- [ ] Set pricing (Free)
- [ ] Configure availability
- [ ] Submit for review
- [ ] Respond to any review questions

## ✅ Phase 7: Post-Launch

- [ ] **Monitor Email Submissions**
  - [ ] Check Supabase regularly for new emails
  - [ ] Export waitlist for marketing
  - [ ] Respond to support inquiries
  - [ ] Track submission sources

- [ ] **Analytics** (Optional)
  - [ ] Set up Google Analytics
  - [ ] Track page views
  - [ ] Monitor conversion rates
  - [ ] Track email signup rate

- [ ] **Maintenance**
  - [ ] Review and respond to app store reviews
  - [ ] Update privacy policy as needed
  - [ ] Update terms of service as needed
  - [ ] Keep FAQ updated
  - [ ] Monitor for bugs/issues

- [ ] **Marketing**
  - [ ] Share landing page URL on social media
  - [ ] Email waitlist with launch announcement
  - [ ] Create launch marketing materials
  - [ ] Reach out to press/bloggers

## 📊 Important URLs

Once deployed, verify these URLs work:

- **Home**: https://betweenus.semprog.de/landing
- **Privacy**: https://betweenus.semprog.de/landing/privacy  
- **Terms**: https://betweenus.semprog.de/landing/terms
- **Support**: https://betweenus.semprog.de/landing/support

## 🆘 Troubleshooting

### Email form not working
- Check Supabase connection
- Verify API endpoint is accessible
- Check browser console for errors
- Test with different email addresses

### Pages not loading
- Verify deployment was successful
- Check DNS configuration
- Ensure SSL certificate is valid
- Test in incognito/private browser

### Emails not saving
- Check Supabase dashboard
- Verify KV store is accessible
- Check API authorization
- Review server logs

### Navigation not working
- Clear browser cache
- Check JavaScript console
- Verify router configuration
- Test in different browser

## 📞 Support

If you encounter issues:
1. Check the `/landing-pages/README.md` file
2. Review `/LANDING_PAGES_SETUP.md`
3. Check Supabase logs
4. Contact development team

---

## ✨ Quick Start Command

```bash
# Test landing pages locally
npm run dev

# Access landing pages at:
# http://localhost:5173/landing
```

---

**Status Tracking**: Mark items complete as you go! Once all checkboxes are checked ✅, you're ready to launch! 🚀

Good luck with your app launch! 💜
