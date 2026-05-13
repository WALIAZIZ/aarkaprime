# MASTER BUILD PROMPT — EstateIQ AI Platform
## Copy this ENTIRE document and paste it into your AI coder (Cursor, DeepSeek, Kimi, Windsurf, etc.)

---

## PROJECT OVERVIEW

**Product Name:** EstateIQ — AI-Powered Real Estate Marketing Platform

**One-liner:** An AI-powered SaaS platform that replaces $930-3,880/month marketing agencies for Kenyan real estate companies — at 1/10th the cost.

**Target Market:** Kenyan real estate companies (developers, agents, property managers). Phase 2: Ethiopian real estate. Phase 3: Global.

**Revenue Model:** Three revenue engines on one website:
1. SaaS Tool — $99-499/month subscription for AI marketing dashboard
2. "Hire Us" Service — $500-3,000/month done-for-you marketing retainer
3. Content Channel — Sponsored content + inbound lead generation

**Tech Stack (NON-NEGOTIABLE — use exactly these):**
- Framework: Next.js 16 with App Router + TypeScript 5
- Styling: Tailwind CSS 4 + shadcn/ui (New York style) + Lucide icons
- Database: Prisma ORM with SQLite
- Auth: NextAuth.js v4 (credentials-based login — email/password)
- State: Zustand for client state, TanStack Query for server state
- AI: DeepSeek API (primary) — the AI model that generates all marketing content
- Icons: lucide-react
- Animations: framer-motion (subtle transitions)
- Date: date-fns

**IMPORTANT RULES:**
- ALL code must be TypeScript — no JavaScript files
- Use shadcn/ui components for EVERYTHING — do NOT build custom UI components from scratch
- Use 'use client' directive for all interactive components
- Use 'use server' directive for all server actions and API routes
- Database: Prisma with SQLite (file-based, zero setup)
- Auth: NextAuth.js v4 with credentials provider (email + password)
- The project has only ONE route visible to users: `/` (src/app/page.tsx). Use client-side routing with Zustand to switch between pages/views.
- The app should be a Single Page Application with these views: Landing, Login, Register, Dashboard, Properties, Add Property, Property Detail, Generate Content, Leads, Settings, Pricing
- Make it FULLY RESPONSIVE — mobile-first design
- Use Framer Motion for page transitions and subtle animations
- Color scheme: Professional dark emerald/green as primary (real estate vibes), with clean white backgrounds. NO indigo/blue colors.

---

## STEP 1: DATABASE SCHEMA

Create/edit `prisma/schema.prisma` with these models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  company       String?
  password      String   // hashed password
  role          String   @default("user") // user, admin
  plan          String   @default("free") // free, starter, pro, enterprise
  monthlyGenerationsUsed Int @default(0)
  monthlyGenerationsLimit Int @default(10)
  activeListings Int      @default(0)
  maxListings   Int      @default(3)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  properties    Property[]
  generatedContent GeneratedContent[]
  leads         Lead[]
}

model Property {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  propertyType String  @default("apartment") // apartment, house, land, commercial, townhouse
  location    String
  neighborhood String?
  price       Float    // price in KES
  bedrooms    Int      @default(0)
  bathrooms   Int      @default(0)
  areaSqm     Float?
  features    String   // comma-separated: pool, garden, gym, parking, etc.
  description String?  // original description
  status      String   @default("active") // active, sold, rented, paused
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  generatedContent GeneratedContent[]
  leads       Lead[]
}

model GeneratedContent {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  propertyId  String?
  property    Property? @relation(fields: [propertyId], references: [id])
  contentType String   // description, social_post, whatsapp_msg, email_campaign, ad_copy
  platform    String?  // facebook, instagram, twitter, whatsapp, email
  language    String   @default("english") // english, swahili
  title       String
  body        String   // the generated content
  tokensUsed  Int      @default(0)
  aiModel     String   @default("deepseek")
  createdAt   DateTime @default(now())
}

model Lead {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  propertyId  String?
  property    Property? @relation(fields: [propertyId], references: [id])
  name        String
  email       String?
  phone       String?
  message     String?
  source      String   @default("website") // website, whatsapp, facebook, referral
  status      String   @default("new") // new, contacted, viewing, negotiation, closed, lost
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

After creating the schema, run: `npx prisma db push` and `npx prisma generate`

---

## STEP 2: AUTHENTICATION

Create `src/lib/auth.ts` with NextAuth.js v4 credentials provider:

```typescript
// Use NextAuth v4 with CredentialsProvider
// - Email + password login
// - Password hashed with bcrypt (use 'bcryptjs' package)
// - JWT session strategy
// - Callbacks: include user id, email, name, role, plan in JWT and session
// - Store user in Prisma User model
```

Create API route at `src/app/api/auth/[...nextauth]/route.ts` — standard NextAuth handler.

Create `src/lib/auth-helpers.ts` with helper functions:
- `hashPassword(password: string): Promise<string>` — bcrypt hash
- `comparePassword(password: string, hash: string): Promise<boolean>` — bcrypt compare
- `getSession()` — get current session server-side
- `requireAuth()` — redirect to login if not authenticated

---

## STEP 3: AI ENGINE (DeepSeek API Integration)

Create `src/lib/ai.ts` — the core AI engine:

```typescript
// DeepSeek API integration
// Base URL: https://api.deepseek.com/v1 (or https://api.deepseek.com/beta)
// Model: deepseek-chat (or deepseek-reasoner for better quality)
// API Key: process.env.DEEPSEEK_API_KEY (ask user for this)
//
// Create these functions:

// 1. generatePropertyDescription(property: PropertyData): Promise<GeneratedResult>
//    - System prompt: "You are an elite real estate marketing copywriter specializing 
//      in the Kenyan property market. You understand Nairobi neighborhoods, Kenyan buyer 
//      psychology, and what makes properties sell in East Africa."
//    - Generate 3 versions: short (50 words), medium (150 words), long (300 words)
//    - Highlight: location advantages, investment potential, amenities, lifestyle
//    - Use metric system (sqm), KES currency
//    - Reference Nairobi landmarks/neighborhoods when applicable

// 2. generateSocialMediaPosts(property: PropertyData): Promise<GeneratedResult[]>
//    - Generate 5 posts: 2 Facebook, 2 Instagram, 1 Twitter/X
//    - Include relevant emojis and hashtags
//    - Kenyan real estate hashtags: #NairobiProperties #KenyaRealEstate #BuyKenya 
//      #PropertyKenya #NairobiHomes #InvestInKenya #RealEstateKE

// 3. generateWhatsAppMessages(property: PropertyData): Promise<GeneratedResult[]>
//    - Generate 3 messages: professional, casual, urgent
//    - Short and punchy (WhatsApp style)
//    - Include call-to-action
//    - Mention price or "Price on request" 

// 4. generateEmailCampaign(property: PropertyData): Promise<GeneratedResult[]>
//    - Generate 3 emails: new listing announcement, open house invite, price drop alert
//    - Subject line + body
//    - Professional tone with urgency

// 5. generateAdCopy(property: PropertyData): Promise<GeneratedResult[]>
//    - Generate 3 Facebook ad variations
//    - Headline (25 chars) + Primary text (125 chars) + Description (30 chars)
//    - Optimized for engagement and clicks

// PropertyData interface:
interface PropertyData {
  title: string;
  propertyType: string;
  location: string;
  neighborhood?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm?: number;
  features: string[];
  description?: string;
}

// GeneratedResult interface:
interface GeneratedResult {
  title: string;
  body: string;
  contentType: string;
  platform?: string;
  language: string;
}
```

Create API routes:
- `src/app/api/ai/generate/route.ts` — POST endpoint that accepts property data + content type, calls the AI engine, saves to database, returns generated content
- Track token usage per generation and update user's monthlyGenerationsUsed

---

## STEP 4: DATABASE HELPERS

Create `src/lib/db-helpers.ts` with CRUD functions for:
- Users: createUser, getUserById, updateUser, updateUserPlan
- Properties: createProperty, getPropertiesByUser, getPropertyById, updateProperty, deleteProperty
- GeneratedContent: createContent, getContentByProperty, getContentByUser, deleteContent
- Leads: createLead, getLeadsByUser, getLeadsByProperty, updateLeadStatus, deleteLead

All functions use Prisma client from `src/lib/db.ts`.

---

## STEP 5: APPLICATION STATE (Zustand)

Create `src/store/app-store.ts`:

```typescript
// Zustand store with these slices:
// 1. view: 'landing' | 'login' | 'register' | 'dashboard' | 'properties' | 
//          'add-property' | 'property-detail' | 'generate' | 'leads' | 'settings' | 'pricing'
// 2. selectedPropertyId: string | null
// 3. user: session user data or null
// 4. sidebarOpen: boolean (for mobile)
// 5. isGenerating: boolean (loading state for AI)
// 6. toasts: array of toast notifications
//
// Actions:
// - setView(view)
// - selectProperty(id)
// - setUser(user)
// - toggleSidebar()
// - setGenerating(bool)
// - addToast(toast)
// - removeToast(id)
```

---

## STEP 6: UI COMPONENTS TO BUILD

Build ALL of these components in `src/components/`:

### Layout Components:
1. `src/components/layout/app-layout.tsx` — Main layout with sidebar + top bar + content area
   - Sidebar with navigation: Dashboard, Properties, Generate Content, Leads, Settings
   - Top bar with: user name, plan badge, logout button
   - Mobile: sidebar becomes a sheet/drawer
   - Use shadcn Sidebar component

### Landing Page Components:
2. `src/components/landing/hero.tsx` — Full-width hero section
   - Big headline: "AI-Powered Marketing for Kenya's Real Estate"
   - Subheadline: "Generate professional property descriptions, social media posts, and marketing campaigns in seconds"
   - CTA buttons: "Start Free Trial" (goes to register) + "See How It Works" (scrolls down)
   - Animated property illustration or gradient background
   - Framer Motion entrance animation

3. `src/components/landing/how-it-works.tsx` — 3-step section
   - Step 1: "Add Your Property" icon: PlusCircle
   - Step 2: "AI Generates Marketing" icon: Sparkles
   - Step 3: "Post & Sell Faster" icon: TrendingUp
   - Clean card layout with icons and descriptions

4. `src/components/landing/features.tsx` — Feature grid
   - Feature cards with icons:
     * "AI Property Descriptions" — "Professional descriptions in 3 lengths"
     * "Social Media Posts" — "Facebook, Instagram, Twitter ready content"
     * "WhatsApp Marketing" — "Direct message templates for buyers"
     * "Email Campaigns" — "Full email sequences for your listings"
     * "Facebook Ad Copy" — "Optimized ad copy that converts"
     * "Lead Management" — "Track every inquiry in one place"

5. `src/components/landing/pricing-section.tsx` — Pricing cards
   - FREE: 10 generations/month, 3 active listings, basic features
   - STARTER ($99/mo): 50 generations/month, 10 listings, lead capture, email support
   - PROFESSIONAL ($299/mo): 200 generations/month, 50 listings, lead dashboard, email campaigns, ad copy, WhatsApp, Swahili mode
   - ENTERPRISE ($499/mo): Unlimited generations, unlimited listings, all features, WhatsApp chatbot, analytics, white-label, dedicated support
   - Highlight Professional as "Most Popular"
   - Show feature comparison table below cards

6. `src/components/landing/services-section.tsx` — "Hire Us" service section
   - Title: "Don't Want to Do It Yourself?"
   - 3 service tiers: Bronze ($500/mo), Silver ($1,500/mo), Gold ($3,000/mo)
   - Brief descriptions of what each includes
   - CTA: "Contact Us" button

7. `src/components/landing/testimonials.tsx` — Social proof section
   - 3 placeholder testimonials from "Kenyan real estate companies"
   - Avatar, name, company, quote, star rating

8. `src/components/landing/cta-section.tsx` — Bottom call-to-action
   - "Ready to Transform Your Property Marketing?"
   - "Start Free — No Credit Card Required"
   - Email input + "Get Started" button

9. `src/components/landing/footer.tsx` — Footer
   - Logo, links (Features, Pricing, About, Contact), copyright

### Auth Components:
10. `src/components/auth/login-form.tsx` — Login form
    - Email + password fields
    - "Sign In" button
    - "Don't have an account? Register" link
    - Use shadcn Card, Input, Button, Label components
    - Error handling with toast notifications

11. `src/components/auth/register-form.tsx` — Registration form
    - Name, Email, Company Name, Password, Confirm Password
    - "Create Account" button
    - "Already have an account? Sign In" link
    - Validate passwords match

### Dashboard Components:
12. `src/components/dashboard/stats-grid.tsx` — Dashboard stats
    - 4 stat cards: Total Properties, Content Generated, Active Leads, Monthly Usage
    - Use shadcn Card with icons from lucide-react

13. `src/components/dashboard/recent-activity.tsx` — Recent activity list
    - Last 10 generated content items
    - Show: content type icon, property title, date, platform badge
    - "View All" link to generated content page

### Property Components:
14. `src/components/properties/property-list.tsx` — Property listing
    - Table/grid view of all properties
    - Columns: Title, Type, Location, Price (formatted KES), Status badge, Actions
    - Actions: View, Generate Content, Edit, Delete
    - Search/filter by: type, status, location
    - Use shadcn Table component
    - Add "New Property" button (top right)

15. `src/components/properties/add-property-form.tsx` — Add/Edit property form
    - Fields: Title, Property Type (select), Location (text input), Neighborhood (optional), Price (number in KES), Bedrooms (number), Bathrooms (number), Area in sqm (number), Features (multi-select checkboxes: swimming pool, garden, gym, parking, security, balcony, ensuite, furnished, servant quarter, backup generator, borehole), Description (textarea - optional original description)
    - Save button — creates property in database
    - Use shadcn Form components with react-hook-form + zod validation
    - Property types: Apartment, House, Land, Commercial, Townhouse, Villa, Studio, Duplex

16. `src/components/properties/property-detail.tsx` — Property detail view
    - Show all property information
    - Tabs: Details, Generated Content, Leads
    - "Generate Content" button (prominent)
    - List of all generated content for this property with copy button
    - List of all leads for this property

### AI Generation Components:
17. `src/components/ai/generate-panel.tsx` — Main AI generation interface
    - Select property from dropdown (or "Use property from detail page")
    - Select content type: Description, Social Media Posts, WhatsApp Messages, Email Campaign, Ad Copy
    - Select language: English, Swahili
    - "Generate" button with loading animation
    - Results display: show generated content in cards
    - Each result has: title, content body, platform badge, copy-to-clipboard button, save button
    - Option to regenerate (get different results)
    - Progress indicator showing monthly usage: "47/50 generations used"

18. `src/components/ai/content-card.tsx` — Individual content result card
    - Show content title, platform badge, language badge
    - Content body in a styled box
    - Copy to clipboard button (with "Copied!" feedback)
    - Save to database button
    - Regenerate button
    - Date generated

### Lead Components:
19. `src/components/leads/leads-table.tsx` — Leads management
    - Table: Name, Email, Phone, Property, Source, Status, Date, Actions
    - Status badges with colors: new (blue), contacted (yellow), viewing (purple), negotiation (orange), closed (green), lost (red)
    - Actions: Update status, Delete
    - Filter by status, property, date range
    - Lead count per status

### Settings Components:
20. `src/components/settings/settings-page.tsx` — User settings
    - Profile section: Name, Email, Company (editable)
    - Plan section: Current plan badge, usage stats, upgrade button
    - Danger zone: Delete account (with confirmation dialog)

---

## STEP 7: MAIN PAGE (src/app/page.tsx)

This is the ONLY route. Build a client-side SPA router using Zustand:

```typescript
'use client'

// Import all components
// Use Zustand store to determine which view to show
// Main render logic:
//
// if (!user && view === 'landing') → render LandingPage
// if (!user && view === 'login') → render LoginPage  
// if (!user && view === 'register') → render RegisterPage
// if (!user && view === 'pricing') → render PricingPage (scrollable from landing)
// if (user) → render AppLayout with:
//   - if view === 'dashboard' → render DashboardPage
//   - if view === 'properties' → render PropertiesPage
//   - if view === 'add-property' → render AddPropertyPage
//   - if view === 'property-detail' → render PropertyDetailPage (with selectedPropertyId)
//   - if view === 'generate' → render GeneratePage
//   - if view === 'leads' → render LeadsPage
//   - if view === 'settings' → render SettingsPage
//   - default → render DashboardPage
//
// Use Framer Motion AnimatePresence for smooth view transitions
// Check session on mount using NextAuth getSession()
// Redirect unauthenticated users trying to access protected views to login
```

---

## STEP 8: API ROUTES

Create these API routes in `src/app/api/`:

1. `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler
2. `src/app/api/ai/generate/route.ts` — POST: generate AI content
   - Body: { propertyId, contentType, language }
   - Validate user is authenticated
   - Check user has generation quota remaining
   - Fetch property from database
   - Call appropriate AI function from src/lib/ai.ts
   - Save generated content to database
   - Increment user's monthlyGenerationsUsed
   - Return generated content
3. `src/app/api/properties/route.ts` — GET: list user's properties, POST: create property
4. `src/app/api/properties/[id]/route.ts` — GET: single property, PUT: update, DELETE: delete
5. `src/app/api/content/route.ts` — GET: list user's generated content
6. `src/app/api/content/[id]/route.ts` — DELETE: delete content
7. `src/app/api/leads/route.ts` — GET: list user's leads, POST: create lead
8. `src/app/api/leads/[id]/route.ts` — PUT: update lead status, DELETE: delete lead
9. `src/app/api/user/route.ts` — GET: current user info, PUT: update profile

All API routes must:
- Check authentication
- Return proper error messages
- Use try/catch error handling
- Return JSON responses

---

## STEP 9: STYLING & DESIGN

### Color Theme (custom CSS variables in globals.css):
```css
/* Add these to the existing :root block */
--primary: oklch(0.45 0.15 160);        /* Dark emerald green */
--primary-foreground: oklch(0.98 0 0);   /* White on primary */
--accent: oklch(0.92 0.08 160);         /* Light emerald */
--accent-foreground: oklch(0.25 0.08 160);
```

### Design Principles:
- Clean, professional, trustworthy (real estate audience)
- White/light background for content areas
- Dark emerald green (#047857 equivalent) for primary actions
- Generous whitespace
- Cards with subtle shadows
- Smooth Framer Motion transitions (fade + slide)
- Mobile-first: sidebar collapses to hamburger menu on mobile
- All interactive elements have hover states
- Loading spinners for all async operations
- Toast notifications for success/error feedback

### Typography:
- Headings: font-semibold or font-bold
- Body: font-normal
- Use consistent spacing (p-4, p-6, gap-4, gap-6)
- Property prices formatted as "KES 5,500,000" (with commas)

---

## STEP 10: PLACEHOLDER DATA

For the landing page, create these placeholder testimonials:

```
1. "EstateIQ cut our content creation time from 3 hours to 30 seconds. 
   Our Facebook engagement increased by 340% in the first month."
   — James Mwangi, CEO, Mwangi Homes Nairobi

2. "We were paying an agency KES 120,000/month for content that was hit or miss. 
   Now we generate better content ourselves for a fraction of the cost."
   — Sarah Ochieng, Marketing Director, Parklands Realty

3. "The WhatsApp marketing messages alone have brought us 15 new leads this month. 
   This tool pays for itself 10x over."
   — David Kariuki, Founder, Kariuki & Associates Real Estate
```

---

## STEP 11: WHAT TO ASK THE USER FOR

When you need these, ASK the user and WAIT for their response:

1. **DeepSeek API Key** — Go to https://platform.deepseek.com/api_keys and create an API key. This is the AI engine. Without it, content generation won't work. Store it in .env.local as DEEPSEEK_API_KEY=sk-xxxxx

2. **NEXTAUTH_SECRET** — Generate a random string for JWT encryption. Run `openssl rand -base64 32` in terminal. Store in .env.local as NEXTAUTH_SECRET=xxxxx

3. **NEXTAUTH_URL** — Set to http://localhost:3000 for development. Store in .env.local as NEXTAUTH_URL=http://localhost:3000

**DO NOT ask for anything else. Solve everything else yourself.**

---

## STEP 12: BUILD ORDER

Follow this EXACT order. Do not skip steps:

1. First: Edit prisma/schema.prisma with the full schema, then run `npx prisma db push` and `npx prisma generate`
2. Second: Install any missing packages: `npm install bcryptjs next-auth @types/bcryptjs`
3. Third: Create src/lib/auth.ts and src/lib/auth-helpers.ts
4. Fourth: Create src/lib/ai.ts (the DeepSeek integration)
5. Fifth: Create src/lib/db-helpers.ts
6. Sixth: Create src/store/app-store.ts
7. Seventh: Create ALL UI components (layout, landing, auth, dashboard, properties, AI, leads, settings)
8. Eighth: Create ALL API routes
9. Ninth: Build the main src/app/page.tsx with client-side routing
10. Tenth: Update src/app/layout.tsx with proper metadata (title: "EstateIQ — AI Real Estate Marketing")
11. Eleventh: Update src/app/globals.css with the emerald green color theme
12. Twelfth: Test everything end-to-end and fix any bugs
13. Finally: Run `npm run lint` and fix any errors

---

## STEP 13: ENVIRONMENT VARIABLES

Create a `.env.local` file in the project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="[GENERATED_RANDOM_STRING]"
NEXTAUTH_URL="http://localhost:3000"
DEEPSEEK_API_KEY="[USER_PROVIDED_API_KEY]"
```

---

## FINAL NOTES

- The landing page must look PROFESSIONAL and PREMIUM — this is a B2B SaaS selling to companies that pay $500-3,000/month
- The AI generation feature is the HERO feature — make it feel magical. Show a loading animation with "AI is crafting your content..." while generating
- Copy-to-clipboard must work flawlessly — this is the most-used feature
- The dashboard should show meaningful stats that make the user feel productive
- Mobile responsiveness is CRITICAL — most Kenyan real estate agents browse on their phones
- Keep the code clean, well-organized, and well-commented
- Use proper TypeScript types everywhere — no `any` types
- Handle all edge cases: empty states, loading states, error states, network failures

**Build this COMPLETE platform. Do not leave any TODOs or placeholder components. Every feature must be fully functional. The user should be able to: register → add a property → generate AI marketing content → copy it → manage leads.**

GO BUILD.
