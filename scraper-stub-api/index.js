const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.raw({ type: 'application/octet-stream' }))
app.use(bodyParser.text({ type: ['text/*', 'application/x-groovy'] }))

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

const check_params = function(req) {
	var err = null;
	if (req.params.site !== 'amazon') {
		err = 'Unsupported site: ' + req.params.site
	}
	if (req.params.type !== 'purchase_history') {
		err = 'Unsupported type: ' + req.params.type
	}
	return err;
}

app.use(allowCrossDomain);

app.get('/', (req, res) => {
    res.send('Scraper Stub API');
});

app.get('/scrapers/:site/:type', (req, res) => {
		var err = check_params(req);
		if (!err) {
			res.writeHead(200, {'Content-Type': 'application/x-groovy' });
			res.end(groovy);
		} else {
			res.status(400).send(err);
		}
});

app.put('/scrapers/:site/:type', (req, res) => {
		var err = check_params(req),
				body = String(req.body);

		console.log(body);

		if (!body) {
			err = 'Missing script body';
		}
		if (!err) {
			res.send("Successfully Updated");
		} else {
			res.status(400).send(err);
		}
});

app.post('/scrapers/:site/:type/test', (req, res) => {

		let body = {},
				type = req.params.type;
		
		if (type === 'purchase_history') {
			body = {
				ec_site: req.params.site,
				type: type,
				status: "success",
				data: [
					{
						order_no: "250-7937078-7453441",
						order_date: "2020-01-01-00:00:00",
						total_amount: "26,946",
						delivery_status: null,
						products: [
							{
								product_code: "B07YQJ17SN",
								product_name: "Haier Joy Series JJ-M32A-W",
								unit_price: "5,946",
								product_quantity: 1,
								product_distributor: "Haier",
								moedel_no: "JJ-M32A-W"
							},
							{
								product_code: "B07YQJ17SN",
								product_name: "JACKBAGGIO",
								unit_price: "21,000",
								product_quantity: 1,
								product_distributor: "JACKBAGGIO",
								moedel_no: "ZL_juicer_8L_gold"
							}
						] 
					},
					{
						order_no: "250-7937078-7453441",
						order_date: "2020-01-01-00:00:00",
						total_amount: "35025",
						delivery_status: null,
						products: [
							{
								product_code: "B07YQJ17SN",
								product_name: "Haier Joy Series JJ-M32A-W",
								unit_price: "5,946",
								product_quantity: 1,
								product_distributor: "Haier",
								moedel_no: "JJ-M32A-W"
							},
							{
								product_code: "B07YQJ17SN",
								product_name: "JACKBAGGIO",
								unit_price: "21,000",
								product_quantity: 1,
								product_distributor: "JACKBAGGIO",
								moedel_no: "ZL_juicer_8L_gold"
							}
						] 
					}
				]
			}
		} else {
			body = {
				ec_site: req.params.site,
				type: type,
				status: "error",
				data:
				`ReferenceError: request is not defined
at app.post (./index.js:60:3)
at Layer.handle [as handle_request] (./node_modules/express/lib/router/layer.js:95:5)
at next (./node_modules/express/lib/router/route.js:137:13)
at Route.dispatch (./node_modules/express/lib/router/route.js:112:3)
at Layer.handle [as handle_request] (./node_modules/express/lib/router/layer.js:95:5)
at ./node_modules/express/lib/router/index.js:281:22
at param (./node_modules/express/lib/router/index.js:354:14)
at Function.process_params (./node_modules/express/lib/router/index.js:410:3)`
			}
		}
		res.json(body);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
