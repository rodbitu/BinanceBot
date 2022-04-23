const api = require('./api');

// Simbolo de alguma criptomoeda para teste (Ex: BNBBUSD)
const symbol = process.env.SYMBOL;

console.log('Iniciando monitoramento!\n');

setInterval(async () => {
  const result = await api.depth(symbol);
  const account = await api.accountInfo();
  const coins = account.balances.filter((b) => symbol.indexOf(b.asset) !== -1);
  const sellPrice = parseFloat(result.asks[0][0]);
  const profitability = parseFloat(process.env.PROFITABILITY);
  const sellOrder = await api.newOrder(
    symbol,
    1,
    sellPrice * profitability,
    'SELL',
    'LIMIT',
  );
  const carteiraUSD = parseFloat(
    coins.find((c) => c.asset.endsWith('USD')).free,
  );

  console.log('Mercado');

  console.log(
    result.bids.length ? `Compra: ${result.bids[0][0]}` : 'Sem Compras',
  );
  console.log(
    result.asks.length ? `Venda: ${result.asks[0][0]}` : 'Sem Vendas',
  );

  console.log('\nCarteira');
  console.log(coins);

  if (sellPrice < 1000) {
    console.log('Preço está bom. Verificando se tenho grana...');
    if (sellPrice <= carteiraUSD) {
      console.log('Tenho! Comprando!');
      const buyOrder = await api.newOrder(symbol, 1);
      console.log(`orderId: ${buyOrder.orderId}`);
      console.log(`status: ${buyOrder.status}`);

      console.log(`Posicionando venda. Ganho de ${profitability}`);
      console.log(`orderId: ${sellOrder.orderId}`);
      console.log(`status: ${sellOrder.status}`);
    }
  }

  console.log('\n---------------------------------\n');
}, process.env.CRAWLER_INTERVAL || 3000);
