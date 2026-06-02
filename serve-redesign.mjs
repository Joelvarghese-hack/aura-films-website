import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIME = { ".html":"text/html",".css":"text/css",".js":"text/javascript",".mjs":"text/javascript",
  ".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",
  ".gif":"image/gif",".svg":"image/svg+xml",".webp":"image/webp",".ico":"image/x-icon",
  ".woff":"font/woff",".woff2":"font/woff2",".ttf":"font/ttf",".mp4":"video/mp4" };
const PORT = process.env.PORT || 8090;

const server = createServer(async (req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  // Canonical base is /redesign/ so relative links resolve across pages
  if (urlPath === "/" || urlPath === "") { res.writeHead(302,{Location:"/redesign/"}); res.end(); return; }
  if (urlPath === "/redesign" || urlPath === "/redesign/") urlPath = "/redesign/index.html";

  const filePath = join(__dirname, urlPath);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`404 — ${urlPath}`);
  }
});
server.listen(PORT, () => console.log(`Aura Films REDESIGN running at http://localhost:${PORT}`));
