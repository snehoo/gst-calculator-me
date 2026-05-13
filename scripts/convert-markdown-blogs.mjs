import fs from "node:fs/promises";
import path from "node:path";

const blogDir = "/Users/snehoomac/snehoo/AI/ProjectFiles/gstblogs";
const files = [
  "01-how-to-file-gstr-1.md",
  "02-how-to-file-gstr-3b.md",
  "03-gstr-1-vs-gstr-3b.md",
  "04-gst-return-due-dates-2025.md",
  "05-gst-registration-process-india.md",
  "06-hsn-code-list-india-2025.md",
  "07-gst-late-fee-penalty-guide.md",
  "08-gst-on-real-estate-india.md",
  "09-gst-for-amazon-flipkart-sellers.md",
];

async function main() {
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = await fs.readFile(filePath, "utf-8");

    // Extract frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!fmMatch) {
      console.error(`No frontmatter found in ${file}`);
      continue;
    }

    const fm = {};
    fmMatch[1].split("\n").forEach((line) => {
      const [key, ...valParts] = line.split(": ");
      fm[key.trim()] = valParts.join(": ").replace(/^"/, "").replace(/"$/, "");
    });

    const body = content.replace(/^---\n[\s\S]*?\n---\n/, "");

    console.log(`\n✅ ${file}`);
    console.log(`   slug: ${fm.slug}`);
    console.log(`   title: ${fm.title}`);
    console.log(`   readTime: ${fm.readTime}`);
  }
}

main().catch(console.error);
