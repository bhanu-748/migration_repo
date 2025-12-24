import React, { useState } from "react";

export default function SourceDBForm({ onConnected }) {

  const [form, setForm] = useState({
    host: "",
    port: 5432,
    user: "",
    password: "",
    database: ""
  });

  const [status, setStatus] = useState(null);

  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [search, setSearch] = useState("");


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // ✅ Notify parent whenever tables change
  const updateParent = (updated) => {
    onConnected({
      ...form,
      selectedTables: updated
    });
  };


  // ✅ Connect DB
  const connectDB = async () => {
    setStatus("loading");

    try {
      const res = await fetch(
        "http://localhost:5000/source/connect-source-db",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();

      if (data.success) {
        setStatus("connected");

        // ⭐⭐⭐ IMPORTANT ⭐⭐⭐
        // Reset selection & sync to parent immediately
        setSelectedTables([]);
        onConnected({
          ...form,
          selectedTables: []
        });

      } else {
        setStatus("failed");
      }

    } catch {
      setStatus("failed");
    }
  };


  // ✅ Fetch Source Tables
  const fetchTables = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/source/get-source-tables",
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

        // keep parent in sync
        onConnected({
          ...form,
          selectedTables
        });

      } else {
        alert("Failed to fetch tables ❌");
      }
    } catch {
      alert("Error fetching tables ❌");
    }
  };


  // ✅ Add table
  const addTable = (table) => {
    if (selectedTables.includes(table)) return;

    const updated = [...selectedTables, table];
    setSelectedTables(updated);
    updateParent(updated);
  };


  // ✅ Remove table
  const removeTable = (table) => {
    const updated = selectedTables.filter(t => t !== table);
    setSelectedTables(updated);
    updateParent(updated);
  };


  return (
    <div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <input name="host" placeholder="Host"
          value={form.host}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input name="port" placeholder="Port"
          value={form.port}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input name="user" placeholder="User"
          value={form.user}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input type="password" name="password" placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="p-2 border rounded-lg bg-white text-black"
        />

        <input name="database" placeholder="Database"
          value={form.database}
          onChange={handleChange}
          className="col-span-2 p-2 border rounded-lg bg-white text-black"
        />
      </div>


      {/* Status */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={connectDB}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect
        </button>

        {status === "loading"   && <span className="text-yellow-400">Connecting…</span>}
        {status === "connected" && <span className="text-green-500">🟢 Connected</span>}
        {status === "failed"    && <span className="text-red-500">🔴 Failed</span>}
      </div>


      {/* Tables */}
      {status === "connected" && (
        <div className="mt-5">

          <button
            onClick={fetchTables}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            Get Tables
          </button>


          {tables.length > 0 && (
            <div className="mt-4">

              {/* Selected Chips */}
              {selectedTables.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTables.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full"
                    >
                      <span>{t}</span>
                      <button className="ml-2 font-bold" onClick={() => removeTable(t)}>
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search + List */}
              <div className="border rounded-lg p-2 bg-white">

                <input
                  placeholder="Search table..."
                  className="w-full p-2 border rounded mb-2 text-black"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="max-h-48 overflow-y-auto">

                  {tables
                    .filter(t =>
                      t.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((table, i) => {

                      const isSelected = selectedTables.includes(table);

                      return (
                        <div
                          key={i}
                          onClick={() => addTable(table)}
                          className={`flex justify-between items-center p-2 border-b cursor-pointer 
                            ${isSelected ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}
                            text-black
                          `}
                        >
                          <span>{table}</span>

                          {isSelected && (
                            <span className="text-blue-700 text-lg">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
