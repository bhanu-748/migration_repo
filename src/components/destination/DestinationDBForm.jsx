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
  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Connect Destination DB
  const connectDB = async () => {
    setStatus("loading");
    try {
      const res = await fetch(
        "http://localhost:5000/destination/connect-destination-db",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();
      setStatus(data.success ? "connected" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  // ✅ Fetch Destination Tables
  const fetchTables = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/destination/get-destination-tables",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();

      if (data.success) {
        const sorted = data.tables
          .map(t => t.table_name)
          .sort((a, b) => a.localeCompare(b));

        setTables(sorted);

        // send destination info upward
        onConnected({
          ...form,
          tables: sorted
        });

      } else {
        alert("Failed to fetch tables ❌");
      }
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
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input
          name="port"
          placeholder="Port"
          value={form.port}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input
          name="user"
          placeholder="User"
          value={form.user}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input
          name="database"
          placeholder="Database"
          value={form.database}
          onChange={handleChange}
          className="col-span-2 p-2 border rounded-lg bg-white text-black"
        />
      </div>


      {/* Connect Status */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={connectDB}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Connect
        </button>

        {status === "loading" && (
          <span className="text-yellow-400 font-semibold">Connecting…</span>
        )}
        {status === "connected" && (
          <span className="text-green-400 font-semibold">🟢 Connected</span>
        )}
        {status === "failed" && (
          <span className="text-red-500 font-semibold">🔴 Failed</span>
        )}
      </div>


      {/* Fetch Tables */}
      {status === "connected" && (
        <div className="mt-5">
          <button
            onClick={fetchTables}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            Get Tables
          </button>


          {/* Search + Table List */}
          {tables.length > 0 && (
            <div className="mt-4 bg-white p-3 rounded border">

              {/* Search Box */}
              <input
                placeholder="Search destination table..."
                className="w-full p-2 border rounded mb-2 text-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Dropdown */}
              {/* Filtered Table List */}
            {/* Filtered Table List */}
          <div className="max-h-52 overflow-y-auto border rounded text-black">

            {tables
              .filter(t =>
                t.toLowerCase().includes(search.toLowerCase())
              )
              .map((t, i) => {
                const isSelected = selectedTable === t;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedTable(t);

                      onConnected({
                        ...form,
                        table: t
                      });
                    }}
                    className={`p-2 border-b cursor-pointer flex items-center justify-between
                      ${isSelected ? "bg-green-200 font-semibold" : "hover:bg-gray-100"}
                    `}
                  >
                    <span>{t}</span>

                    {/* Tick Icon */}
                    {isSelected && (
                      <span className="text-green-700 text-lg">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}

            {/* No match UI */}
            {tables.filter(t =>
              t.toLowerCase().includes(search.toLowerCase())
            ).length === 0 && (
              <div className="p-2 text-gray-500 text-center">
                No tables found
              </div>
            )}
          </div>




            </div>
          )}
        </div>
      )}
    </div>
  );
}
