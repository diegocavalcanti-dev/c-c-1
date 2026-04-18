import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log('📝 Gerando sitemap...');
  
  try {
    // Conectar ao banco de dados
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'gateway04.us-east-1.prod.aws.tidbcloud.com',
      user: process.env.DB_USER || '3eWBp8BqHyRzbWD.root',
      password: process.env.DB_PASSWORD || 'e7296lxAie6zodTXB5uA',
      database: process.env.DB_NAME || 'YtDToJUwGVJg8r6oZPwiJF',
      ssl: {
        rejectUnauthorized: false
      },
    });

    // Buscar todos os posts publicados
    const [posts] = await connection.execute(
      'SELECT slug, updatedAt, createdAt FROM posts WHERE status = ? ORDER BY createdAt DESC',
      ['published']
    );

    await connection.end();

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
      { url: '/busca', changefreq: 'weekly', priority: 0.6 },
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
    // Não falhar o build se o sitemap não puder ser gerado
    // Criar um sitemap vazio como fallback
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
