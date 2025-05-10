import { use, useEffect, Suspense, useState } from "react";
import { getStock } from "../../services/stockService";
import Page from "../../components/Page";
import { Link, useParams } from "react-router";
import CanvasJS from '@canvasjs/stockcharts';

export default function StockView() {
    const params = useParams();
    const [stockData, setStockData] = useState(null);

    useEffect(() => {
        async function getData() {
            const stocks = await getStock(params.stockName);
            if (!stocks) return;
            setStockData(stocks);

            const stockChart = new CanvasJS.StockChart("stockChartContainer", {
                title: {
                    text: stocks.name
                },
                charts: [{
                    data: [{
                        type: "line",
                        dataPoints: stocks.records.map((stock) => ({ x: new Date(stock.date), y: stock.price }))
                    }]
                }],
                navigator: {
                    slider: {
                        minimum: new Date(stocks.records[0].date),
                        maximum: new Date(stocks.records[stocks.records.length - 1].date),
                    }
                }
            });
            //Render StockChart
            stockChart.render();
        }

        getData();
    }, []);

    return (
        <Page>
            <div id="stockChartContainer"></div>
            <Link className="p-10" to="/">Back to List</Link>
        </Page>
    );
}