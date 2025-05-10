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

function isValidDate(dateObject){
    return new Date(dateObject).toString() !== 'Invalid Date';
}

// to do use binary search
function getStockPriceOnDate(company, date) {
    const stockPrices = stockDataByCompany[company];
    const exactMatch = stockPrices.find((stock) => stock.date == date);
    if (exactMatch) return exactMatch;

    let bestMatch = null;
    stockPrices.forEach((stock) => {
        if (stock.date > date) return;
        if (bestMatch === null || stock.date > bestMatch.date) bestMatch = stock;
    });

    return bestMatch;
}

async function parseCSV() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // renaming some fields and make sure types are correct
                const [id, name, date, volume, price, sector_level1, sector_level2] = Object.values(data);
                stockData.push({ id: parseInt(id), name, date: new Date(date), volume, price: parseFloat(price), sector_level1, sector_level2 });
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
    const companyName = req.params.name;
    const stockPrices = stockDataByCompany[companyName];
    if (!stockPrices) {
        return res.status(404).send('Stock not found');
    }

    const from = new Date(req.params.fromDate);
    const to = new Date(req.params.toDate);

    if (!isValidDate(from) || !isValidDate(to)) {
        return res.status(404).send('Invalid date provided');
    }

    const stockFrom = getStockPriceOnDate(companyName, from);
    const stockTo = getStockPriceOnDate(companyName, to);
    if (!stockFrom || !stockTo) {
        return res.status(404).send('No stock data found for dates provided');
    }

    const profit = parseFloat(stockTo.price - stockFrom.price).toFixed(2);

    return res.json({ profit, stockFrom, stockTo });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
