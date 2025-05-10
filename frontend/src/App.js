import logo from './logo.svg';
import './App.css';
import StockList from './pages/stocks/StockList';

function App() {
  return (
    <div className='flex flex-col w-full p-20 bg-gray'>
      <div className='flex flex-col w-full'>
        <StockList />
      </div>
    </div>
  );
}

export default App;
