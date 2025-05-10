export function getStocks() {
    try {
        return fetch(`http://localhost:3001/stocks`).then((res) => res.json());
    } catch (e) {
        console.error(e);
    }
}

export function getStock(name) {
    try {
        return fetch(`http://localhost:3001/stocks/${name}`).then((res) => res.json());
    } catch (e) {
        console.error(e);
    }
}