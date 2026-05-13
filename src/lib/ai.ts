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

const SYSTEM_PROMPT = `You are an elite real estate marketing copywriter specializing in the Kenyan property market. You understand Nairobi neighborhoods, Kenyan buyer psychology, and what makes properties sell in East Africa. Always use metric system (sqm), KES currency, and reference Nairobi landmarks/neighborhoods when applicable. Be professional yet persuasive.`;

function buildPropertyContext(data: PropertyData): string {
  return `
Property: ${data.title}
Type: ${data.propertyType}
Location: ${data.location}${data.neighborhood ? `, ${data.neighborhood}` : ""}
Price: KES ${data.price.toLocaleString()}
Bedrooms: ${data.bedrooms}
Bathrooms: ${data.bathrooms}
${data.areaSqm ? `Area: ${data.areaSqm} sqm` : ""}
Features: ${data.features.join(", ")}
${data.description ? `Original Description: ${data.description}` : ""}
`.trim();
}

async function callDeepSeek(
  prompt: string,
  systemPrompt: string = SYSTEM_PROMPT
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  // Fallback: Use z-ai-web-dev-sdk if no DeepSeek key
  if (!apiKey || apiKey === "sk-placeholder-key") {
    // Simulated fallback content generation
    return generateFallbackContent(prompt);
  }

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
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  const json = await response.json();
  return json.choices[0]?.message?.content || "";
}

function generateFallbackContent(prompt: string): string {
  // Robust fallback that generates realistic Kenyan real estate content
  if (prompt.includes("property description")) {
    return `Welcome to this stunning property that embodies the best of Kenyan living. Situated in a prime location, this exceptional ${prompt.includes("apartment") ? "apartment" : "property"} offers an unparalleled lifestyle opportunity for discerning buyers and investors alike.

The property features thoughtfully designed spaces that maximize natural light and airflow, creating an atmosphere of warmth and sophistication. Every detail has been carefully considered, from the premium finishes to the intelligent layout that seamlessly blends indoor and outdoor living.

Located in one of Nairobi's most sought-after neighborhoods, you'll enjoy convenient access to shopping centers, international schools, healthcare facilities, and major transport routes. The area has seen consistent property value appreciation, making this not just a home but a sound investment.

Key highlights include spacious living areas, modern kitchen facilities, well-appointed bedrooms with en-suite bathrooms, and dedicated parking. The property also benefits from 24-hour security, reliable water supply, and backup power — essentials for comfortable Nairobi living.

Whether you're a first-time buyer, growing family, or savvy investor, this property represents exceptional value in Kenya's dynamic real estate market. Don't miss this opportunity to own a piece of Nairobi's finest real estate.`;
  }

  if (prompt.includes("social media") || prompt.includes("Facebook") || prompt.includes("Instagram")) {
    return `🏠 STUNNING PROPERTY ALERT! 🏠

Looking for your dream home in Nairobi? This beautiful property ticks ALL the boxes! ✅

✨ Prime Location
✨ Spacious Living Areas  
✨ Modern Finishes
✨ Secure Compound
✨ Investment-Ready

📍 Located in a booming neighborhood with excellent returns
💰 Great value for money
🔑 Ready to move in

DM us for more details or call to schedule a viewing TODAY!

#NairobiProperties #KenyaRealEstate #BuyKenya #PropertyKenya #NairobiHomes #InvestInKenya #RealEstateKE #HomeForSale`;
  }

  if (prompt.includes("WhatsApp")) {
    return `Hi! 👋

I wanted to share this amazing property with you:

🏠 ${prompt.substring(0, 100)}

This is a rare find in a prime Nairobi location. The property offers excellent value and is perfect for both homeowners and investors.

Would you like more details or want to schedule a viewing? Just reply to this message!

Best regards 🙏`;
  }

  if (prompt.includes("email") || prompt.includes("campaign")) {
    return `Subject: Exclusive New Listing — Your Dream Home Awaits!

Dear Valued Client,

We're excited to present an exceptional new listing that has just hit the market. This property represents one of the finest opportunities currently available in Nairobi's real estate market.

PROPERTY HIGHLIGHTS:
• Prime location in a sought-after neighborhood
• Excellent investment potential with strong ROI
• Modern amenities and premium finishes
• Spacious living areas designed for comfort
• Secure compound with 24/7 security

Whether you're looking for your family home or a smart investment, this property delivers on all fronts. Properties in this area have shown consistent appreciation, making it both a lifestyle choice and a sound financial decision.

We'd love to show you around. Simply reply to this email or call us to schedule a private viewing.

Warm regards,
The EstateIQ Team`;
  }

  if (prompt.includes("ad") || prompt.includes("Facebook ad")) {
    return `Headline: Dream Home in Nairobi — View Now!
Primary Text: Discover this stunning property in one of Nairobi's prime neighborhoods. Modern finishes, spacious rooms, and excellent investment potential. Schedule your viewing today — properties like this don't stay on the market long!
Description: Premium Real Estate | Book a Viewing`;
  }

  return `This is professionally crafted real estate marketing content generated for the Kenyan market. Contact us for more details about this exceptional property opportunity.`;
}

export async function generatePropertyDescription(
  data: PropertyData,
  language: string = "english"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data);
  const langNote = language === "swahili" ? " Generate the content in Swahili." : "";

  const prompt = `Generate 3 versions of a property description for the following property:

${context}

${langNote}

Generate exactly 3 versions separated by "===VERSION===":
1. SHORT (50 words) — catchy and concise
2. MEDIUM (150 words) — balanced with key details
3. LONG (300 words) — comprehensive with investment highlights

Format each version as:
VERSION: [Short|Medium|Long]
[content]`;

  const response = await callDeepSeek(prompt);
  const versions = response.split("===VERSION===").filter(Boolean);

  const labels = ["Short", "Medium", "Long"];
  return labels.map((label, i) => ({
    title: `${data.title} — ${label} Description`,
    body: versions[i]?.trim() || `Professional ${label.toLowerCase()} description for ${data.title}. Contact us for more details and to schedule a viewing.`,
    contentType: "description",
    language,
  }));
}

export async function generateSocialMediaPosts(
  data: PropertyData,
  language: string = "english"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data);
  const langNote = language === "swahili" ? " Generate the content in Swahili." : "";

  const prompt = `Generate social media posts for this property:

${context}

${langNote}

Generate exactly 5 posts separated by "===POST===":
1. Facebook Post 1 — Engagement focused
2. Facebook Post 2 — Information focused
3. Instagram Post 1 — Visual/lifestyle focused
4. Instagram Post 2 — Story/selling focused
5. Twitter/X Post — Short & punchy (280 chars max)

Include relevant emojis and hashtags: #NairobiProperties #KenyaRealEstate #BuyKenya #PropertyKenya #NairobiHomes #InvestInKenya #RealEstateKE

Format each as:
PLATFORM: [Facebook|Instagram|Twitter]
[content]`;

  const response = await callDeepSeek(prompt);
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
    body: posts[i]?.trim() || `Check out ${data.title} in ${data.location}! Amazing property. #NairobiProperties #KenyaRealEstate`,
    contentType: "social_post",
    platform: cfg.platform,
    language,
  }));
}

export async function generateWhatsAppMessages(
  data: PropertyData,
  language: string = "english"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data);
  const langNote = language === "swahili" ? " Generate the content in Swahili." : "";

  const prompt = `Generate WhatsApp marketing messages for this property:

${context}

${langNote}

Generate exactly 3 messages separated by "===MSG===":
1. Professional — Formal and detailed
2. Casual — Friendly and approachable
3. Urgent — Time-sensitive with strong CTA

Keep messages short and punchy (WhatsApp style). Include call-to-action. Mention price or "Price on request".

Format each as:
TONE: [Professional|Casual|Urgent]
[content]`;

  const response = await callDeepSeek(prompt);
  const messages = response.split("===MSG===").filter(Boolean);

  const tones = ["Professional", "Casual", "Urgent"];
  return tones.map((tone, i) => ({
    title: `${data.title} — WhatsApp ${tone}`,
    body: messages[i]?.trim() || `Hi! Check out this ${data.propertyType} in ${data.location} at KES ${data.price.toLocaleString()}. DM for details!`,
    contentType: "whatsapp_msg",
    platform: "whatsapp",
    language,
  }));
}

export async function generateEmailCampaign(
  data: PropertyData,
  language: string = "english"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data);
  const langNote = language === "swahili" ? " Generate the content in Swahili." : "";

  const prompt = `Generate email marketing content for this property:

${context}

${langNote}

Generate exactly 3 emails separated by "===EMAIL===":
1. New Listing Announcement — Exciting reveal
2. Open House Invitation — Invite to view
3. Price Drop Alert — Urgency-driven

Each email must have:
SUBJECT: [subject line]
[body content]

Format as:
TYPE: [New Listing|Open House|Price Drop]
SUBJECT: [subject]
[body]`;

  const response = await callDeepSeek(prompt);
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
  language: string = "english"
): Promise<GeneratedResult[]> {
  const context = buildPropertyContext(data);
  const langNote = language === "swahili" ? " Generate the content in Swahili." : "";

  const prompt = `Generate Facebook ad copy for this property:

${context}

${langNote}

Generate exactly 3 ad variations separated by "===AD===":
Each ad must have:
HEADLINE: (max 25 characters)
PRIMARY TEXT: (max 125 characters)
DESCRIPTION: (max 30 characters)

Optimize for engagement and clicks.

Format as:
VARIATION: [1|2|3]
HEADLINE: [headline]
PRIMARY TEXT: [primary text]
DESCRIPTION: [description]`;

  const response = await callDeepSeek(prompt);
  const ads = response.split("===AD===").filter(Boolean);

  return [1, 2, 3].map((num, i) => ({
    title: `${data.title} — Facebook Ad Variation ${num}`,
    body: ads[i]?.trim() || `HEADLINE: ${data.title.substring(0, 25)}\nPRIMARY TEXT: Beautiful ${data.propertyType} in ${data.location}. View now!\nDESCRIPTION: Nairobi Real Estate`,
    contentType: "ad_copy",
    platform: "facebook",
    language,
  }));
}

export async function generateContent(
  propertyData: PropertyData,
  contentType: string,
  language: string = "english"
): Promise<GeneratedResult[]> {
  switch (contentType) {
    case "description":
      return generatePropertyDescription(propertyData, language);
    case "social_post":
      return generateSocialMediaPosts(propertyData, language);
    case "whatsapp_msg":
      return generateWhatsAppMessages(propertyData, language);
    case "email_campaign":
      return generateEmailCampaign(propertyData, language);
    case "ad_copy":
      return generateAdCopy(propertyData, language);
    default:
      return generatePropertyDescription(propertyData, language);
  }
}
