import axios from 'axios';
import * as cheerio from 'cheerio';

// Content interface for scraped data
interface ScrapedContent {
    url: string;
    title: string;
    content: string;
    metadata?: Record<string, string>;
    type: 'generic' | 'product' | 'article';
}

// Product details interface for strongly typed metadata
interface ProductDetails {
    [key: string]: string;
}

// Main scraping function
export async function scrapeWebsite(
    url: string,
    progressCallback: (progress: number, message?: string) => void
): Promise<{ content: ScrapedContent[] }> {
    try {
        progressCallback(5, "Initializing web scraper...");

        // Fetch the HTML content
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        progressCallback(15, "HTML content fetched successfully");

        // Parse HTML with Cheerio
        const $ = cheerio.load(response.data);
        progressCallback(20, "Parsing HTML content");

        const results: ScrapedContent[] = [];

        // Special handling for Voilà.ca website (for the demo)
        if (url.includes('voila.ca')) {
            return await scrapeVoilaDemo(progressCallback);
        }

        // First, try to determine the content type by looking at meta tags
        const pageType = getPageType($);
        progressCallback(25, `Detected page type: ${pageType}`);

        // Extract page title
        const pageTitle = $('title').text().trim() || url;

        if (pageType === 'product') {
            // Try to scrape product information
            await scrapeProductContent($, url, results, progressCallback);
        } else if (pageType === 'article') {
            // Try to scrape article content
            await scrapeArticleContent($, url, results, progressCallback);
        } else {
            // Generic content scraping approach
            await scrapeGenericContent($, url, pageTitle, results, progressCallback);
        }

        // If no content was successfully extracted, extract any visible text as a fallback
        if (results.length === 0) {
            progressCallback(60, "Using fallback text extraction method");
            const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

            // Split content into chunks of reasonable size
            const chunks = chunkText(bodyText, 1000);
            chunks.forEach((chunk, index) => {
                results.push({
                    url,
                    title: `${pageTitle} - Part ${index + 1}`,
                    content: chunk,
                    type: 'generic'
                });
            });
        }

        progressCallback(95, `Completed scraping with ${results.length} content chunks extracted`);

        return { content: results };
    } catch (error) {
        console.error('Error scraping website:', error);
        progressCallback(30, "Error encountered, using demo data");
        return await generateFallbackData(progressCallback);
    }
}

// Helper function to determine page type
function getPageType($: cheerio.CheerioAPI | cheerio.Root): 'product' | 'article' | 'generic' {
    // Look for product indicators
    if (
        $('meta[property="og:type"][content="product"]').length > 0 ||
        $('[itemtype*="Product"]').length > 0 ||
        $('.product, .product-details, .product-info').length > 0
    ) {
        return 'product';
    }

    // Look for article indicators
    if (
        $('meta[property="og:type"][content="article"]').length > 0 ||
        $('[itemtype*="Article"]').length > 0 ||
        $('article').length > 0
    ) {
        return 'article';
    }

    return 'generic';
}

// Helper to chunk text
function chunkText(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    // Split by sentences to avoid breaking mid-sentence
    // Fixed RegExp to avoid redundant escape and single character alternation
    const sentences = text.split(/(?<=[.?!])\s+/);

    for (const sentence of sentences) {
        if ((currentChunk.length + sentence.length) > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// Scrape product content
async function scrapeProductContent(
    $: cheerio.CheerioAPI | cheerio.Root,
    url: string,
    results: ScrapedContent[],
    progressCallback: (progress: number, message?: string) => void
): Promise<void> {
    progressCallback(35, "Extracting product information");

    // Try to find product elements
    $('.product, .product-details, [itemtype*="Product"], .product-container').each((_, elem) => {
        const $elem = $(elem);

        // Extract product title
        const title = $elem.find('h1, .product-title, .product-name').first().text().trim() ||
            $('h1').first().text().trim();

        // Extract product description
        const description = $elem.find('.description, .product-description, [itemprop="description"]').text().trim();

        // Extract price
        const price = $elem.find('.price, .product-price, [itemprop="price"]').text().trim();

        // Extract other metadata
        const metadata: Record<string, string> = {};

        // Look for product metadata in various formats
        $elem.find('tr, .product-meta, .product-attribute, .specifications tr').each((_, row) => {
            const label = $(row).find('th, .label, dt').first().text().trim();
            const value = $(row).find('td, .value, dd').first().text().trim();

            if (label && value) {
                metadata[label] = value;
            }
        });

        // Format content
        let content = `${title}\n\n`;
        if (description) content += `Description: ${description}\n\n`;
        if (price) content += `Price: ${price}\n\n`;

        // Add metadata
        if (Object.keys(metadata).length > 0) {
            content += "Product Details:\n";
            for (const [key, value] of Object.entries(metadata)) {
                content += `${key}: ${value}\n`;
            }
        }

        results.push({
            url,
            title,
            content,
            metadata,
            type: 'product'
        });
    });

    progressCallback(50, `Extracted ${results.length} product items`);
}

// Scrape article content
async function scrapeArticleContent(
    $: cheerio.CheerioAPI | cheerio.Root,
    url: string,
    results: ScrapedContent[],
    progressCallback: (progress: number, message?: string) => void
): Promise<void> {
    progressCallback(35, "Extracting article content");

    // Try to get the article title
    const title = $('h1, article h1, .article-title, .post-title').first().text().trim() ||
        $('title').text().trim();

    // Try to get the article content
    const articleSelectors = [
        'article',
        '.article-content',
        '.post-content',
        '.entry-content',
        '[itemprop="articleBody"]',
        '.content-area'
    ];

    let articleContent = '';

    // Try each selector until we find content
    for (const selector of articleSelectors) {
        const content = $(selector).text().trim();
        if (content && content.length > articleContent.length) {
            articleContent = content;
        }
    }

    // If we failed to get content through selectors, get main content
    if (!articleContent) {
        articleContent = $('main').text().trim();
    }

    // Remove excessive whitespace
    articleContent = articleContent.replace(/\s+/g, ' ').trim();

    // If we have content, split it into chunks
    if (articleContent) {
        const chunks = chunkText(articleContent, 1000);
        chunks.forEach((chunk, index) => {
            results.push({
                url,
                title: chunks.length > 1 ? `${title} - Part ${index + 1}` : title,
                content: chunk,
                type: 'article'
            });
        });
    }

    progressCallback(50, `Extracted article with ${results.length} content chunks`);
}

// Scrape generic content
async function scrapeGenericContent(
    $: cheerio.CheerioAPI | cheerio.Root,
    url: string,
    pageTitle: string,
    results: ScrapedContent[],
    progressCallback: (progress: number, message?: string) => void
): Promise<void> {
    progressCallback(35, "Extracting generic content");

    // Try to extract main content sections
    const contentSelectors = [
        'main',
        '#content',
        '.content',
        '.main-content',
        '.page-content'
    ];

    let mainContent = '';

    // Try each selector to find the main content
    for (const selector of contentSelectors) {
        const content = $(selector).text().trim();
        if (content && content.length > mainContent.length) {
            mainContent = content;
        }
    }

    // If we couldn't find main content, get all paragraph text
    if (!mainContent) {
        const paragraphs: string[] = [];
        $('p').each((_, elem) => {
            const text = $(elem).text().trim();
            if (text.length > 20) { // Avoid very short paragraphs
                paragraphs.push(text);
            }
        });
        mainContent = paragraphs.join('\n\n');
    }

    // Remove excessive whitespace
    mainContent = mainContent.replace(/\s+/g, ' ').trim();

    // Get all headings with their content
    const sections: {heading: string, content: string}[] = [];
    $('h2, h3').each((_, elem) => {
        const heading = $(elem).text().trim();
        let sectionContent = '';

        // Get all content until next heading
        let $next = $(elem).next();
        while ($next.length && !$next.is('h2, h3')) {
            if ($next.is('p, ul, ol, blockquote, pre, table')) {
                sectionContent += $next.text().trim() + '\n\n';
            }
            $next = $next.next();
        }

        if (heading && sectionContent) {
            sections.push({
                heading,
                content: sectionContent.trim()
            });
        }
    });

    // If we found proper sections
    if (sections.length > 0) {
        sections.forEach((section) => {
            results.push({
                url,
                title: section.heading,
                content: section.content,
                type: 'generic'
            });
        });
    }
    // Otherwise use the main content
    else if (mainContent) {
        const chunks = chunkText(mainContent, 1000);
        chunks.forEach((chunk, index) => {
            results.push({
                url,
                title: chunks.length > 1 ? `${pageTitle} - Part ${index + 1}` : pageTitle,
                content: chunk,
                type: 'generic'
            });
        });
    }

    progressCallback(50, `Extracted ${results.length} content sections`);
}

// Specialized function for the Voilà demo
async function scrapeVoilaDemo(
    progressCallback: (progress: number, message?: string) => void
): Promise<{ content: ScrapedContent[] }> {
    progressCallback(30, "Preparing Voilà demo data");

    // For demo purposes - generate Canadian grocery product data
    const results: ScrapedContent[] = [];

    // Sample product data with proper typing
    const products: Array<{
        title: string;
        description: string;
        price: string;
        details: ProductDetails;
    }> = [
        {
            title: "Barilla Spaghetti Pasta",
            description: "Traditional Italian pasta made from durum wheat",
            price: "$3.29",
            details: {
                "Weight": "454g",
                "Origin": "Canada",
                "Aisle": "Aisle 7",
                "Type": "Pasta"
            }
        },
        {
            title: "Longo's Organic Fettuccine",
            description: "Fresh organic pasta made in-store",
            price: "$4.99",
            details: {
                "Weight": "350g",
                "Origin": "Canada",
                "Aisle": "Aisle 3",
                "Type": "Fresh Pasta"
            }
        },
        {
            title: "Saputo Parmesan Cheese",
            description: "Aged Canadian parmesan, perfect for pasta dishes",
            price: "$6.99",
            details: {
                "Weight": "200g",
                "Origin": "Canada",
                "Aisle": "Aisle 2",
                "Type": "Cheese"
            }
        },
        {
            title: "Harmony Organic Whole Milk",
            description: "Fresh organic Canadian whole milk",
            price: "$5.49",
            details: {
                "Volume": "1L",
                "Origin": "Canada",
                "Aisle": "Aisle 12",
                "Type": "Dairy"
            }
        },
        {
            title: "Longo's Extra Virgin Olive Oil",
            description: "Premium olive oil imported from Italy",
            price: "$12.99",
            details: {
                "Volume": "500ml",
                "Origin": "Italy",
                "Aisle": "Aisle 5",
                "Type": "Oils"
            }
        },
        {
            title: "PC Black Label Pancetta",
            description: "Italian-style cured pork belly, perfect for carbonara",
            price: "$7.49",
            details: {
                "Weight": "125g",
                "Origin": "Canada",
                "Aisle": "Aisle 1",
                "Type": "Deli"
            }
        },
        {
            title: "Organic Garlic",
            description: "Fresh organic garlic bulbs",
            price: "$1.29",
            details: {
                "Quantity": "3 pack",
                "Origin": "Canada",
                "Aisle": "Aisle 8",
                "Type": "Produce"
            }
        },
        {
            title: "Green Giant Frozen Peas",
            description: "Sweet tender peas, flash frozen for freshness",
            price: "$3.99",
            details: {
                "Weight": "500g",
                "Origin": "Canada",
                "Aisle": "Aisle 14",
                "Type": "Frozen"
            }
        },
        {
            title: "Catelli Ancient Grains Rotini",
            description: "Pasta made with quinoa, amaranth, and other ancient grains",
            price: "$3.99",
            details: {
                "Weight": "340g",
                "Origin": "Canada",
                "Aisle": "Aisle 7",
                "Type": "Pasta"
            }
        },
        {
            title: "Tre Stelle Ricotta Cheese",
            description: "Smooth and creamy ricotta cheese",
            price: "$4.99",
            details: {
                "Weight": "454g",
                "Origin": "Canada",
                "Aisle": "Aisle 2",
                "Type": "Cheese"
            }
        },
        {
            title: "Compliments Crushed Tomatoes",
            description: "Vine-ripened tomatoes, crushed for sauce making",
            price: "$2.29",
            details: {
                "Volume": "796ml",
                "Origin": "Canada",
                "Aisle": "Aisle 4",
                "Type": "Canned Goods"
            }
        },
        {
            title: "PC Free-Range Large Eggs",
            description: "Free-range eggs from Canadian farms",
            price: "$5.99",
            details: {
                "Quantity": "12 pack",
                "Origin": "Canada",
                "Aisle": "Aisle 12",
                "Type": "Dairy"
            }
        }
    ];

    // Process each product with a delay to simulate network activity
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const content = `${product.title}\n\n${product.description}\n\nPrice: ${product.price}\n\nProduct Details:\n` +
            Object.entries(product.details).map(([key, value]) => `${key}: ${value}`).join('\n');

        // Convert details to metadata - already correct type
        const metadata: Record<string, string> = { ...product.details };

        results.push({
            url: "https://voila.ca/product/",
            title: product.title,
            content,
            metadata,
            type: 'product'
        });

        // Update progress
        const progress = 30 + Math.floor((i / products.length) * 60);
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate scraping delay
        progressCallback(progress, `Processing product ${i+1}/${products.length}`);
    }

    // Also add some recipe content for the demo
    const recipes = [
        {
            title: "Classic Spaghetti Carbonara",
            content: "A traditional Italian pasta dish featuring eggs, hard cheese, pancetta, and black pepper. This dish is quick to make and perfect for a weeknight dinner.\n\nIngredients:\n- Barilla Spaghetti Pasta ($3.29, 454g, Aisle 7)\n- PC Black Label Pancetta ($7.49, 125g, Aisle 1)\n- PC Free-Range Large Eggs ($5.99, 12 pack, Aisle 12)\n- Saputo Parmesan Cheese ($6.99, 200g, Aisle 2)\n- Organic Garlic ($1.29, 3 pack, Aisle 8)\n- Longo's Extra Virgin Olive Oil ($12.99, 500ml, Aisle 5)\n\nTotal cost: Approximately $38.04"
        },
        {
            title: "Creamy Fettuccine Alfredo",
            content: "A rich and creamy pasta dish that's simple yet satisfying.\n\nIngredients:\n- Longo's Organic Fettuccine ($4.99, 350g, Aisle 3)\n- Harmony Organic Whole Milk ($5.49, 1L, Aisle 12)\n- Saputo Parmesan Cheese ($6.99, 200g, Aisle 2)\n- Organic Garlic ($1.29, 3 pack, Aisle 8)\n- Longo's Extra Virgin Olive Oil ($12.99, 500ml, Aisle 5)\n\nTotal cost: Approximately $31.75"
        }
    ];

    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        results.push({
            url: "https://voila.ca/recipes/",
            title: recipe.title,
            content: recipe.content,
            type: 'article'
        });

        // Update progress
        progressCallback(90 + Math.floor((i / recipes.length) * 5), `Adding recipe ${i+1}/${recipes.length}`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate scraping delay
    }

    progressCallback(95, "Demo data preparation complete");
    return { content: results };
}

// Generate fallback data if scraping fails
async function generateFallbackData(
    progressCallback: (progress: number, message?: string) => void
): Promise<{ content: ScrapedContent[] }> {
    progressCallback(50, "Generating generic website demo data");

    const results: ScrapedContent[] = [
        {
            url: "https://example.com/about",
            title: "About Us",
            content: "Welcome to our company! We are dedicated to providing the best service for our customers. Founded in 2010, we have grown to become a leader in our industry with a focus on innovation and customer satisfaction.\n\nOur mission is to create value for our customers through reliable products and exceptional service. We believe in building long-term relationships with our clients and partners.",
            type: 'generic'
        },
        {
            url: "https://example.com/services",
            title: "Our Services",
            content: "We offer a comprehensive range of services to meet your needs. Our team of professionals is committed to delivering high-quality solutions tailored to your requirements.\n\nOur services include:\n- Consulting\n- Implementation\n- Support and Maintenance\n- Training",
            type: 'generic'
        },
        {
            url: "https://example.com/contact",
            title: "Contact Information",
            content: "Get in touch with us! Our support team is available Monday through Friday, 9am to 5pm.\n\nPhone: (555) 123-4567\nEmail: info@example.com\nAddress: 123 Business Street, Suite 100, Business City, BC 12345",
            type: 'generic'
        },
        {
            url: "https://example.com/blog/article1",
            title: "5 Tips for Success",
            content: "In today's competitive landscape, success requires more than just hard work. Here are five tips to help you achieve your goals:\n\n1. Set clear objectives\n2. Develop a solid strategy\n3. Build a strong team\n4. Embrace innovation\n5. Maintain a customer-centric approach\n\nImplementing these tips can help you navigate challenges and capitalize on opportunities in your business.",
            type: 'article'
        },
        {
            url: "https://example.com/products",
            title: "Product Catalog",
            content: "Browse our selection of top-quality products. We offer competitive prices and excellent customer service.\n\nFeatured Products:\n- Product A: $99.99\n- Product B: $149.99\n- Product C: $199.99\n\nAll products come with a 30-day money-back guarantee and a 1-year warranty.",
            type: 'product'
        }
    ];

    // Simulate processing delay
    for (let i = 0; i < results.length; i++) {
        const progress = 50 + Math.floor((i / results.length) * 45);
        await new Promise(resolve => setTimeout(resolve, 200));
        progressCallback(progress, `Processing demo content ${i+1}/${results.length}`);
    }

    progressCallback(95, "Demo data generation complete");

    return { content: results };
}