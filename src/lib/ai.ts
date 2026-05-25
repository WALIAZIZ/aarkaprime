import {
  getCountryConfig,
  formatPrice,
  getCountryHashtags,
} from "@/lib/countries";

export interface PropertyData {
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

export interface GeneratedResult {
  title: string;
  body: string;
  contentType: string;
  platform?: string;
  language: string;
}

export interface AIUsage {
  model: string;
  provider: string;
  tokensUsed?: number;
}

/**
 * Build a system prompt tailored to the given country's real estate market.
 */
function getSystemPrompt(countryCode: string): string {
  const country = getCountryConfig(countryCode);
  const hashtags = getCountryHashtags(countryCode).join(" ");

  if (country) {
    const cityList = country.cities.map((c) => c.name).join(", ");
    const langList = country.languages.map((l) => l.name).join(", ");
    const countryNote = `You specialize in the ${country.name} property market. Use ${country.currency} (${country.currencyCode}) for all prices. Reference ${cityList} neighborhoods and landmarks when applicable. Use metric system (sqm). Key languages spoken: ${langList}.`;

    return `You are an elite real estate marketing copywriter specializing in the East African property market. ${countryNote} Be professional yet persuasive.

CRITICAL FORMATTING RULES:
- Always separate multiple outputs with the exact delimiter specified (e.g., "===VERSION===", "===POST===", etc.)
- For property descriptions: output 3 versions separated by "===VERSION==="
- For social posts: output 5 posts separated by "===POST==="
- For WhatsApp: output 3 messages separated by "===MSG==="
- For emails: output 3 emails separated by "===EMAIL==="
- For ad copy: output 3 ads separated by "===AD==="
- Each output must start with the label (VERSION, POST, TONE, TYPE, VARIATION) followed by a colon and the category name
- Do NOT add extra headers or markdown formatting outside the specified format
- Include relevant ${country.name} real estate hashtags for social posts: ${hashtags}`;
  }

  // Fallback when no country is matched
  return `You are an elite real estate marketing copywriter specializing in the East African property market. Use metric system (sqm). Be professional yet persuasive.

CRITICAL FORMATTING RULES:
- Always separate multiple outputs with the exact delimiter specified (e.g., "===VERSION===", "===POST===", etc.)
- For property descriptions: output 3 versions separated by "===VERSION==="
- For social posts: output 5 posts separated by "===POST==="
- For WhatsApp: output 3 messages separated by "===MSG==="
- For emails: output 3 emails separated by "===EMAIL==="
- For ad copy: output 3 ads separated by "===AD==="
- Each output must start with the label (VERSION, POST, TONE, TYPE, VARIATION) followed by a colon and the category name
- Do NOT add extra headers or markdown formatting outside the specified format
- Include relevant East African real estate hashtags for social posts: #RealEstate #PropertyForSale #EastAfrica #InvestInRealEstate`;
}

/**
 * Build country context string for AI prompts
 */
export function buildCountryContext(countryCode: string): string {
  const country = getCountryConfig(countryCode);
  if (!country) return "East African region.";
  const cityList = country.cities
    .map((c) => `${c.name} (${c.neighborhoods.slice(0, 5).join(", ")})`)
    .join("; ");
  const langList = country.languages.map((l) => l.name).join(", ");
  return `${country.name} — Currency: ${country.currency} (${country.currencyCode}, ${country.currencySymbol}). Major cities: ${cityList}. Languages: ${langList}. Market trends: Properties in ${country.cities[0]?.name || country.name} show strong demand with steady appreciation. Use metric system.`;
}

function buildPropertyContext(data: PropertyData, countryCode: string): string {
  const priceFormatted = formatPrice(countryCode, data.price);
  return `
Property: ${data.title}
Type: ${data.propertyType}
Location: ${data.location}${data.neighborhood ? `, ${data.neighborhood}` : ""}
Price: ${priceFormatted}
Bedrooms: ${data.bedrooms}
Bathrooms: ${data.bathrooms}
${data.areaSqm ? `Area: ${data.areaSqm} sqm` : ""}
Features: ${data.features.join(", ")}
${data.description ? `Original Description: ${data.description}` : ""}
`.trim();
}

async function callDeepSeek(
  prompt: string,
  countryCode: string = "kenya"
): Promise<string> {
  const systemPrompt = getSystemPrompt(countryCode);
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === "sk-placeholder-key") {
    console.warn("[AI] No DeepSeek API key found, using fallback generator");
    return generateFallbackContent(prompt, countryCode);
  }

  const controller = new AbortController();
  // 25s timeout — safe for Vercel serverless (max 60s on Pro, 10s on Hobby)
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(`[AI] DeepSeek API error ${response.status}: ${errorBody}`);
      // Fall back to built-in content instead of throwing
      return generateFallbackContent(prompt, countryCode);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("[AI] DeepSeek returned empty response, using fallback");
      return generateFallbackContent(prompt, countryCode);
    }

    console.log("[AI] DeepSeek generation successful");
    return content;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[AI] DeepSeek request timed out, using fallback");
      return generateFallbackContent(prompt, countryCode);
    }
    // Any other error — fall back instead of throwing
    console.error("[AI] DeepSeek error, using fallback:", error);
    return generateFallbackContent(prompt, countryCode);
  }
}

function generateFallbackContent(prompt: string, countryCode: string = "kenya"): string {
  const country = getCountryConfig(countryCode);
  const countryName = country?.name || "Kenya";
  const mainCity = country?.cities[0]?.name || "Nairobi";
  const currencySymbol = country?.currencySymbol || "KSh";
  const hashtags = getCountryHashtags(countryCode).slice(0, 4).join(" ");
  const priceStr = country ? `${currencySymbol} [Price]` : "KES [Price]";

  if (prompt.includes("property description")) {
    return `VERSION: Short
${prompt.includes("apartment") ? "Stunning" : "Beautiful"} ${prompt.includes("apartment") ? "apartment" : "property"} in a prime ${mainCity} location. Modern finishes, spacious rooms, excellent investment opportunity in ${countryName}.

===VERSION===
VERSION: Medium
Welcome to this exceptional property that embodies the best of ${countryName} living. Situated in a prime location, this ${prompt.includes("apartment") ? "apartment" : "home"} offers an unparalleled lifestyle opportunity for discerning buyers and investors alike.

The property features thoughtfully designed spaces that maximize natural light and airflow, creating an atmosphere of warmth and sophistication. Every detail has been carefully considered, from the premium finishes to the intelligent layout that seamlessly blends indoor and outdoor living.

Located in one of ${mainCity}'s most sought-after neighborhoods, you'll enjoy convenient access to shopping centers, international schools, healthcare facilities, and major transport routes. The area has seen consistent property value appreciation, making this not just a home but a sound investment.

Key highlights include spacious living areas, modern kitchen facilities, well-appointed bedrooms with en-suite bathrooms, and dedicated parking. The property also benefits from 24-hour security, reliable water supply, and backup power.

===VERSION===
VERSION: Long
Welcome to this stunning property that represents the pinnacle of modern ${countryName} real estate. Whether you're a first-time buyer, growing family, or savvy investor, this exceptional ${prompt.includes("apartment") ? "apartment" : "property"} in one of ${mainCity}'s most dynamic neighborhoods offers something truly special.

ARCHITECTURE & DESIGN
The property features contemporary architecture with clean lines, expansive windows, and an open-plan layout that creates a seamless flow between living spaces. High ceilings and premium flooring add a touch of elegance throughout, while the thoughtfully designed rooms maximize both comfort and functionality.

LOCATION & ACCESSIBILITY
Strategically located with easy access to ${mainCity}'s major areas and highways. The neighborhood is well-established with excellent infrastructure including tarmacked roads, street lighting, and reliable utilities. Within walking distance to shopping malls, restaurants, gyms, and international schools.

INVESTMENT POTENTIAL
Properties in ${countryName} have shown consistent annual appreciation, making this an excellent long-term investment. The strong rental demand means you can also generate attractive returns if you choose to lease the property.

AMENITIES & FEATURES
Spacious bedrooms with built-in wardrobes, modern bathrooms with high-quality fixtures, chef's kitchen with ample storage, dedicated laundry area, private balcony with views, secure parking, 24/7 security with CCTV, and reliable utilities.

Don't miss this opportunity to own in one of ${mainCity}'s premier addresses. Contact us today to schedule a private viewing.`;
  }

  if (prompt.includes("social media") || prompt.includes("Facebook") || prompt.includes("Instagram")) {
    return `POST: Facebook — Engagement
🏠 STUNNING PROPERTY ALERT! 🏠

Looking for your dream home in ${mainCity}? This beautiful property ticks ALL the boxes! ✅

✨ Prime Location in a sought-after neighborhood
✨ Spacious Living Areas perfect for family life
✨ Modern Finishes throughout
✨ Secure Compound with 24/7 security
✨ Investment-Ready with strong ROI potential
✨ Reliable utilities included

📍 Located near major amenities — schools, hospitals, malls
💰 Competitive pricing — won't last long!
🔑 Ready to move in — no waiting

DM us for more details or call to schedule a viewing TODAY!

${hashtags}

===POST===
POST: Facebook — Information
📊 PROPERTY DETAILS 📊

Type: Premium Residential
Location: ${mainCity} (Prime Neighborhood)
Price: Competitive Market Rate
Status: Available Now

What makes this property special:
• Modern architecture with quality finishes
• Proximity to international schools and hospitals
• Easy access to major highways
• Growing neighborhood with excellent infrastructure
• Strong rental yields for investors

Whether you're buying your first home or adding to your portfolio, this property delivers exceptional value.

📩 Send us a message for the full property brief including floor plans and virtual tour link.

${hashtags}

===POST===
POST: Instagram — Lifestyle
✨ Living your best life starts with the right home ✨

Imagine waking up to ${mainCity}'s stunning skyline from your private balcony. Morning coffee on the terrace, kids playing in the garden, and everything you need just minutes away.

This is what modern ${countryName} living looks like. ${country?.flag || ""}

🏠 Premium property in prime location
🌿 Lush green surroundings
🏃‍♂️ Nearby parks and recreational facilities
🛍️ Shopping and dining at your doorstep
🚗 Easy highway access

Your dream lifestyle is within reach. DM us to arrange a viewing.

${hashtags}

===POST===
POST: Instagram — Story Selling
Looking for your next smart investment? 📈

This ${mainCity} property is priced to sell and located in one of the fastest-appreciating neighborhoods in the city.

✅ Strong annual appreciation
✅ High rental demand
✅ Modern finishes
✅ Ready to move in

Swipe up or DM for details! 📩

${hashtags}

===POST===
POST: Twitter/X
🏠 Prime ${mainCity} property — Modern finishes, 3BR, secure compound. Excellent investment with strong appreciation. Priced to sell! DM for details. ${hashtags}`;
  }

  if (prompt.includes("WhatsApp")) {
    return `TONE: Professional
Good day,

I hope this message finds you well. I'm reaching out to share details about an exceptional property listing that has just become available in ${mainCity}.

The property offers:
• Spacious rooms with modern finishes
• Secure location with 24/7 security
• Proximity to key amenities
• Strong investment potential

This is a rare opportunity in a prime neighborhood. I would be delighted to arrange a private viewing at your convenience.

Please feel free to reply to this message or call me directly to discuss further.

Kind regards

===MSG===
TONE: Casual
Hey! 👋

Just wanted to share this amazing property I came across — it's exactly what you've been looking for! 🏠

✨ Beautiful location in ${mainCity}
✨ Great price for the area
✨ Modern and well-maintained
✨ Won't stay on the market long!

Would you like me to send photos or schedule a quick viewing? Just reply whenever you're free! 😊

Cheers! 🙏

===MSG===
TONE: Urgent
🔥 HOT LISTING — PRICE ALERT! 🔥

This property just hit the market and it's already getting attention! At this price, it WILL sell fast.

🏠 Prime ${mainCity} location
💰 Below market value
⏰ Viewing slots filling up this week
🔑 Move-in ready

Don't wait — properties like this are gone in days, not weeks.

Reply NOW to book your viewing slot before it's too late! 🚀`;
  }

  if (prompt.includes("email") || prompt.includes("campaign")) {
    return `TYPE: New Listing
SUBJECT: 🏠 Exclusive New Listing — Your Dream Home Awaits in ${mainCity}!

Dear Valued Client,

We're thrilled to present an exceptional new listing that has just hit the market. This property represents one of the finest opportunities currently available in ${mainCity}'s competitive real estate market.

PROPERTY HIGHLIGHTS:
• Prime location in a sought-after ${mainCity} neighborhood
• Excellent investment potential with strong projected annual returns
• Modern amenities and premium finishes throughout
• Spacious living areas designed for ${countryName} family life
• Secure compound with 24/7 CCTV and controlled access
• Reliable utilities and backup power
• Dedicated parking for multiple vehicles

THE NEIGHBORHOOD:
Located in one of ${mainCity}'s fastest-growing areas, you'll enjoy easy access to international schools, world-class healthcare facilities, premium shopping malls, and major transport routes.

PRICING & AVAILABILITY:
This property is competitively priced and available for immediate viewing. Properties in this location typically sell quickly, so we encourage early action.

We'd love to show you around. Simply reply to this email or call us to schedule a private viewing at your convenience.

Warm regards,
The EstateIQ Team

===EMAIL===
TYPE: Open House
SUBJECT: 📅 You're Invited — Exclusive Open House This Weekend!

Dear [Client Name],

You're exclusively invited to our upcoming Open House event this coming weekend. This is a rare opportunity to view one of ${mainCity}'s most desirable properties before it goes to the broader market.

EVENT DETAILS:
📅 Date: This Saturday
🕐 Time: 10:00 AM — 4:00 PM
📍 Location: [Property Address/Neighborhood]
🚗 Free parking available on-site

WHAT TO EXPECT:
• Guided tour of the entire property
• Detailed property information pack
• Opportunity to speak with our property consultants
• Light refreshments provided
• Special open-house-only pricing available

This property has generated significant interest, and we wanted to give our valued clients the first opportunity to view.

RSVP: Simply reply to this email to confirm your attendance. We'll send you the exact address and a map link.

We look forward to welcoming you!

Best regards,
The EstateIQ Team

===EMAIL===
TYPE: Price Drop
SUBJECT: ⚡ PRICE REDUCED — Incredible Value in Prime ${mainCity} Location!

Dear Valued Client,

Great news! One of our premium listings has just undergone a significant price reduction, creating an exceptional buying opportunity.

ORIGINAL PRICE: ${priceStr}
NEW PRICE: ${priceStr}
💰 SAVINGS: ${priceStr}

THE PROPERTY:
Located in one of ${mainCity}'s most established and desirable neighborhoods, this property offers everything a modern homeowner or investor could want.

KEY SELLING POINTS:
• Spacious rooms with high-quality finishes
• Mature garden and outdoor entertainment area
• Secure compound in a gated community
• Walking distance to amenities
• Already seeing strong appreciation in the area

WHY THE PRICE DROP?
The owner is relocating and has instructed us to sell quickly. This urgency translates directly into savings for you — the buyer.

IMPORTANT: Properties in this neighborhood at this price point are extremely rare. We expect strong interest and anticipate a quick sale.

To arrange a viewing or receive the full property details, please reply to this email or call us directly.

Best regards,
The EstateIQ Team`;
  }

  if (prompt.includes("ad") || prompt.includes("Facebook ad")) {
    return `VARIATION: 1
HEADLINE: ${mainCity} Dream Home
PRIMARY TEXT: Discover this stunning property in ${mainCity}'s prime neighborhood. Modern finishes, 3 bedrooms, secure compound. Strong annual appreciation. Book a viewing today!
DESCRIPTION: Book Viewing Now

===AD===
VARIATION: 2
HEADLINE: Invest in ${countryName}
PRIMARY TEXT: Premium property in ${countryName}'s fastest-growing area. Below market price, move-in ready, strong rental yields. Don't miss this opportunity!
DESCRIPTION: View Property Details

===AD===
VARIATION: 3
HEADLINE: Your Next Home Awaits
PRIMARY TEXT: Beautiful family home in prime ${mainCity} location. Modern design, 24/7 security, near schools & malls. Priced to sell fast!
DESCRIPTION: Schedule a Tour`;
  }

  return `This is professionally crafted real estate marketing content generated for the ${countryName} market. Contact us for more details about this exceptional property opportunity in ${mainCity}.`;
}

export async function generatePropertyDescription(
  data: PropertyData,
  language: string = "english",
  countryCode: string = "kenya"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data, countryCode);
  const country = getCountryConfig(countryCode);
  const countryName = country?.name || "Kenya";
  const langNote = language !== "english"
    ? ` Generate ALL content in ${language.charAt(0).toUpperCase() + language.slice(1)}.`
    : "";

  const prompt = `Generate 3 versions of a property description for the following property:

${context}

${langNote}

Generate exactly 3 versions separated by "===VERSION===":
1. SHORT (50 words) — catchy and concise
2. MEDIUM (150 words) — balanced with key details
3. LONG (300 words) — comprehensive with investment highlights

Format each version EXACTLY as:
VERSION: [Short|Medium|Long]
[content for this version]`;

  const response = await callDeepSeek(prompt, countryCode);
  const versions = response.split("===VERSION===").filter(Boolean);

  const labels = ["Short", "Medium", "Long"];
  return labels.map((label, i) => ({
    title: `${data.title} — ${label} Description`,
    body: versions[i]?.trim() || `Professional ${label.toLowerCase()} description for ${data.title} in ${data.location}. Contact us for more details and to schedule a viewing.`,
    contentType: "description",
    language,
  }));
}

export async function generateSocialMediaPosts(
  data: PropertyData,
  language: string = "english",
  countryCode: string = "kenya"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data, countryCode);
  const country = getCountryConfig(countryCode);
  const countryName = country?.name || "Kenya";
  const hashtags = getCountryHashtags(countryCode).slice(0, 3).join(" ");
  const langNote = language !== "english"
    ? ` Generate ALL content in ${language.charAt(0).toUpperCase() + language.slice(1)}.`
    : "";

  const prompt = `Generate social media posts for this property:

${context}

${langNote}

Generate exactly 5 posts separated by "===POST===":
1. Facebook Post — Engagement focused with emojis and call-to-action
2. Facebook Post — Information focused with property details
3. Instagram Post — Visual/lifestyle focused with aesthetic appeal
4. Instagram Post — Story/selling focused, short and punchy
5. Twitter/X Post — Short & punchy (280 chars max)

Include relevant emojis and hashtags for each post.

Format each EXACTLY as:
POST: [Platform — Focus]
[content]`;

  const response = await callDeepSeek(prompt, countryCode);
  const posts = response.split("===POST===").filter(Boolean);

  const configs = [
    { platform: "facebook", label: "Facebook — Engagement" },
    { platform: "facebook", label: "Facebook — Information" },
    { platform: "instagram", label: "Instagram — Lifestyle" },
    { platform: "instagram", label: "Instagram — Story" },
    { platform: "twitter", label: "Twitter/X" },
  ];

  return configs.map((cfg, i) => ({
    title: `${data.title} — ${cfg.label}`,
    body: posts[i]?.trim() || `Check out ${data.title} in ${data.location}! Amazing property in ${countryName}. ${hashtags}`,
    contentType: "social_post",
    platform: cfg.platform,
    language,
  }));
}

export async function generateWhatsAppMessages(
  data: PropertyData,
  language: string = "english",
  countryCode: string = "kenya"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data, countryCode);
  const priceFormatted = formatPrice(countryCode, data.price);
  const langNote = language !== "english"
    ? ` Generate ALL content in ${language.charAt(0).toUpperCase() + language.slice(1)}.`
    : "";

  const prompt = `Generate WhatsApp marketing messages for this property:

${context}

${langNote}

Generate exactly 3 messages separated by "===MSG===":
1. Professional — Formal and detailed
2. Casual — Friendly and approachable
3. Urgent — Time-sensitive with strong CTA

Keep messages short and punchy (WhatsApp style). Include call-to-action. Mention price as ${priceFormatted}.

Format each EXACTLY as:
TONE: [Professional|Casual|Urgent]
[content]`;

  const response = await callDeepSeek(prompt, countryCode);
  const messages = response.split("===MSG===").filter(Boolean);

  const tones = ["Professional", "Casual", "Urgent"];
  return tones.map((tone, i) => ({
    title: `${data.title} — WhatsApp ${tone}`,
    body: messages[i]?.trim() || `Hi! Check out this ${data.propertyType} in ${data.location} at ${priceFormatted}. DM for details!`,
    contentType: "whatsapp_msg",
    platform: "whatsapp",
    language,
  }));
}

export async function generateEmailCampaign(
  data: PropertyData,
  language: string = "english",
  countryCode: string = "kenya"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data, countryCode);
  const langNote = language !== "english"
    ? ` Generate ALL content in ${language.charAt(0).toUpperCase() + language.slice(1)}.`
    : "";

  const prompt = `Generate email marketing content for this property:

${context}

${langNote}

Generate exactly 3 emails separated by "===EMAIL===":
1. New Listing Announcement — Exciting reveal
2. Open House Invitation — Invite to view
3. Price Drop Alert — Urgency-driven

Each email must have:
SUBJECT: [subject line]
[body content with paragraphs]

Format each EXACTLY as:
TYPE: [New Listing|Open House|Price Drop]
SUBJECT: [subject]
[body]`;

  const response = await callDeepSeek(prompt, countryCode);
  const emails = response.split("===EMAIL===").filter(Boolean);

  const types = ["New Listing", "Open House", "Price Drop"];
  return types.map((type, i) => ({
    title: `${data.title} — Email: ${type}`,
    body: emails[i]?.trim() || `Subject: Exciting New Listing — ${data.title}\n\nDear valued client,\n\nWe are pleased to present this exceptional ${data.propertyType} in ${data.location}.\n\nContact us to schedule a viewing.`,
    contentType: "email_campaign",
    platform: "email",
    language,
  }));
}

export async function generateAdCopy(
  data: PropertyData,
  language: string = "english",
  countryCode: string = "kenya"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data, countryCode);
  const country = getCountryConfig(countryCode);
  const mainCity = country?.cities[0]?.name || "Nairobi";
  const countryName = country?.name || "Kenya";
  const langNote = language !== "english"
    ? ` Generate ALL content in ${language.charAt(0).toUpperCase() + language.slice(1)}.`
    : "";

  const prompt = `Generate Facebook ad copy for this property:

${context}

${langNote}

Generate exactly 3 ad variations separated by "===AD===":
Each ad must have:
HEADLINE: (max 40 characters, catchy)
PRIMARY TEXT: (max 125 characters, compelling)
DESCRIPTION: (max 30 characters, concise CTA)

Optimize for engagement and clicks.

Format each EXACTLY as:
VARIATION: [1|2|3]
HEADLINE: [headline]
PRIMARY TEXT: [primary text]
DESCRIPTION: [description]`;

  const response = await callDeepSeek(prompt, countryCode);
  const ads = response.split("===AD===").filter(Boolean);

  return [1, 2, 3].map((num, i) => ({
    title: `${data.title} — Facebook Ad Variation ${num}`,
    body: ads[i]?.trim() || `HEADLINE: ${data.title.substring(0, 40)}\nPRIMARY TEXT: Beautiful ${data.propertyType} in ${data.location}. View now!\nDESCRIPTION: ${countryName} Real Estate`,
    contentType: "ad_copy",
    platform: "facebook",
    language,
  }));
}

export async function generateContent(
  propertyData: PropertyData,
  contentType: string,
  language: string = "english",
  countryCode: string = "kenya"
): Promise<GeneratedResult[]> {
  switch (contentType) {
    case "description":
      return generatePropertyDescription(propertyData, language, countryCode);
    case "social_post":
      return generateSocialMediaPosts(propertyData, language, countryCode);
    case "whatsapp_msg":
      return generateWhatsAppMessages(propertyData, language, countryCode);
    case "email_campaign":
      return generateEmailCampaign(propertyData, language, countryCode);
    case "ad_copy":
      return generateAdCopy(propertyData, language, countryCode);
    default:
      return generatePropertyDescription(propertyData, language, countryCode);
  }
}

export function getAIStatus(): AIUsage {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (apiKey && apiKey !== "sk-placeholder-key") {
    return { model: "deepseek-chat", provider: "DeepSeek" };
  }
  return { model: "fallback-engine", provider: "Built-in" };
}
