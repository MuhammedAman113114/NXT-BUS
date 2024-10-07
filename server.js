import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Route to fetch data and generate sitemap.xml dynamically
app.get('/sitemap.xml', async (req, res) => {
    try {
        // Fetch data from Google Sheets
        const response = await fetch('https://opensheet.elk.sh/1tj1hdKsm3B_Yv9dAIHBNUqAxEtdVmUNfNVN-YT-9VRE/Sheet1!A1:Z99999');
        const data = await response.json();

        // Start building the sitemap XML
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image.v1"\n';
        sitemap += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
        sitemap += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap-image.v1 http://www.sitemaps.org/schemas/sitemap-image.v1.xsd">\n';

        // Generate URL entries from the fetched data
        data.forEach(item => {
            const url = item['URL']; // Replace with your actual column name
            if (url) {
                sitemap += '    <url>\n';
                sitemap += `        <loc>${url}</loc>\n`;
                sitemap += '    </url>\n';
            } else {
                console.warn('Missing URL for item:', item);
            }
        });

        sitemap += '</urlset>';

        // Set the response header and send the sitemap XML
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error generating sitemap.');
    }
});

// Route to serve the React frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
