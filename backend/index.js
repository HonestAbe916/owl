const express = require('express')
const app = express()
const port = 3001
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const moment = require('moment');

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

const filePath = "./stock-data.csv";
let stockData = [];
let stockDataByCompany = {};

async function parseCSV() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // renaming some fields and make sure types are correct
                const [id, name, date, volume, price, sector_level1, sector_level2] = Object.values(data);
                stockData.push({ id: parseInt(id), name, date, volume, price: parseFloat(price), sector_level1, sector_level2 });
            })
            .on('end', () => {
                // store in the format stockName => [stockData]
                stockDataByCompany = stockData.reduce((acc, stock) => {
                    const stockName = stock.name.trim();
                    if (!acc[stockName]) acc[stockName] = [];
                    acc[stockName].push(stock);
                    return acc;
                }, {});
                return resolve(stockData);
            })
            .on('error', (err) => reject(err));
    });
}
parseCSV();

app.get('/stocks', (req, res) => {
    // just get latest price for each stock
    const dataToReturn = Object.keys(stockDataByCompany).reduce((acc, stockName) => {
        acc.push(stockDataByCompany[stockName][stockDataByCompany[stockName].length - 1]);
        return acc;
    }, []);

    return res.json(dataToReturn);
})

app.get('/stocks/:name', (req, res) => {
    const stockPrices = stockDataByCompany[req.params.name];
    if (!stockPrices) {
        return res.status(404).send('Stock not found');
    }

    const dataToReturn = {
        name: stockPrices[0].name,
        sector_level1: stockPrices[0].sector_level1,
        sector_level2: stockPrices[0].sector_level2,
        records: stockPrices.map((s) => ({ price: s.price, date: s.date })),
    }

    return res.json(dataToReturn);
})

app.get('/stocks/:name/:fromDate/:toDate', (req, res) => {
    const stockPrices = stockDataByCompany[req.params.name];
    if (!stockPrices) {
        return res.status(404).send('Stock not found');
    }

    const fromDate = moment(req.params.fromDate).format("YYYY-MM-DD");
    const toDate = moment(req.params.toDate).format("YYYY-MM-DD");
    const stockFrom = stockPrices.find((stock) => stock.date == fromDate);
    const stockTo = stockPrices.find((stock) => stock.date == toDate);

    if (!stockFrom || !stockTo) {
        return res.status(404).send('No stock data found for dates provided');
    }

    const profit = parseFloat(stockFrom.price - stockTo.price).toFixed(2);

    return res.json({profit});
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
