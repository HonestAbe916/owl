import { use, useEffect, Suspense, useState } from "react";
import { getStocks } from "../../services/stockService";
import Page from "../../components/Page";
import { Link } from "react-router";

export default function StockList() {
    const [stockData, setStockData] = useState(null);

    useEffect(() => {
        async function getData() {
            const stocks = await getStocks();
            setStockData(stocks);
        }

        getData();
    }, []);

    return (
        <Page>
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            {["Name", "Date", "Volume", "Price", "Sector 1", "Sector 2"].map((label) => (
                                <th key={label} scope="col" className="px-6 py-3">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {stockData?.map((stock) => (
                            <tr key={stock.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <Link to={`/stocks/${stock.name}`}>{stock.name}</Link>
                                </th>
                                <td className="px-6 py-4">
                                    {stock.date}
                                </td>
                                <td className="px-6 py-4">
                                    {stock.volume}
                                </td>
                                <td className="px-6 py-4">
                                    {stock.price}
                                </td>
                                <td className="px-6 py-4">
                                    {stock.sector_level1}
                                </td>
                                <td className="px-6 py-4">
                                    {stock.sector_level2}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Page>
    );
}