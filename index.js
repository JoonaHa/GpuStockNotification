require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const amdAvailability = require('./scrapers/amd');

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
// const SEARCH_TERM = 'graphics';
async function availability() {
  const browser = await puppeteer.launch({headless: true});

  amdProducts = await amdAvailability.checkAvailability(browser);
  console.debug(amdProducts);
  browser.close();

  if (amdProducts.length > 0) {
    // send notification
    console.log('Sending notifications');
    await Promise.all(
        amdProducts.map(async (item) => {
          await sendToTelegram(item);
        }),
    );
    return;
  }
  console.log('Nothing in stock');
}

async function sendToTelegram(product) {
  const apiUrl = TELEGRAM_API_URL + TELEGRAM_API_TOKEN + '/' + 'sendMessage';

  const payload = {
    chat_id: TELEGRAM_CHANNEL_ID,
    text:
      `${product.title}\nPRICE: ${product.price}\n` +
      `Product now in stock!\n\nBUY: ${product.directLink}`,
    disable_web_page_preview: false,
    disable_notification: false,
    protect_content: true,
  };

  axios
      .post(apiUrl, payload)
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
}

availability();
