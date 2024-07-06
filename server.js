const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { URL } = require('url');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Change to 3001 or any other available port

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Define supported domains
const supportedDomains = [
  'www.amazon.es',
  'www.amazon.in',        
  'www.amazon.com',
  'www.amazon.co.uk',
  'www.amazon.de',
  'www.amazon.co.jp',
  'www.amazon.fr',
  'www.amazon.it',
  // Add other domains as needed
];

// Serve the form HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle POST request to fetch model URL
app.post('/getmodelurl', async (req, res) => {
  const url = req.body.url.trim();
  let output = '';

  if (!url) {
    output = '<p class="error-message"> *Please enter a valid URL.</p>';
  } else {
    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname;

      // Check if the host is in the supported domains
      if (supportedDomains.includes(host)) {
        const user_agent = 'Amazon.com/28.4.0.100 (Android/14/SomeModel)';
        const cookies = [
          'mobile-device-info=dpi:420.0|w:1080|h:2135',
          'amzn-app-id=Amazon.com/28.4.0.100/18.0.357239.0',
          'amzn-app-ctxt=1.8%20%7B%22an%22%3A%22Amazon.com%22%2C%22av%22%3A%2228.4.0.100%22%2C%22xv%22%3A%221.15.0%22%2C%22os%22%3A%22Android%22%2C%22ov%22%3A%2214%22%2C%22cp%22%3A788760%2C%22uiv%22%3A4%2C%22ast%22%3A3%2C%22nal%22%3A%221%22%2C%22di%22%3A%7B%22pr%22%3A%22OnePlus7%22%2C%22md%22%3A%22GM1901%22%2C%22v%22%3A%22OnePlus7%22%2C%22mf%22%3A%22OnePlus%22%2C%22dsn%22%3A%2245ae2d3b4efa48a399e0f0a324adbaa7%22%2C%22dti%22%3A%22A1MPSLFC7L5AFK%22%2C%22ca%22%3A%22Carrier%22%2C%22ct%22%3A%22WIFI%22%7D%2C%22dm%22%3A%7B%22w%22%3A1080%2C%22h%22%3A2135%2C%22ld%22%3A2.625%2C%22dx%22%3A403.4110107421875%2C%22dy%22%3A409.90301513671875%2C%22pt%22%3A0%2C%22pb%22%3A78%7D%2C%22is%22%3A%22com.android.vending%22%2C%22msd%22%3A%22' + host + '%22%7D',
        ].join('; ');

        const headers = {
          'User-Agent': user_agent,
          'Cookie': cookies,
        };

        const response = await axios.get(url, { headers });
        const result = response.data;

        if (result.includes('href="/view-3d')) {
          const model_url = result.split('href="/view-3d')[1].split('"')[0];
          output = `V3D Link: <a target="_blank" href="https://${host}/view-3d${model_url}">https://${host}/view-3d${model_url}</a> <i> (The zip file with the model can be found in the network tab in Developer tools)*</i>`;
        } else {
          output = '<p class="error-message"> *No V3D found.</p>';
        }
      } else {
        output = '<p class="error-message"> *Unsupported URL. Make sure it is a valid Amazon product URL.</p>';
      }
    } catch (error) {
      output = `<p class="error-message">*Error retrieving the URL: ${error.message}</p>`;
    }
  }

  res.send(output);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:3000`);
});
