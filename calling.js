const express = require('express');
const bodyParser = require('body-parser');
const scrap = require('./scraper1'); 
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const DB = process.env.DATABASE;
const Link_data = require('./Link');
const PORT = process.env.PORT;
require('./pdfGenerator')


const app = express();
app.use(bodyParser.json());
require('./Link');
app.use(cors())
app.use(bodyParser.json());

mongoose.connect(DB  , {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');



const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
mongoose.set('strictQuery', false);

async function generatePDF() {
  try {
    const data = await Link_data.find(); 

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('data.pdf')); 

    doc.fontSize(16).text('Data from MongoDB', { align: 'center' });
    doc.moveDown();

    data.forEach((item, index) => {
      doc.fontSize(12).text(`#${index + 1} - URL: ${item.url}`);
      doc.moveDown();
    });

    doc.end();
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

app.get('/generate-pdf', (req, res) => {
  const filePath = path.join(__dirname, 'data.pdf');
  res.download(filePath, 'data.pdf', (err) => {
    if (err) {
      console.error('Error downloading PDF:', err);
      res.status(500).json({ error: 'Failed to download PDF' });
    } else {
      console.log('PDF downloaded successfully');
    }
  });
});

generatePDF(); 


app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const urls = await scrap(url, null, new URL(url).hostname);
    res.json({ urls });
  } catch (error) {
    console.error('Error scraping URL:', url, error);
    res.status(500).json({ error: 'An error occurred while scraping URL' });
  }
});

app.get('/scrape', (req, res)=>{
    Link_data.find()
    .then(Link_data => res.json(Link_data))
    .catch(err => res.json(err))
})

app.listen(PORT, () => {
  console.log('Server running on port 5000');
});

})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});