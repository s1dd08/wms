import { useState, useEffect } from "react";
import "./App.css";

const ROWS = 4;   
const COLS = 5;   
const BIN_CAPACITY = 100;

function App() {
  const [bins, setBins] = useState(() => {
  const savedData = localStorage.getItem("warehouseBins");

  if (savedData) {
    return JSON.parse(savedData);
  }

  const initialBins = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const rackLetter = String.fromCharCode(65 + r);
      const binNumber = c + 1;

      initialBins.push({
        id: `${rackLetter}${binNumber}`,
        items: [],
      });
    }
  }
  return initialBins;
});

const [selectedBin, setSelectedBin] = useState(null);
const [itemName, setItemName] = useState("");
const [quantity, setQuantity] = useState("");
const [search, setSearch] = useState("");

useEffect(() => {
  localStorage.setItem("warehouseBins", JSON.stringify(bins));
  }, [bins]);
  
const addItem = () => {
  if (!itemName || !quantity || selectedBin === null) return;

  const updatedBins = bins.map((bin) => {
    if (bin.id === selectedBin) {
      const totalQty = bin.items.reduce(
        (sum, item) => sum + item.qty,0);
        
      if (totalQty + Number(quantity) > BIN_CAPACITY) {
        alert("Bin capacity exceeded!");
        return bin;
      }
      const existingItemIndex = bin.items.findIndex(
        (item) =>
          item.name.toLowerCase() === itemName.toLowerCase()
      );

      let updatedItems = [...bin.items];

      if (existingItemIndex !== -1) {
        updatedItems[existingItemIndex].qty += Number(quantity);
      } else {
        updatedItems.push({
          name: itemName,
          qty: Number(quantity),
        });
      }

      return {
        ...bin,
        items: updatedItems,
      };
    }

    return bin;
  });

  setBins(updatedBins);
  setItemName("");
  setQuantity("");
};

const deleteItem = (itemIndex) => {
  const updatedBins = bins.map((bin) => {
    if (bin.id === selectedBin) {
        const updatedItems = bin.items.filter(
        (_, index) => index !== itemIndex);
      
        return {
        ...bin,
        items: updatedItems,
      };
    }
    return bin;
  });

  setBins(updatedBins);
};

 const clearBin = () => {
    const updatedBins = bins.map((bin) => {
      if (bin.id === selectedBin) {
        return { ...bin, items: [] };
      }
      return bin;
    });

    setBins(updatedBins);
  };

  const getStatus = (bin) => {
  const totalQty = bin.items.reduce(
    (sum, item) => sum + item.qty,0);
    
  if (totalQty === 0) return "empty";
  if (totalQty < BIN_CAPACITY) return "partial";
  return "full";
};

  const containsSearchItem = (bin) => {
    return bin.items.some((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="container">
      <h1>Warehouse Bin & Rack Manager</h1>

      <input
        type="text"
        placeholder="Search item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />

      <div className="grid">
        {bins.map((bin) => {
            const totalQty = bin.items.reduce(
            (sum, item) => sum + item.qty, 0
              );
            const percentage = (totalQty / BIN_CAPACITY) * 100;

  return (
    <div
      key={bin.id}
      className={`bin ${getStatus(bin)} 
        ${selectedBin === bin.id ? "selected" : ""}
        ${search && containsSearchItem(bin) ? "highlight" : ""}`}
      onClick={() => setSelectedBin(bin.id)}
    >
      <div className="bin-id">{bin.id}</div>

      <div className="progress-bar">
        <div
              className={`progress-fill 
                ${percentage <= 50 ? "low" : ""}
                ${percentage > 50 && percentage <= 80 ? "medium" : ""}
                ${percentage > 80 ? "high" : ""}`}
              style={{ width: `${percentage}%` }}
          ></div>
      </div>

      <div className="qty-text">{totalQty}/{BIN_CAPACITY}</div>
    </div>
  );
})}
      </div>

      {selectedBin && (
        <div className="panel">
          <h3>Selected Bin: {selectedBin}</h3>

          <input
            type="text"
            placeholder="Item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <button onClick={addItem}>Add Item</button>
          <button onClick={clearBin}>Clear Bin</button>

          <h4>Items:</h4>
          <ul>
              {bins
                .find((bin) => bin.id === selectedBin)
                ?.items.map((item, index) => (
                  <li key={index} className="item-row">
                    {item.name} - {item.qty}
                    <button
                      className="delete-btn"
                      onClick={() => deleteItem(index)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
            </ul>

        </div>
      )}
    </div>
  );
}

export default App;
