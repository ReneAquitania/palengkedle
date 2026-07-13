import 'dotenv/config'; // Guarantees .env is loaded at runtime
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// GET: Fetch the daily product
app.get('/api/daily-product', async (req, res) => {
  try {
    // Get current date and lock it exactly to midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 

    // Get product assigned to today
    const product = await prisma.product.findFirst({
      where: {
        gameDate: today
      }
    });

    // Fallback if DB has no product for today
    if (!product) {
      return res.status(404).json({ 
        error: "No product scheduled for today! Please use the admin route to add one." 
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch the daily product" });
  }
});

// --- ADMIN ROUTE: Add a new product ---
app.post('/api/admin/products', async (req, res) => {
  try {
    // Unpack data sent in the request body
    const { name, imageUrl, price, gameDate } = req.body;

    if (!name || !imageUrl || price === undefined || !gameDate) {
      return res.status(400).json({ error: "Missing required fields! Please provide name, imageUrl, price, and gameDate." });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name,
        imageUrl: imageUrl,
        price: parseFloat(price), 
        gameDate: new Date(gameDate),
      }
    });

    res.status(201).json(newProduct);

  } catch (error) {
    console.error("Admin Route Error:", error);
    res.status(500).json({ error: "Failed to add the product to the database." });
  }
});

// Start the server
const PORT = 5001; 
app.listen(PORT, () => {
  console.log(`Server is running beautifully on http://localhost:${PORT}`);
});