import React, { useState } from "react";
import { PRODUCTS } from "../data/products";

const Products = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [items, setItems] = useState(PRODUCTS);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAdd = () => {
    if (name && quantity) {
      setItems([...items, { name, quantity }]);
      setName("");
      setQuantity("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <ul className="mb-4">
        {items.map((item, i) => (
          <li key={i}>{item.name} - {item.quantity}</li>
        ))}
      </ul>

      {user.role === "manager" || user.role === "storekeeper" ? (
        <div className="space-y-2">
          <input
            placeholder="Product Name"
            className="border p-2 mr-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Quantity"
            className="border p-2 mr-2"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
            Add Product
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Products;
