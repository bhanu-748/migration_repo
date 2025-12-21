import React, { useState } from "react";

export default function DestinationDBForm({ onConnected }) {
  const [form, setForm] = useState({
    host: "",
    port: 5432,
    user: "",
    password: "",
    database: ""
  });

  const [status, setStatus] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Connect Destination DB
  const connectDB = async () => {
    setStatus("loading");
    try {
      const res = await fetch("http://localhost:5000/destination/connect-destination-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) setStatus("connected");
      else setStatus("failed");
    } catch {
      setStatus("failed");
    }
  };

  // Fetch Destination Tables
  const fetchTables = async () => {
    try {
      const res = await fetch("http://localhost:5000/destination/get-destination-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) setTables(data.tables);
      else alert("Failed to fetch tables ❌");
    } catch {
      alert("Error fetching tables ❌");
    }
  };

  return (
    <div>
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <input
          name="host"
          placeholder="Host"
          value={form.host}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-gray-900"
        />
        <input
          name="port"
          placeholder="Port"
          value={form.port}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-gray-900"
        />
        <input
          name="user"
          placeholder="User"
          value={form.user}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-gray-900"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-gray-900"
        />
        <input
          name="database"
          placeholder="Database"
          value={form.database}
          onChange={handleChange}
          className="col-span-2 p-2 border rounded-lg bg-white text-gray-900"
        />
      </div>

      {/* Connect Button */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={connectDB}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Connect
        </button>

        {status === "loading" && (
          <span className="text-yellow-500 font-semibold">Connecting…</span>
        )}
        {status === "connected" && (
          <span className="text-green-600 font-semibold">🟢 Connected</span>
        )}
        {status === "failed" && (
          <span className="text-red-600 font-semibold">🔴 Failed</span>
        )}
      </div>

      {/* Fetch Tables */}
      {status === "connected" && (
        <div className="mt-5">
          <button
            onClick={fetchTables}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Get Tables
          </button>

          {tables.length > 0 && (
            <select
              className="mt-3 w-full p-2 border rounded-lg"
              value={selectedTable}
              onChange={(e) => {
                const table = e.target.value;
                setSelectedTable(table);

                onConnected({
                    ...form,
                    table
                });
                }}

            >
              <option value="">Select Table</option>
              {tables.map((t, idx) => (
                <option key={idx} value={t.table_name}>
                  {t.table_name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
