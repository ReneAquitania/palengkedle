// @ts-nocheck
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config(); // Force Node to read your .env file

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});