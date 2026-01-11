import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { initDatabase, run, all, get } from './database';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!NEWS_API_KEY || !GEMINI_API_KEY) {
  console.error('Missing API keys. Make sure NEWS_API_KEY and GEMINI_API_KEY are set in server/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Search queries to find brand partnership news
const SEARCH_QUERIES = [
  'brand collaboration announced',
  'brand partnership launch',
  'co-branded product launch',
  'celebrity brand collaboration',
  'fashion collaboration collection',
  'beauty brand partnership',
  'limited edition collaboration',
  'brand licensing deal'
];

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  urlToImage?: string;
}

interface ExtractedCollaboration {
  isCollaboration: boolean;
  title: string;
  summary: string;
  brands: string[];
  collaborationType: string;
  confidence: number;
}

async function fetchNews(query: string): Promise<NewsArticle[]> {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error(`NewsAPI error for "${query}":`, data.message);
      return [];
    }

    return data.articles || [];
  } catch (error) {
    console.error(`Error fetching news for "${query}":`, error);
    return [];
  }
}

async function extractCollaborationData(article: NewsArticle): Promise<ExtractedCollaboration | null> {
  const prompt = `Analyze this news article and determine if it's about a brand collaboration/partnership.

Title: ${article.title}
Description: ${article.description || 'No description'}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "isCollaboration": true/false,
  "title": "Short title for the collaboration (e.g., 'Nike x Off-White The Ten Collection')",
  "summary": "2-3 sentence summary of the partnership",
  "brands": ["Brand1", "Brand2"],
  "collaborationType": "One of: Product Launch, Co-Branding, Limited Edition, Licensing Deal, Celebrity Partnership, Influencer Collaboration, Retail Exclusive, Sustainability Initiative, Tech Integration, Crossover, Other",
  "confidence": 0.0-1.0
}

Rules:
- isCollaboration should be true ONLY if this is about two or more brands/companies/celebrities working together
- brands array must have at least 2 entries for a valid collaboration
- Include celebrity names as "brands" if they're partnering with a company
- confidence should reflect how certain you are this is a real collaboration announcement`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up the response (remove markdown code blocks if present)
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.error('Error extracting data from article:', article.title, error);
    return null;
  }
}

async function getOrCreateBrand(name: string): Promise<number> {
  // Check if brand exists
  const existing = await get('SELECT id FROM brands WHERE LOWER(name) = LOWER(?)', [name]);

  if (existing) {
    return (existing as any).id;
  }

  // Create new brand
  const result = await run(
    'INSERT INTO brands (name) VALUES (?)',
    [name]
  );

  console.log(`  Created new brand: ${name}`);
  return (result as any).lastID;
}

async function collaborationExists(sourceUrl: string): Promise<boolean> {
  const existing = await get('SELECT id FROM collaborations WHERE source_url = ?', [sourceUrl]);
  return !!existing;
}

async function saveCollaboration(
  article: NewsArticle,
  extracted: ExtractedCollaboration
): Promise<boolean> {
  try {
    // Check if already exists
    if (await collaborationExists(article.url)) {
      console.log(`  Skipping (already exists): ${extracted.title}`);
      return false;
    }

    // Get or create brands
    const brandIds: number[] = [];
    for (const brandName of extracted.brands) {
      const brandId = await getOrCreateBrand(brandName);
      brandIds.push(brandId);
    }

    // Insert collaboration
    const result = await run(
      `INSERT INTO collaborations
        (title, summary, source_url, source_name, image_url, published_date, collaboration_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        extracted.title,
        extracted.summary,
        article.url,
        article.source.name,
        article.urlToImage || null,
        article.publishedAt.split('T')[0],
        extracted.collaborationType
      ]
    );

    const collaborationId = (result as any).lastID;

    // Link brands to collaboration
    for (const brandId of brandIds) {
      await run(
        'INSERT INTO collaboration_brands (collaboration_id, brand_id) VALUES (?, ?)',
        [collaborationId, brandId]
      );
    }

    console.log(`  Saved: ${extracted.title} (${extracted.brands.join(' x ')})`);
    return true;
  } catch (error) {
    console.error('Error saving collaboration:', error);
    return false;
  }
}

async function runScraper() {
  console.log('='.repeat(60));
  console.log('CollabIQ News Scraper');
  console.log('='.repeat(60));

  // Initialize database
  await initDatabase();

  let totalArticles = 0;
  let totalCollaborations = 0;
  let savedCount = 0;

  for (const query of SEARCH_QUERIES) {
    console.log(`\nSearching: "${query}"...`);

    const articles = await fetchNews(query);
    totalArticles += articles.length;
    console.log(`  Found ${articles.length} articles`);

    for (const article of articles) {
      // Skip articles without enough content
      if (!article.title || (!article.description && !article.title)) {
        continue;
      }

      // Extract collaboration data using Gemini
      const extracted = await extractCollaborationData(article);

      if (!extracted) continue;

      if (extracted.isCollaboration && extracted.confidence >= 0.7 && extracted.brands.length >= 2) {
        totalCollaborations++;
        const saved = await saveCollaboration(article, extracted);
        if (saved) savedCount++;
      }

      // Rate limiting - small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Delay between search queries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Scraping Complete!');
  console.log(`  Articles processed: ${totalArticles}`);
  console.log(`  Collaborations found: ${totalCollaborations}`);
  console.log(`  New collaborations saved: ${savedCount}`);
  console.log('='.repeat(60));

  process.exit(0);
}

// Run the scraper
runScraper().catch(error => {
  console.error('Scraper failed:', error);
  process.exit(1);
});
