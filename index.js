const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const app = express();
const port = 3000;

const lmStudioUrl = 'http://localhost:1234';

async function generateText(prompt) {
  try {
    const response = await axios.post(`${lmStudioUrl}/v1/chat/completions`, {
      model: 'mistral-7b-instruct-v0.1.Q3_K_L.gguf',
      prompt: prompt,
      messages: [{role: 'user', content: prompt}],
    });
    console.log(response.data.choices[0].message);
    fs.appendFileSync('output.txt', JSON.stringify(response.data.choices[0].message,0,2) + "\n");
  } catch (error) {
    console.error('Error generating text:', error);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptLoop() {
  rl.question('Enter prompt: ', function(input) {
    if(input.toLowerCase() === 'exit') {
      rl.close();
    } else {
      generateText(input).then(() => {
        promptLoop();
      });
    }
  });
}

promptLoop(); // Initial call to start the prompting loop

app.get('/', (req, res) => {
  fs.readFile('output.txt', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading output file');
      return;
    }
    res.send(`<html><body><pre>${data}</pre></body></html>`);
  });
});

app.listen(port, () => {
  console.log(`Output display app listening at http://localhost:${port}`);
});