#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const blogDir = "/Users/snehoomac/snehoo/AI/ProjectFiles/gstblogs";

// Remaining blogs to add
const files = [
  "03-gstr-1-vs-gstr-3b.md",
  "04-gst-return-due-dates-2025.md",
  "05-gst-registration-process-india.md",
  "06-hsn-code-list-india-2025.md",
  "07-gst-late-fee-penalty-guide.md",
  "08-gst-on-real-estate-india.md",
  "09-gst-for-amazon-flipkart-sellers.md",
];

async function main() {
  console.log("Remaining blog posts to add:");
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      if (fmMatch) {
        const fm = {};
        fmMatch[1].split("\n").forEach((line) => {
          const [key, ...valParts] = line.split(": ");
          fm[key.trim()] = valParts.join(": ").replace(/^"/, "").replace(/"$/, "");
        });
        console.log(`✅ ${file} → slug: "${fm.slug}"`);
      }
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
    }
  }
  console.log("\nTo add these blogs, use the Add Blog Posts to TypeScript guide.");
}

main();
