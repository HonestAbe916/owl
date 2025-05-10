import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import StockList from "./pages/stocks/StockList";
import StockView from "./pages/stocks/StockView";

const router = createBrowserRouter([
  {
    path: "/",
    element:  <StockList />,
  },
  {
    path: "/stocks/:stockName",
    element:  <StockView />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
