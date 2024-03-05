const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const Link = require('./Link');  
const app = express();
const cors = require('cors');
const urlModule = require('url');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function scrap(url, parent = null, baseUrl) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const base = urlModule.parse(url);
  
      const urls = [];
  
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
          const absoluteUrl = urlModule.resolve(base.href, href);
          const absoluteUrlParsed = urlModule.parse(absoluteUrl);
          if (absoluteUrlParsed.hostname === baseUrl) {
            urls.push(absoluteUrl);
          }
        }
      });
   
      const savedUrls = [];
      for (const u of urls) {
        const existingLink = await Link.findOne({ url: u });
        if (!existingLink) {
          const link = new Link({ url: u });
          if (parent) {
            link.children.push(parent);
          }
          await link.save();
          savedUrls.push(link);
        }
      }
    for (const savedUrl of savedUrls) {
      await scrap(savedUrl.url, savedUrl._id, baseUrl);
    }
  } catch (error) {
    console.error('Error scraping URL:', url, error);
  }
}

module.exports = scrap