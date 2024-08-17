const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const app = express();
const axios = require('axios');


app.use(express.json());
app.use(cors({
    origin: '*'
}));


app.get('/', function (req, res) {
  res.sendFile(filePath);
});
app.post('/api', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Please provide a prompt.' });
    }

    // Construct the URL for the search
    const newPrompt = prompt.includes(' ') ? prompt.split(' ').join('-') : prompt;
    const url = `https://4kwallpapers.com/search/?q=${newPrompt}#gsc.tab=1&gsc.q=${newPrompt}&gsc.page=1`;
  
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const $ = cheerio.load(response.data);
        const $cardsData = $('.col-right').html();
      // const $cardsData = $('.wallpapers__item').html();
        // Use the appropriate selector for your target elements
       
        let vectorData = [];
        const imgDownloadURI = 'https://4kwallpapers.com/images/wallpapers/';
        $('.wallpapers__item').each((index, element) => {
          const link = $(element).find('a').attr('href');
          const text = $(element).find('a').text();
          const src = $(element).find('img').attr('src');
          const parts = link.split('/');
          const imgId = parts[parts.length - 1].split('html').join('jpg');
          const imgDownload = imgDownloadURI + imgId
          vectorData.push({link, src, imgId, imgDownload, text});
          
          if (vectorData.length >= 10) {
              return false; // break the loop
          }
      });
        
        res.json({vectorData: vectorData});
     
        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wallpapers</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
            <div class="wallpapers">
        `;
        
   vectorData.forEach((data)=> {
   html += `<a href=${imgDownloadURI + data.imgId}><img src=${data.src} /></a>`
   })
   

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
