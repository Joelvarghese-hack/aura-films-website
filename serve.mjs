import { createServer } from "http";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  // EXTENSIONLESS: mirror Cloudflare Pages, which serves /gallery from gallery.html
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  // Cloudflare Pages serves /gallery from gallery.html; mirror that locally.
  if (!extname(urlPath)) {
    const withHtml = join(__dirname, urlPath + ".html");
    if (existsSync(withHtml)) urlPath = urlPath + ".html";
  }

  const filePath = join(__dirname, urlPath);

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`404 — Not found: ${urlPath}`);
  }
});

server.listen(PORT, () => {
  console.log(`Aura Films dev server running at http://localhost:${PORT}`);
});
