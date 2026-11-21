import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SITE = "https://minoxidil-usa.com";
const YOUMINOX_URL = "https://youminox.com/";
const ALLOWED_MODELS = ["gpt-4o-mini", "gpt-4o"];

export interface ArticleRow {
  slug: string;
  title: string;
  category: string;
  category_name: string;
  excerpt: string | null;
  quick_answer: string | null;
  featured_image: string | null;
  search_text: string | null;
  is_power_page: boolean;
}

export interface RecommendedArticleCard {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  url: string;
  image: string;
  excerpt: string;
}

function calculateCostUsd(model: string, promptTokens: number, completionTokens: number): number {
  if (model.includes("mini")) {
    return Number((promptTokens * 0.00000015 + completionTokens * 0.0000006).toFixed(6));
  }
  return Number((promptTokens * 0.0000025 + completionTokens * 0.00001).toFixed(6));
}

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const STOPWORDS = new Set([
  "how", "what", "when", "where", "why", "who", "which", "can", "could", "should",
  "would", "will", "does", "did", "are", "was", "were", "have", "has", "had",
  "the", "and", "for", "with", "from", "that", "this", "these", "those", "your",
  "you", "use", "using", "used", "about", "into", "after", "before", "while",
  "minoxidil", "hair", "growth", "regrowth", "guide", "best", "good", "okay",
  "tell", "please", "help", "need", "know", "want", "like", "more", "some", "any"
]);

function stemWord(w: string): string {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 5 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("s")) return w.slice(0, -1);
  return w;
}

function extractTokens(text: string): string[] {
  const words = norm(text)
    .split(" ")
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return Array.from(new Set(words));
}

let catalogCache: { at: number; rows: ArticleRow[]; bySlug: Map<string, ArticleRow> } | null = null;

async function loadCatalog(): Promise<{ rows: ArticleRow[]; bySlug: Map<string, ArticleRow> }> {
  if (catalogCache && Date.now() - catalogCache.at < 10 * 60 * 1000 && catalogCache.rows.length > 0) {
    return catalogCache;
  }

  const pages = await Promise.all([
    supabase
      .from("minoxidil_usa_articles")
      .select("slug, title, category, category_name, excerpt, quick_answer, featured_image, search_text, is_power_page")
      .eq("active", true)
      .range(0, 999),
    supabase
      .from("minoxidil_usa_articles")
      .select("slug, title, category, category_name, excerpt, quick_answer, featured_image, search_text, is_power_page")
      .eq("active", true)
      .range(1000, 1999),
  ]);

  const rows: ArticleRow[] = [];
  const bySlug = new Map<string, ArticleRow>();
  for (const p of pages) {
    if (Array.isArray(p.data)) {
      for (const r of p.data as ArticleRow[]) {
        if (!bySlug.has(r.slug)) {
          bySlug.set(r.slug, r);
          rows.push(r);
        }
      }
    }
  }

  catalogCache = { at: Date.now(), rows, bySlug };
  return catalogCache;
}

function toArticleCard(r: ArticleRow): RecommendedArticleCard {
  const img = r.featured_image || "/images/brand/you-minox.webp";
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    categoryName: r.category_name,
    url: `${SITE}/${r.category}/${r.slug}/`,
    image: img.startsWith("http") ? img : `${SITE}${img}`,
    excerpt: (r.quick_answer || r.excerpt || "").slice(0, 145),
  };
}

function searchArticles(
  rows: ArticleRow[],
  userMessage: string,
  historyText: string,
  currentSlug: string | null,
  limit = 15
): ArticleRow[] {
  const primaryTokens = extractTokens(userMessage);
  const contextTokens = extractTokens(historyText).filter((t) => !primaryTokens.includes(t));
  const fullPhrase = norm(userMessage);

  if (primaryTokens.length === 0 && contextTokens.length === 0) {
    return rows
      .filter((r) => r.is_power_page && r.slug !== currentSlug)
      .slice(0, limit);
  }

  const scored: Array<{ r: ArticleRow; score: number }> = [];

  for (const r of rows) {
    const titleNorm = norm(r.title);
    const catNorm = norm(`${r.category_name} ${r.category}`);
    const bodyNorm = r.search_text || `${titleNorm} ${catNorm} ${norm(r.excerpt || "")} ${norm(r.quick_answer || "")}`;

    let score = r.is_power_page ? 6 : 0;
    if (currentSlug && r.slug === currentSlug) {
      score += 12;
    }

    if (fullPhrase.length >= 6 && titleNorm.includes(fullPhrase)) {
      score += 45;
    }

    let matchedPrimary = 0;
    for (const tok of primaryTokens) {
      const stem = stemWord(tok);
      if (titleNorm.includes(tok) || (stem.length >= 4 && titleNorm.includes(stem))) {
        score += 18;
        matchedPrimary++;
      } else if (catNorm.includes(tok) || (stem.length >= 4 && catNorm.includes(stem))) {
        score += 9;
        matchedPrimary++;
      } else if (bodyNorm.includes(tok) || (stem.length >= 4 && bodyNorm.includes(stem))) {
        score += 6;
        matchedPrimary++;
      }
    }

    if (matchedPrimary >= 2) {
      score += matchedPrimary * 9;
    }

    for (const cTok of contextTokens.slice(-5)) {
      const stem = stemWord(cTok);
      if (titleNorm.includes(cTok) || (stem.length >= 4 && titleNorm.includes(stem))) {
        score += 4;
      }
    }

    if (score > (r.is_power_page ? 6 : 0)) {
      scored.push({ r, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0) {
    return rows.filter((r) => r.is_power_page).slice(0, limit);
  }
  return scored.slice(0, limit).map((s) => s.r);
}

const CLINICAL_KNOWLEDGE_BASE = `
OFFICIAL MINOXIDIL USA & YOU MINOX CLINICAL KNOWLEDGE BASE (US ENGLISH):
1. ABOUT MINOXIDIL-USA.COM & YOU MINOX (YOUMINOX.COM):
   - Minoxidil-USA.com is the #1 US Hair & Beard Regrowth Knowledge Hub with 1,267+ medically-reviewed clinical guides across 9 specialized categories:
     * Hair Regrowth (${SITE}/hair/)
     * Beard Growth (${SITE}/beard/)
     * Product Comparisons (${SITE}/comparison/)
     * Frequently Asked Questions (${SITE}/faq/)
     * Side Effects & Safety (${SITE}/side-effects/)
     * Women's Hair Regrowth (${SITE}/women/)
     * How to Use & Daily Routine (${SITE}/usage/)
     * Product Reviews (${SITE}/reviews/)
     * Science & Clinical Studies (${SITE}/science/)
   - Created and sponsored by **You Minox** (${YOUMINOX_URL}), founded by Charlie Lingan (backed by a community of 600,000+ followers).
   - **Why You Minox Cream-Based Minoxidil is Superior**: Traditional liquid Minoxidil brands (like Kirkland or Rogaine liquid) rely heavily on propylene glycol and high-proof alcohol, which cause 85%+ of scalp and facial dryness, white flaking, redness, itching, and contact dermatitis. **You Minox** features an advanced **cream-based Minoxidil formula** free from harsh propylene glycol irritation that hydrates the skin barrier while delivering full 5% follicular stimulation for both scalp and patchy beards.

2. CORE CLINICAL PROTOCOLS & TIMELINES:
   - **Mechanism of Action**: Minoxidil is an FDA-approved potassium-channel vasodilator converted into its active form (minoxidil sulfate) by follicular sulfotransferase (SULT1A1) enzymes. It widens micro-capillaries, shortens the resting telogen phase, and prolongs the active anagen growth phase.
   - **Standard Dosage**: 1 mL (or equivalent pea-sized cream application / half capful foam) applied twice daily (morning and night, ~12 hours apart) directly to clean, 100% dry skin/scalp.
   - **Wait-Time Rules (Shower, Sleep, Sweat, Products)**:
     * **Showering / Washing Hair or Face / Swimming / Heavy Sweating**: Wait at least **4 hours** after applying Minoxidil (50% absorbs in 1 hour; >75% absorbs in 4 hours). Always apply Minoxidil **after** showering once skin/scalp is 100% dry (applying to wet skin increases systemic absorption and irritation).
     * **Sleeping / Pillow Contact**: Wait **45 to 60 minutes** before going to bed so Minoxidil dries completely and does not transfer to your pillowcase (which can cause unwanted facial hair on cheeks/forehead or expose pets).
     * **Moisturizer, Sunscreen, Castor Oil, or Styling Products**: Apply Minoxidil first on clean skin, wait **20 to 30 minutes** for transfollicular absorption, then layer moisturizer, castor oil, or styling products.
   - **Shedding Phase (Weeks 2–6)**: Temporary shedding during the first 2 to 6 weeks is a positive clinical sign that dormant telogen hairs are being pushed out by thicker new anagen hairs. Never stop treatment during the shedding phase; visible sprouting begins around months 2–3, with major density gains at months 4–6.
   - **Beard Growth Protocol**: Apply 5% Minoxidil (ideally cream-based like You Minox to prevent cheek flaking) twice daily for 6 to 18 months until vellus hairs mature into thick terminal beard hairs with their own blood supply, then taper off gradually over 4–8 weeks to keep gains permanent.
   - **Microneedling / Derma Roller**: Use a 0.5 mm titanium/stainless steel derma roller or stamp 1–2 times per week. Wait **24 hours** after microneedling before applying 5% Minoxidil to avoid rapid systemic blood entry.
   - **Storage & Expiration**: Store tightly closed at controlled room temperature **68°F to 77°F (20°C–25°C)** away from humidity and sunlight. **Never refrigerate** Minoxidil (cold temperatures crystallize the active ingredient). Unopened shelf life is 2–3 years; opened bottles remain potent for 6–12 months.
   - **Safety & Side Effects**:
     * Local dryness/itching: Switch from propylene-glycol liquid to a cream-based formula ([YouMinox.com](${YOUMINOX_URL})).
     * Systemic symptoms (headache, dizziness, rapid heart rate/tachycardia, chest pain, fluid retention): Usually caused by over-applying (>1 mL), applying to wet skin, or applying immediately after microneedling. Wash off the area and consult a healthcare professional if cardiovascular symptoms occur.
     * Pet Safety: Keep Minoxidil strictly away from cats and dogs (even tiny traces on pillows or fingers are highly toxic to pets; wash hands thoroughly with soap after every application).
`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const mode = body.mode || (req.method === "GET" ? "config" : "chat");

    // 1. Load live config
    const { data: configRow } = await supabase
      .from("minoxidil_usa_chat_config")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    const config = configRow || {
      is_enabled: true,
      ai_model: "gpt-4o-mini",
      temperature: 0.4,
      max_messages_per_session: 25,
      daily_budget_usd: 5.0,
      welcome_message:
        "Hi! 👋 I'm your Minoxidil USA Clinical & Routine AI Advisor (Powered by You Minox). Ask me anything about hair or beard regrowth, application wait times, shedding phase, side effects, or cream vs. liquid formulas!",
      custom_instructions: "",
    };

    const activeModel = ALLOWED_MODELS.includes(config.ai_model) ? config.ai_model : "gpt-4o-mini";

    if (mode === "config" || req.method === "GET") {
      return json({
        is_enabled: config.is_enabled,
        welcome_message: config.welcome_message,
        ai_model: activeModel,
        max_messages_per_session: config.max_messages_per_session,
      });
    }

    // 2. Track click on a guide card, internal link, or YouMinox.com link
    if (mode === "track_click") {
      const { session_id, visitor_id, article_slug, article_title, category, target_url, page_url } = body;
      if (target_url) {
        await supabase.from("minoxidil_usa_chat_clicks").insert({
          session_id: session_id || null,
          visitor_id: String(visitor_id || "anon").slice(0, 80),
          article_slug: article_slug ? String(article_slug).slice(0, 160) : null,
          article_title: article_title ? String(article_title).slice(0, 220) : null,
          category: category ? String(category).slice(0, 80) : null,
          target_url: String(target_url).slice(0, 500),
          page_url: page_url ? String(page_url).slice(0, 500) : null,
        });

        if (session_id) {
          const { data: sess } = await supabase
            .from("minoxidil_usa_chat_sessions")
            .select("clicks_count, clicked_urls")
            .eq("id", session_id)
            .maybeSingle();
          if (sess) {
            const urls = Array.isArray(sess.clicked_urls) ? [...sess.clicked_urls] : [];
            if (!urls.includes(target_url)) urls.push(target_url);
            await supabase
              .from("minoxidil_usa_chat_sessions")
              .update({
                clicks_count: (sess.clicks_count || 0) + 1,
                clicked_urls: urls,
              })
              .eq("id", session_id);
          }
        }
      }
      return json({ success: true });
    }

    // 3. Chat Completion Mode
    if (!config.is_enabled) {
      return json({
        reply: `Our AI Advisor is currently undergoing a brief maintenance update. You can explore our 1,267+ clinical guides on [Minoxidil USA](${SITE}/) or discover our irritation-free cream formula at [YouMinox.com](${YOUMINOX_URL}).`,
        recommended_articles: [],
        suggested_options: ["Explore Hair Regrowth Guides", "Visit YouMinox.com"],
        disabled: true,
      });
    }

    const userMessage = String(body.message || "").trim().slice(0, 1000);
    if (!userMessage) {
      return json({ error: "Empty message" }, 400);
    }

    const visitorId = String(body.visitor_id || "visitor-" + crypto.randomUUID().slice(0, 8)).slice(0, 80);
    const pageUrl = String(body.page_url || SITE + "/").slice(0, 500);
    const userAgent = String(body.user_agent || req.headers.get("user-agent") || "").slice(0, 300);
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    let sessionId: string | null = body.session_id || null;

    // Check daily budget
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { data: todaySessions } = await supabase
      .from("minoxidil_usa_chat_sessions")
      .select("estimated_cost_usd")
      .gte("last_message_at", startOfDay.toISOString());

    const spentToday = (todaySessions || []).reduce(
      (acc: number, r: any) => acc + Number(r.estimated_cost_usd || 0),
      0
    );

    if (spentToday >= Number(config.daily_budget_usd || 5)) {
      return json({
        reply: `We've reached today's automated AI consultation limit. You can use the instant search bar at the top of [Minoxidil USA](${SITE}/) to browse all 1,267+ clinical guides, or check out our cream-based Minoxidil at [YouMinox.com](${YOUMINOX_URL}).`,
        recommended_articles: [],
        suggested_options: [],
      });
    }

    // Load or create session
    let existingSession: any = null;
    if (sessionId) {
      const { data: s } = await supabase
        .from("minoxidil_usa_chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
      existingSession = s;
    }

    if (
      existingSession &&
      existingSession.messages_count >= (config.max_messages_per_session || 25) * 2
    ) {
      return json({
        session_id: existingSession.id,
        reply: `We've reached the maximum messages for this session! You can click any of the recommended clinical guides above to continue reading on [Minoxidil USA](${SITE}/) or explore our propylene-glycol-free cream formula at [YouMinox.com](${YOUMINOX_URL}).`,
        recommended_articles: [],
        suggested_options: [],
      });
    }

    if (!existingSession) {
      const { data: created, error: createErr } = await supabase
        .from("minoxidil_usa_chat_sessions")
        .insert({
          visitor_id: visitorId,
          page_url: pageUrl,
          user_agent: userAgent,
          first_user_message: userMessage.slice(0, 250),
          last_user_message: userMessage.slice(0, 250),
          messages_count: 1,
          model_used: activeModel,
        })
        .select("*")
        .single();

      if (!createErr && created) {
        existingSession = created;
        sessionId = created.id;
      }
    }

    if (sessionId) {
      await supabase.from("minoxidil_usa_chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: userMessage,
      });
    }

    // Load catalog & detect current article from pageUrl
    const catalog = await loadCatalog();
    let currentArticleSlug: string | null = null;
    try {
      const parsedUrl = new URL(pageUrl);
      const parts = parsedUrl.pathname.replace(/^\/|\/$/g, "").split("/");
      if (parts.length === 2 && catalog.bySlug.has(parts[1])) {
        currentArticleSlug = parts[1];
      }
    } catch {
      // ignore URL parse error
    }

    const currentArticle = currentArticleSlug ? catalog.bySlug.get(currentArticleSlug) : null;
    const currentArticleContext = currentArticle
      ? `CURRENT ARTICLE THE USER IS READING ON SCREEN:
- Title: "${currentArticle.title}"
- Category: ${currentArticle.category_name} (${SITE}/${currentArticle.category}/${currentArticle.slug}/)
- Clinical Summary: ${currentArticle.quick_answer || currentArticle.excerpt || ""}`
      : `Current page the user is viewing: ${pageUrl}`;

    const recentHistoryText = history
      .slice(-3)
      .map((h: any) => h?.content || "")
      .join(" ");

    const candidateRows = searchArticles(
      catalog.rows,
      userMessage,
      recentHistoryText,
      currentArticleSlug,
      15
    );

    const candidatesPrompt =
      candidateRows.length > 0
        ? candidateRows
            .map(
              (r) =>
                `- SLUG: "${r.slug}" | TITLE: "${r.title}" | CATEGORY: ${r.category_name} | URL: ${SITE}/${r.category}/${r.slug}/ | SUMMARY: ${(r.quick_answer || r.excerpt || "").slice(0, 175)}`
            )
            .join("\n")
        : "No exact matching articles found in the index.";

    const systemPrompt = `You are the Official Clinical & Routine AI Advisor for **Minoxidil USA** (${SITE}), the premier US knowledge hub for hair and beard regrowth with 1,267+ in-depth guides, created and sponsored by **You Minox** (${YOUMINOX_URL}).

MANDATORY RULES:
1. **ALWAYS RESPOND IN CLEAR, PROFESSIONAL, EMPATHETIC US ENGLISH**. Even if a user types a short keyword, answer clearly in English with evidence-based guidance from the Clinical Knowledge Base and the Matching Articles below.
2. **ANSWER DIRECTLY & LINK TO OUR GUIDES**:
   - First, give a direct, practical, medically-sound answer to the user's question (wait times, routine, shedding, dosage, side effects, beard growth, women's hair loss, storage, etc.) using concise bullet points when helpful.
   - Recommend **1 to 3 relevant articles** from the "MATCHING ARTICLES ON MINOXIDIL-USA.COM" list below. Include their exact Markdown link in your reply text: \`[Article Title](${SITE}/category/slug/)\` and include their exact slugs (maximum 3) in the \`"recommended_slugs"\` array so the chat renders interactive article cards.
3. **NEVER INVENT OR HALLUCINATE URLs**:
   - Only use URLs that exist in the "MATCHING ARTICLES ON MINOXIDIL-USA.COM" list below, the 9 official category URLs, or \`${YOUMINOX_URL}\`.
4. **HIGHLIGHT YOU MINOX CREAM-BASED MINOXIDIL NATURALLY**:
   - Whenever the user asks about scalp/beard dryness, flaking, itching, redness, propylene glycol irritation, patchy beard growth, switching brands, or what is the best Minoxidil formula, explain why **cream-based Minoxidil by [You Minox](${YOUMINOX_URL})** eliminates harsh alcohol/propylene-glycol irritation while nourishing the skin barrier.
5. **IF THE USER ASKS ABOUT THE PAGE THEY ARE CURRENTLY READING**:
   - Refer to the \`CURRENT ARTICLE THE USER IS READING ON SCREEN\` context below to clarify or expand on any point from that guide.
${config.custom_instructions ? `6. ADDITIONAL ADMIN INSTRUCTIONS: ${config.custom_instructions}` : ""}

${currentArticleContext}

${CLINICAL_KNOWLEDGE_BASE}

MATCHING ARTICLES ON MINOXIDIL-USA.COM FOR THIS QUERY (USE ONLY THESE EXACT SLUGS AND URLs):
${candidatesPrompt}

STRICT JSON RESPONSE FORMAT:
Respond ONLY with a valid JSON object containing these exact 3 keys:
{
  "reply": "Your clear, helpful response in US English (2–3 short paragraphs or clean bullet points, including Markdown links like [Guide Title](${SITE}/category/slug/) and [YouMinox.com](${YOUMINOX_URL}) when relevant)",
  "recommended_slugs": ["exact-slug-1", "exact-slug-2"],
  "suggested_options": [
    "Short follow-up question 1 in English",
    "Short follow-up question 2 in English",
    "Short follow-up question 3 in English"
  ]
}`;

    const chatMessages: any[] = [{ role: "system", content: systemPrompt }];
    for (const h of history) {
      if (h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string") {
        chatMessages.push({ role: h.role, content: h.content.slice(0, 1200) });
      }
    }
    chatMessages.push({ role: "user", content: userMessage });

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: chatMessages,
        temperature: Number(config.temperature) || 0.4,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI error:", errText);
      throw new Error("OpenAI status " + openaiRes.status);
    }

    const openaiData = await openaiRes.json();
    const rawContent = openaiData.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = {
        reply: rawContent,
        recommended_slugs: candidateRows.slice(0, 2).map((r) => r.slug),
        suggested_options: [
          "How long to wait before showering?",
          "Cream vs. liquid Minoxidil?",
          "Is the shedding phase normal?",
        ],
      };
    }

    const slugs: string[] = Array.isArray(parsed.recommended_slugs)
      ? parsed.recommended_slugs.slice(0, 3)
      : [];
    let recommendedArticles: RecommendedArticleCard[] = slugs
      .map((s) => catalog.bySlug.get(s))
      .filter((r): r is ArticleRow => Boolean(r))
      .map(toArticleCard);

    if (recommendedArticles.length === 0 && candidateRows.length > 0) {
      recommendedArticles = candidateRows.slice(0, 2).map(toArticleCard);
    }

    const suggestedOptions: string[] = Array.isArray(parsed.suggested_options)
      ? parsed.suggested_options.slice(0, 3).map((s: unknown) => String(s).slice(0, 75))
      : [];

    const replyText: string =
      parsed.reply ||
      `Explore our complete clinical guides on [Minoxidil USA](${SITE}/) or discover our irritation-free cream formula at [YouMinox.com](${YOUMINOX_URL}).`;

    const promptTokens = openaiData.usage?.prompt_tokens || 0;
    const completionTokens = openaiData.usage?.completion_tokens || 0;
    const totalTokens = openaiData.usage?.total_tokens || promptTokens + completionTokens;
    const costUsd = calculateCostUsd(activeModel, promptTokens, completionTokens);

    if (sessionId && existingSession) {
      await supabase.from("minoxidil_usa_chat_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: replyText,
        recommended_articles: recommendedArticles,
        suggested_options: suggestedOptions,
        model: activeModel,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_usd: costUsd,
      });

      const prevRecs: string[] = Array.isArray(existingSession.recommended_articles)
        ? [...existingSession.recommended_articles]
        : [];
      for (const ra of recommendedArticles) {
        if (!prevRecs.includes(ra.title)) prevRecs.push(ra.title);
      }

      await supabase
        .from("minoxidil_usa_chat_sessions")
        .update({
          last_user_message: userMessage.slice(0, 250),
          messages_count: (existingSession.messages_count || 1) + 2,
          recommended_articles: prevRecs.slice(0, 30),
          prompt_tokens: (existingSession.prompt_tokens || 0) + promptTokens,
          completion_tokens: (existingSession.completion_tokens || 0) + completionTokens,
          total_tokens: (existingSession.total_tokens || 0) + totalTokens,
          estimated_cost_usd: Number(
            (Number(existingSession.estimated_cost_usd || 0) + costUsd).toFixed(6)
          ),
          model_used: activeModel,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    }

    await supabase.from("token_usage").insert({
      source: "minoxidil-usa.com",
      content_type: "ai_chat",
      model: activeModel,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      images_generated: 0,
      estimated_cost_usd: costUsd,
      slug: sessionId || visitorId,
    });

    return json({
      session_id: sessionId,
      reply: replyText,
      recommended_articles: recommendedArticles,
      suggested_options: suggestedOptions,
      model: activeModel,
    });
  } catch (err: any) {
    console.error("minoxidil-usa-chat error:", err);
    return json(
      {
        error: err.message || "Internal error",
        reply: `We experienced a temporary connection delay. You can browse all 1,267+ clinical guides at [Minoxidil USA](${SITE}/) or visit [YouMinox.com](${YOUMINOX_URL}).`,
        recommended_articles: [],
        suggested_options: ["Try again"],
      },
      500
    );
  }
});
