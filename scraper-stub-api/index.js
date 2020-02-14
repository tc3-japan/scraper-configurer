const express = require('express');
const app = express();

const groovy = "\
// set scraping page\n\
setPage \"https://www.amazon.co.jp/gp/your-account/order-history?opt=ab&digitalOrders=1&unifiedOrders=1&returnTo=&orderFilter=\"\n\
\n\
// start to process purchase history\n\
processPurchaseHistory() {\n\
\n\
	// scrape order dom node list\n\
	orderList = scrapeDomList \"#ordersContainer > div.order\" // ordersBox\n\
	// loop each order\n\
	processOrders(orderList) { orderNode ->\n\
		// scrape order details\n\
		scrapeOrderNumber    orderNode, \"div.order-info > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > span:nth-of-type(2)\"             // orderNumber\n\
		scrapeOrderDate      orderNode, \"div.order-info > div > div > div > div:nth-of-type(1) > div > div:nth-of-type(1) > div:nth-of-type(2) > span\" // orderDate\n\
		scrapeTotalAmount    orderNode, \"div.order-info > div > div > div > div:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(2) > span\" // totalAmount\n\
		scrapeDeliveryStatus orderNode, \"div.shipment > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > span:nth-of-type(1)\"      // deliveryStatus\n\
\n\
		if (!isNew()) { return false; }\n\
\n\
		// scrape product dom node list\n\
		productList = scrapeDomList \"div.shipment > div > div > div > div:nth-of-type(1) > div > div.a-fixed-left-grid\" // productsBox\n\
		// loop each product\n\
		processProducts(productList) { productNode ->\n\
			// scrape product details\n\
			scrapeProductCodeFromAnchor productNode, \"div > div:nth-of-type(2) > div:nth-of-type(1) > a\", \"\\\\/gp\\\\/product\\\\/([A-Z0-9]+)\\\\/\" // productAnchor, pattern\n\
			scrapeProductNameFromAnchor productNode, \"div > div:nth-of-type(2) > div:nth-of-type(1) > a\"                                     // productAnchor\n\
			scrapeProductQuantity       productNode, \"span.item-view-qty\"                                                                    // productQuantity\n\
			scrapeUnitPrice             productNode, \"span.a-color-price\"                                                                    // unitPrice\n\
			scrapeProductDistributor    productNode, \"span.a-color-secondary\"                                                                // productDistributor\n\
		}\n\
	}\n\
}\n"

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header('Access-Control-Allow-Methods', "PUT");
    next();
}

app.use(allowCrossDomain);

app.get('/', (req, res) => {
    res.send('Scraper Stub API');
});

app.get('/scrapers/amazon/purchase_history', (req, res) => {
    res.send(groovy);
});

app.post('/scrapers/amazon/purchase_history', (req, res) => {
    res.send("Successfully Updated");
});

app.put('/scrapers/amazon/purchase_history/test', (req, res) => {
    res.send("Success");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
