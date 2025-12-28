import React, { useEffect, useState } from "react";

export default function JoinBuilder({ sourceConfig, onJoinUpdate }) {

  const [tables, setTables] = useState([]);
  const [columnsByTable, setColumnsByTable] = useState({});
  const [joins, setJoins] = useState([]);

  useEffect(() => {
    if (!sourceConfig?.selectedTables?.length) return;

    const list = sourceConfig.selectedTables;
    setTables(list);

    fetchColumns(list);
  }, [sourceConfig]);

  // 🔥 Fetch columns for each selected table
  const fetchColumns = async (tableList) => {
    const map = {};

    for (const table of tableList) {
      try {
        const res = await fetch("http://localhost:5000/source/get-source-columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...sourceConfig,
            tableName: table
          })
        });

        const data = await res.json();

        if (data.success) {
          map[table] = data.columns.map(c => c.column_name);
        }

      } catch {
        console.log("❌ Failed to load columns for", table);
        map[table] = [];
      }
    }

    setColumnsByTable(map);
  };


  // ➕ Add Join Rule
  const addJoin = () => {
    const updated = [
      ...joins,
      {
        leftTable: "",
        leftColumn: "",
        rightTable: "",
        rightColumn: "",
        type: "LEFT"
      }
    ];

    setJoins(updated);
    onJoinUpdate(updated);   // notify parent
  };


  // 🗑 Remove Join
  const removeJoin = (index) => {
    const updated = joins.filter((_, i) => i !== index);
    setJoins(updated);
    onJoinUpdate(updated);
  };


  // ✏️ Update Join
  const updateJoin = (index, key, value) => {
    const updated = [...joins];
    updated[index][key] = value;
    setJoins(updated);
    onJoinUpdate(updated);
  };


  if (!tables?.length) {
    return (
      <p className="text-gray-300">
        Select source tables to configure joins…
      </p>
    );
  }


  return (
    <div className="bg-white text-black p-5 rounded-xl shadow border mt-6">

      <h2 className="text-2xl font-bold text-blue-700">
        🔗 Table Join Builder
      </h2>

      <p className="text-gray-600 mb-4">
        Define how your selected tables should join.
      </p>


      {joins.map((join, index) => (
        <div key={index} className="border p-4 rounded-lg mb-4 bg-gray-50">

          <div className="grid grid-cols-4 gap-3">

            {/* LEFT TABLE */}
            <select
              className="p-2 border rounded"
              value={join.leftTable}
              onChange={e => updateJoin(index, "leftTable", e.target.value)}
            >
              <option value="">Select Left Table</option>
              {tables.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>


            {/* LEFT COLUMN */}
            <select
              className="p-2 border rounded"
              value={join.leftColumn}
              onChange={e => updateJoin(index, "leftColumn", e.target.value)}
              disabled={!join.leftTable}
            >
              <option value="">Select Column</option>

              {columnsByTable[join.leftTable]?.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>


            {/* JOIN TYPE */}
            <select
              className="p-2 border rounded"
              value={join.type}
              onChange={e => updateJoin(index, "type", e.target.value)}
            >
              <option value="LEFT">LEFT JOIN</option>
              <option value="INNER">INNER JOIN</option>
              <option value="RIGHT">RIGHT JOIN</option>
            </select>


            {/* RIGHT TABLE */}
            <select
              className="p-2 border rounded"
              value={join.rightTable}
              onChange={e => updateJoin(index, "rightTable", e.target.value)}
            >
              <option value="">Select Right Table</option>
              {tables.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

          </div>


          {/* RIGHT COLUMN */}
          <div className="mt-3">
            <select
              className="p-2 border rounded w-full"
              value={join.rightColumn}
              onChange={e => updateJoin(index, "rightColumn", e.target.value)}
              disabled={!join.rightTable}
            >
              <option value="">Select Right Column</option>

              {columnsByTable[join.rightTable]?.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>


          {/* Delete Button */}
          <button
            className="mt-3 px-3 py-1 bg-red-500 text-white rounded"
            onClick={() => removeJoin(index)}
          >
            ❌ Remove Rule
          </button>

        </div>
      ))}


      {/* Add Button */}
      <button
        className="px-5 py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={addJoin}
      >
        ➕ Add Join Rule
      </button>

    </div>
  );
}
