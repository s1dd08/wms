import { useState, useEffect } from "react";
import "./App.css";

const ROWS = 4;   // racks
const COLS = 5;   // bins per rack
const BIN_CAPACITY = 100;


function App() {
  const [bins, setBins] = useState(() => {
  const savedData = localStorage.getItem("warehouseBins");

  if (savedData) {
    return JSON.parse(savedData);
  }

  // If no saved data, create fresh grid
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


  // Save to localStorage whenever bins change
  useEffect(() => {
    localStorage.setItem("warehouseBins", JSON.stringify(bins));
  }, [bins]);

  // Add item to selected bin
  
const addItem = () => {
  if (!itemName || !quantity || selectedBin === null) return;

  const updatedBins = bins.map((bin) => {
    if (bin.id === selectedBin) {

      // 🔹 Calculate current total quantity in this bin
      const totalQty = bin.items.reduce(
        (sum, item) => sum + item.qty,0);
        
      

      // 🔹 Check if adding this quantity exceeds capacity
      if (totalQty + Number(quantity) > BIN_CAPACITY) {
        alert("Bin capacity exceeded!");
        return bin; // stop update
      }

      // 🔹 Check if item already exists
      const existingItemIndex = bin.items.findIndex(
        (item) =>
          item.name.toLowerCase() === itemName.toLowerCase()
      );

      let updatedItems = [...bin.items];

      if (existingItemIndex !== -1) {
        // Update quantity
        updatedItems[existingItemIndex].qty += Number(quantity);
      } else {
        // Add new item
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
        (_, index) => index !== itemIndex
      );

      return {
        ...bin,
        items: updatedItems,
      };
    }
    return bin;
  });

  setBins(updatedBins);
};


  // Remove all items from bin
  const clearBin = () => {
    const updatedBins = bins.map((bin) => {
      if (bin.id === selectedBin) {
        return { ...bin, items: [] };
      }
      return bin;
    });

    setBins(updatedBins);
  };

  // Determine bin status
  const getStatus = (bin) => {
  const totalQty = bin.items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  if (totalQty === 0) return "empty";
  if (totalQty < BIN_CAPACITY) return "partial";
  return "full";
};


  // Check if bin contains searched item
  const containsSearchItem = (bin) => {
    return bin.items.some((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="container">
      <h1>Warehouse Bin & Rack Manager</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />

      {/* GRID */}
      <div className="grid">
        {bins.map((bin) => (
          <div
            key={bin.id}
            className={`bin ${getStatus(bin)} 
              ${selectedBin === bin.id ? "selected" : ""}
              ${search && containsSearchItem(bin) ? "highlight" : ""}`}
            onClick={() => setSelectedBin(bin.id)}
          >
            {bin.id}
          </div>
        ))}
      </div>

      {/* INVENTORY PANEL */}
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
