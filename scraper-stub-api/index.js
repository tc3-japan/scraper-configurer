const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.raw({ type: 'application/octet-stream' }))
app.use(bodyParser.text({ type: ['text/*', 'application/json'] }))

//const amazon = fs.readFileSync('./purchase_history_amazon.json', 'utf8');
//const rakuten = fs.readFileSync('./purchase_history_rakuten.json', 'utf8');
//const yahoo = fs.readFileSync('./purchase_history_yahoo.json', 'utf8');
const sites = {
    amazon: fs.readFileSync('./purchase_history_amazon.json', 'utf8'),
    rakuten: fs.readFileSync('./purchase_history_rakuten.json', 'utf8'),
    yahoo: fs.readFileSync('./purchase_history_yahoo.json', 'utf8')
};

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header('Access-Control-Allow-Methods', "PUT");
    next();
}

const check_params = function(req) {
	var err = null;
	if (!(req.params.site in sites)) {
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
			res.writeHead(200, {'Content-Type': 'application/json' });
			res.end(sites[req.params.site]);
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
