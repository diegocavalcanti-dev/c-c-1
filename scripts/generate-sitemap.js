import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log('📝 Gerando sitemap...');
  
  try {
    // Buscar todos os posts da API
    const baseUrl = "https://www.cenasdecombate.com/api/trpc/posts.list";
    const input = encodeURIComponent(JSON.stringify({ "0": { "json": { "page": 1, "limit": 1000 } } }));
    const url = `${baseUrl}?batch=1&input=${input}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const posts = data[0].result.data.json.posts;
    
    // Gerar URLs do sitemap
    const urls = posts.map(post => ({
      url: `/${post.slug}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: post.updatedAt || post.createdAt
    }));
    
    // Adicionar URLs estáticas
    const staticUrls = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/search', changefreq: 'weekly', priority: 0.6 },
    ];
    
    const allUrls = [...staticUrls, ...urls];
    
    // Gerar XML do sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>https://www.cenasdecombate.com${url.url}</loc>
    <lastmod>${url.lastmod ? new Date(url.lastmod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    // Salvar na pasta dist/public (onde será servido)
    const distPublicDir = path.join(__dirname, '..', 'dist', 'public');
    const sitemapPath = path.join(distPublicDir, 'sitemap.xml');
    
    // Garantir que a pasta existe
    if (!fs.existsSync(distPublicDir)) {
      fs.mkdirSync(distPublicDir, { recursive: true });
    }
    
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
    console.log(`✅ Sitemap gerado com sucesso! ${posts.length} posts encontrados.`);
    console.log(`📁 Salvo em: ${sitemapPath}`);
    
    // Gerar robots.txt
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://www.cenasdecombate.com/sitemap.xml`;
    
    const robotsPath = path.join(distPublicDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt, 'utf-8');
    console.log(`✅ robots.txt gerado!`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();