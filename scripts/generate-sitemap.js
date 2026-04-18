import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log('📝 Gerando sitemap...');
  
  try {
    // Gerar URLs estáticas apenas (sitemap dinâmico será gerado no servidor)
    const staticUrls = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/busca', changefreq: 'weekly', priority: 0.6 },
    ];
    
    // Gerar XML do sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(url => `  <url>
    <loc>https://www.cenasdecombate.com${url.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
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
    console.log(`✅ Sitemap estático gerado com sucesso!`);
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
    // Não falhar o build
    try {
      const distPublicDir = path.join(__dirname, '..', 'dist', 'public');
      if (!fs.existsSync(distPublicDir)) {
        fs.mkdirSync(distPublicDir, { recursive: true });
      }
      
      const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.cenasdecombate.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
      
      fs.writeFileSync(path.join(distPublicDir, 'sitemap.xml'), fallbackSitemap, 'utf-8');
      console.log('✅ Sitemap fallback criado');
    } catch (fallbackError) {
      console.error('❌ Erro ao criar sitemap fallback:', fallbackError);
    }
  }
}

generateSitemap();
