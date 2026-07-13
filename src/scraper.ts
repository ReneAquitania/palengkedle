import * as dotenv from 'dotenv';
dotenv.config(); 

import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function runScraper() {
  console.log("🚀 Starting the SM Markets Multi-Category Scraper...");
  
  // Fetch existing names before scraping
  const existingRecords = await prisma.product.findMany({
    select: { name: true }
  });
  const existingNames = new Set(existingRecords.map(record => record.name));

  const categoryUrls = [
    'https://smmarkets.ph/stationery.html',
    'https://smmarkets.ph/fresh-produce.html',
    'https://smmarkets.ph/fresh-meat-seafoods.html',
    'https://smmarkets.ph/frozen-goods.html',
    'https://smmarkets.ph/ready-to-heat-eat-items.html',
    'https://smmarkets.ph/ready-to-cook.html',
    'https://smmarkets.ph/chilled-dairy-items.html',
    'https://smmarkets.ph/bakery.html',
    'https://smmarkets.ph/international-goods.html',
    'https://smmarkets.ph/pantry.html',
    'https://smmarkets.ph/snacks.html',
    'https://smmarkets.ph/beverage.html',
    'https://smmarkets.ph/health-beauty.html',
    'https://smmarkets.ph/baby-kids.html',
    'https://smmarkets.ph/home-care.html',
    'https://smmarkets.ph/pet-care.html',
    'https://smmarkets.ph/diy-hardware.html',
    'https://smmarkets.ph/home-appliances-essentials.html',
    'https://smmarkets.ph/health-hygiene-essentials.html',
  ];
  
  const TARGET_ITEMS_PER_CATEGORY = 3; 
  let allScrapedProducts: any[] = [];

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--ignore-certificate-errors'] 
  });
  const page = await browser.newPage();

  try {
    for (const url of categoryUrls) {
      console.log(`\nScraping category: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Grab a large "buffer" of items from the page (to be filtered in Node)
      const scrapedBuffer = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.category-root-2k1'); 
        const items: any[] = [];

        // Grab everything on the page
        for (let i = 0; i < productElements.length; i++) {
          const el = productElements[i];
          if (!el) continue; 
          
          const name = el.querySelector('.item-name-23v')?.textContent?.trim();
          const priceNode = el.querySelector('.item-oldPrice-2ww .item-price-xqn') || el.querySelector('.item-price-xqn');
          const priceText = priceNode?.textContent?.replace(/[^\d.]/g, ''); 
          const imageUrl = el.querySelector('img.image-loaded-ktU')?.getAttribute('src') || el.querySelector('img')?.getAttribute('src');

          if (name && priceText && imageUrl) {
            items.push({ name, price: parseFloat(priceText), imageUrl });
          }
        }
        return items;
      });

      // Filter out duplicates until we get 3 unique items
      let addedFromThisCategory = 0;
      for (const item of scrapedBuffer) {
        if (!existingNames.has(item.name)) {
          allScrapedProducts.push(item);
          existingNames.add(item.name); // Mark as seen so it won't be grabbed again from a different category
          addedFromThisCategory++;
        }

        // Stop looking once we have exactly 3 new items
        if (addedFromThisCategory === TARGET_ITEMS_PER_CATEGORY) {
          break; 
        }
      }

      console.log(`Secured ${addedFromThisCategory} brand new unique items from this category.`);
    }

    if (allScrapedProducts.length === 0) {
      console.log("\nNo new items found across any categories. Exiting.");
      return;
    }

    // Shuffle the unique master list so categories are randomized
    console.log("\nShuffling the product deck...");
    allScrapedProducts = shuffleArray(allScrapedProducts);

    // Find the product with the most recent gameDate in our database
    const latestProduct = await prisma.product.findFirst({
      orderBy: { gameDate: 'desc' }
    });

    let nextAvailableDate = latestProduct 
      ? new Date(latestProduct.gameDate) 
      : new Date();
    nextAvailableDate.setUTCHours(0, 0, 0, 0);

    // Loop through the shuffled items and save them sequentially
    console.log(`Saving ${allScrapedProducts.length} randomized products to the database...`);
    let savedCount = 0;
    
    for (const item of allScrapedProducts) {
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);

      await prisma.product.create({
        data: {
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          gameDate: new Date(nextAvailableDate)
        }
      });
      savedCount++;
    }

    console.log(`\nSuccess! Scheduled ${savedCount} new randomized products into the future.`);

  } catch (error) {
    console.error("Scraping failed:", error);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScraper();