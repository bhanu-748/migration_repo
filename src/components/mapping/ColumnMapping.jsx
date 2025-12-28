import React, { useEffect, useState } from "react";

export default function ColumnMapping({ sourceConfig, destinationConfig, autoJoin }) {

  const [sourceColumns, setSourceColumns] = useState([]);
  const [destinationColumns, setDestinationColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [migrationResult, setMigrationResult] = useState(null);

  const [error, setError] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);


  // 🔵 Fetch ALL SOURCE TABLE COLUMNS
  useEffect(() => {
    if (!sourceConfig?.selectedTables?.length) return;

    const fetchColumns = async () => {
      let allCols = [];

      for (const table of sourceConfig.selectedTables) {
        const res = await fetch(
          "http://localhost:5000/source/get-source-columns",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...sourceConfig,
              tableName: table
            })
          }
        );

        const data = await res.json();
        if (data.success) {
          const cols = data.columns || data.rows || [];
          allCols.push(...cols.map(c => c.column_name));
        }
      }

      const unique = [...new Set(allCols)];
      setSourceColumns(unique.map(name => ({ column_name: name })));
    };

    fetchColumns();
  }, [sourceConfig?.selectedTables]);


  // 🟢 Fetch Destination Columns
  useEffect(() => {
    if (!destinationConfig?.table) return;

    fetch("http://localhost:5000/destination/get-destination-columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...destinationConfig,
        tableName: destinationConfig.table
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success)
          setDestinationColumns(data.columns || data.rows || []);
      });

  }, [destinationConfig?.table]);


  const handleMapping = (sourceCol, destCol) => {
    setMapping(prev => ({ ...prev, [sourceCol]: destCol }));
  };


  // 🚀 MIGRATE
  const handleMigrate = async () => {
    setError("");
    setMigrationResult(null);

    if (!sourceConfig?.selectedTables?.length)
      return setError("Please select at least one source table.");

    if (!destinationConfig?.table)
      return setError("Please select destination table.");

    if (!Object.keys(mapping).length)
      return setError("Please map at least one column.");

    const destValues = Object.values(mapping);
    if (new Set(destValues).size !== destValues.length)
      return setError("Duplicate destination column mapping detected.");

    setIsMigrating(true);

    const payload = {
      source: {
        ...sourceConfig,
        tables: sourceConfig?.selectedTables || [],
        joins: sourceConfig?.joins || []
      },
      destination: {
        ...destinationConfig,
        table: destinationConfig.table
      },
      mapping,
      autoJoin
    };

    console.log("🚀 FINAL MULTI-TABLE MIGRATION PAYLOAD", payload);

    try {
      const res = await fetch("http://localhost:5000/migration/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("🔥 MIGRATION RESULT", data);
      setMigrationResult(data);

    } catch {
      setError("Migration failed due to network/server issue.");
    }

    setIsMigrating(false);
  };


  return (
    <div className="mt-4">

      {!sourceColumns.length || !destinationColumns.length ? (
        <p className="text-gray-200">
          Select Source tables & Destination table to view mapping...
        </p>
      ) : (
        <div>

          <table className="w-full border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left text-black font-bold">
                  Source Column
                </th>
                <th className="p-2 text-center text-black font-bold">
                  Map To
                </th>
                <th className="p-2 text-left text-black font-bold">
                  Destination Column
                </th>
              </tr>
            </thead>

            <tbody>
              {sourceColumns.map((src, idx) => (
                <tr key={idx} className="border bg-white">
                  <td className="p-2 text-black font-semibold">
                    {src.column_name}
                  </td>

                  <td className="p-2 text-center">➡️</td>

                  <td className="p-2">
                    <select
                      className="p-2 border rounded-lg w-full text-black bg-white"
                      onChange={(e) =>
                        handleMapping(src.column_name, e.target.value)
                      }
                    >
                      <option value="">Select Destination</option>

                      {destinationColumns.map((dest, i) => (
                        <option key={i} value={dest.column_name}>
                          {dest.column_name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          <div className="mt-4 bg-gray-100 p-3 rounded">
            <h3 className="font-semibold mb-1 text-gray-700">
              Current Mapping
            </h3>
            <pre className="text-sm text-gray-700">
              {JSON.stringify(mapping, null, 2)}
            </pre>
          </div>


          {error && (
            <div className="mt-3 bg-red-200 text-red-900 p-3 rounded font-semibold">
              {error}
            </div>
          )}

          <button
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleMigrate}
            disabled={isMigrating}
          >
            {isMigrating ? "Migrating..." : "Migrate Data"}
          </button>


          {migrationResult && (
            <div className={`mt-6 p-5 rounded-xl shadow-lg border ${
              migrationResult.success
                ? "bg-green-100 border-green-400 text-green-900"
                : "bg-red-100 border-red-400 text-red-900"
            }`}>
              <h2 className="text-2xl font-bold mb-3">
                {migrationResult.success
                  ? "🎉 Migration Successful"
                  : "❌ Migration Failed"}
              </h2>

              <pre>{JSON.stringify(migrationResult, null, 2)}</pre>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
