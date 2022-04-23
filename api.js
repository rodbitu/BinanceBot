const axios = require('axios');
const queryString = require('qs');
const crypto = require('crypto');

// API key criada pra teste
const apiKey = process.env.API_KEY_TEST;

// Secret key criada pra teste
const apiSecret = process.env.SECRET_KEY_TEST;

// API url de teste ==> https://testnet.binance.vision/api
const apiUrl = process.env.API_URL_TEST;

const privateCall = async (path, data = {}, method = 'GET') => {
  const timestamp = Date.now();
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(`${queryString.stringify({ ...data, timestamp })}`)
    .digest('hex');

  const newData = { ...data, timestamp, signature };
  const qs = `?${queryString.stringify(newData)}`;

  try {
    const result = await axios({
      method,
      url: `${apiUrl}${path}${qs}`,
      headers: { 'X-MBX-APIKEY': apiKey },
    });
    return result.data;
  } catch (err) {
    console.log(err);
  }
};

const accountInfo = async () => {
  return privateCall('/v3/account');
};

async function newOrder(
  symbol,
  quantity,
  price,
  side = 'BUY',
  type = 'MARKET',
) {
  const data = { symbol, side, type, quantity };

  if (price) data.price = parseInt(price);
  if (type === 'LIMIT') data.timeInForce = 'GTC';

  return privateCall('/v3/order', data, 'POST');
}

const publicCall = async (path, data, method = 'GET') => {
  try {
    const qs = data ? `?${queryString.stringify(data)}` : '';
    const result = await axios({
      method,
      url: `${apiUrl}${path}${qs}`,
    });
    return result.data;
  } catch (err) {
    console.log(err);
  }
};

const time = async () => {
  return publicCall('/v3/time');
};

const depth = async (symbol, limit = 5) => {
  return publicCall('/v3/depth', { symbol, limit });
};

const exchangeInfo = async () => {
  return publicCall('/v3/exchangeInfo');
};

module.exports = { time, depth, exchangeInfo, accountInfo, newOrder };
