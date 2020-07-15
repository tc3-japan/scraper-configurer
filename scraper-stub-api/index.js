const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.raw({ type: 'application/octet-stream' }))
app.use(bodyParser.text({ type: ['text/*', 'application/json'] }))

const purchaseHistories = {
	amazon: fs.readFileSync('./json/amazon-purchase-history.json', 'utf8'),
	rakuten: fs.readFileSync('./json/rakuten-purchase-history.json', 'utf8'),
	yahoo: fs.readFileSync('./json/yahoo-purchase-history.json', 'utf8')
};

const productDetails = {
	amazon: fs.readFileSync('./json/amazon-product-detail.json', 'utf8'),
	rakuten: fs.readFileSync('./json/rakuten-product-detail.json', 'utf8'),
	yahoo: fs.readFileSync('./json/yahoo-product-detail.json', 'utf8')
};

const searchProducts = {
	amazon: fs.readFileSync('./json/amazon-search-product.json', 'utf8'),
	rakuten: fs.readFileSync('./json/rakuten-search-product.json', 'utf8'),
	yahoo: fs.readFileSync('./json/yahoo-search-product.json', 'utf8')
};

const scrapingTypes = {
	purchase_history: purchaseHistories,
	product: productDetails,
	search: searchProducts
};

const testResult = `[
	[
	  {
		"products":[
		  {
			"product_code":"B07WC4B3XF",
			"product_name":"曙産業 ミル ブラウン 日本製 ナッツ類用 板チョコ用 ハンドル式 チョコナッツクラッシャー SE-2511"
		  }
		],
		"order_no":"503-2128236-1373453",
		"order_date":"2020-07-13 15:00:00",
		"total_amount":"1106.0",
		"delivery_status":"IN_TRANSIT"
	  },
	  {
		"products":[
		  {
			"product_code":"B01C5JMW90",
			"product_name":"マウントハーゲン オーガニック フェアトレード カフェインレスインスタントコーヒー100g インスタント"
		  }
		],
		"order_no":"503-3773345-3244624",
		"order_date":"2020-07-13 15:00:00",
		"total_amount":"965.0",
		"delivery_status":""
	  },
	  {
		"products":[
		  {
			"product_code":"B07YHS5L39",
			"product_name":"Toby Soul 耳かき LEDライト付き 光る 子供用 大人兼用 耳掃除 耳かきセット 日本語説明書付き"
		  }
		],
		"order_no":"250-9865916-3223012",
		"order_date":"2020-07-07 15:00:00",
		"total_amount":"1280.0",
		"delivery_status":"DELIVERED"
	  },
	  {
		"products":[
		  {
			"product_code":"B01BEPNPF6",
			"product_name":"[Amazon限定ブランド] キリン LAKURASHI アルカリイオンの水 PET (2L×9本)"
		  },
		  {
			"product_code":"B01BEPNPF6",
			"product_name":"[Amazon限定ブランド] キリン LAKURASHI アルカリイオンの水 PET (2L×9本)"
		  }
		],
		"order_no":"250-4939491-7574213",
		"order_date":"2020-07-04 15:00:00",
		"total_amount":"2086.0",
		"delivery_status":"IN_TRANSIT"
	  }
	],
	{
	  "urls":[
		"html/amazon/amazon-purchase-history-2020-07-14T19-14-07.361.html",
		"html/amazon/amazon-purchase-history-2020-07-14T19-14-12.491.html",
		"html/amazon/amazon-purchase-history-2020-07-14T19-14-17.123.html"
	  ]
	}
  ]`;

const testError = `ReferenceError: request is not defined
at app.post (./index.js:60:3)
at Layer.handle [as handle_request] (./node_modules/express/lib/router/layer.js:95:5)
at next (./node_modules/express/lib/router/route.js:137:13)
at Route.dispatch (./node_modules/express/lib/router/route.js:112:3)
at Layer.handle [as handle_request] (./node_modules/express/lib/router/layer.js:95:5)
at ./node_modules/express/lib/router/index.js:281:22
at param (./node_modules/express/lib/router/index.js:354:14)
at Function.process_params (./node_modules/express/lib/router/index.js:410:3)`;

let allowCrossDomain = function (req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Headers', "*");
	res.header('Access-Control-Allow-Methods', "PUT");
	next();
}

const check_params = function (req) {
	var err = '';
	if (!(req.params.site in purchaseHistories)) {
		err += 'Unsupported site: ' + req.params.site
	}
	if (!(req.params.type in scrapingTypes)) {
		err += 'Unsupported type: ' + req.params.type
	}
	return err;
}

app.use(allowCrossDomain);

app.get('/', (req, res) => {
	res.send('Scraper Stub API');
});

app.get('/scrapers/:site/:type', (req, res) => {

	const err = check_params(req);

	if (err) {
		res.status(400).send(err);
		return;
	}

	const json = scrapingTypes[req.params.type][req.params.site];

	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(json);
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

	let status, data;

	if (check_params(req)) {
		status = "error";
		data = testError;
	} else {
		status = "success";
		data = JSON.parse(testResult);
	}

	const body = {
		ec_site: req.params.site,
		type: req.params.type,
		status: status,
		data: data
	}

	res.json(body);
});

app.get('/scrapers/html/:site/:file', (req, res) => {

	const path = './html/' + req.params.site + '/' + req.params.file;

	if (!fs.existsSync(path)) {
		res.status(400).send('File not exist.');
		return;
	}

	const html = fs.readFileSync(path);

	res.end(html);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
