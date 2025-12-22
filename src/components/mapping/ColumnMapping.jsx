import React, { useEffect, useState } from "react";

export default function ColumnMapping({ sourceConfig, destinationConfig }) {

  const [sourceColumns, setSourceColumns] = useState([]);
  const [destinationColumns, setDestinationColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [migrationResult, setMigrationResult] = useState(null);

  // Phase2 Additions
  const [error, setError] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);


  // 🔵 Fetch Source Columns
  useEffect(() => {
    if (!sourceConfig || !sourceConfig.table) return;

    console.log("🔵 Calling SOURCE API...");

    fetch("http://localhost:5000/source/get-source-columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sourceConfig,
        tableName: sourceConfig.table
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log("SOURCE COLUMN API RESPONSE 🔵", data);
        if (data.success) setSourceColumns(data.columns || data.rows || []);
      });

  }, [sourceConfig?.table]);


  // 🟢 Fetch Destination Columns
  useEffect(() => {
    if (!destinationConfig || !destinationConfig.table) return;

    console.log("🟢 Calling DEST API...");

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
        console.log("DEST COLUMN API RESPONSE 🟢", data);
        if (data.success) setDestinationColumns(data.columns || data.rows || []);
      });

  }, [destinationConfig?.table]);


  // Handle Mapping
  const handleMapping = (sourceCol, destCol) => {
    setMapping(prev => ({
      ...prev,
      [sourceCol]: destCol
    }));
  };


  // 🚀 MIGRATION HANDLER WITH VALIDATION
  const handleMigrate = async () => {
    setError("");
    setMigrationResult(null);

    // 1️⃣ Check DB Connections
    if (!sourceConfig || !destinationConfig) {
      setError("Please connect both Source & Destination databases.");
      return;
    }

    // 2️⃣ Check Table Selection
    if (!sourceConfig.table || !destinationConfig.table) {
      setError("Please select both Source & Destination tables.");
      return;
    }

    // 3️⃣ Check Mapping Present
    if (!Object.keys(mapping).length) {
      setError("Please map at least one column before migrating.");
      return;
    }

    // 4️⃣ Check Duplicate Destination Columns
    const destValues = Object.values(mapping);
    const hasDuplicates = new Set(destValues).size !== destValues.length;

    if (hasDuplicates) {
      setError("Duplicate destination column mapping detected. Each destination column must be mapped only once.");
      return;
    }

    setIsMigrating(true);

    const payload = {
      source: sourceConfig,
      destination: destinationConfig,
      mapping
    };

    console.log("🚀 MIGRATION PAYLOAD", payload);

    try {
      const res = await fetch("http://localhost:5000/migration/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("🔥 MIGRATION RESULT", data);

      setMigrationResult(data);
    } catch (e) {
      setError("Migration failed due to network/server issue.");
    }

    setIsMigrating(false);
  };



  return (
    <div className="mt-4">

      {!sourceColumns.length || !destinationColumns.length ? (
        <p className="text-gray-200">
          Select both Source & Destination tables to view mapping...
        </p>
      ) : (
        <div>

          {/* TABLE */}
          <table className="w-full border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left text-black font-bold">Source Column</th>
                <th className="p-2 text-center text-black font-bold">Map To</th>
                <th className="p-2 text-left text-black font-bold">Destination Column</th>
              </tr>
            </thead>

            <tbody>
              {sourceColumns.map((src, idx) => {
                const srcName = src.column_name;

                return (
                  <tr key={idx} className="border bg-white">
                    <td className="p-2 text-black font-semibold">
                      {srcName}
                    </td>

                    <td className="p-2 text-center">➡️</td>

                    <td className="p-2">
                      <select
                        className="p-2 border rounded-lg w-full text-black bg-white"
                        onChange={(e) => handleMapping(srcName, e.target.value)}
                      >
                        <option value="">Select Destination</option>

                        {destinationColumns.map((dest, i) => {
                          const destName = dest.column_name;
                          return (
                            <option key={i} value={destName}>
                              {destName}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mapping Preview */}
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <h3 className="font-semibold mb-1 text-gray-700">
              Current Mapping
            </h3>
            <pre className="text-sm text-gray-700">
              {JSON.stringify(mapping, null, 2)}
            </pre>
          </div>

          {/* Error Box */}
          {error && (
            <div className="mt-3 bg-red-200 text-red-900 p-3 rounded font-semibold">
              {error}
            </div>
          )}

          {/* MIGRATE BUTTON */}
          <button
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleMigrate}
            disabled={isMigrating}
          >
            {isMigrating ? "Migrating..." : "Migrate Data"}
          </button>

          {/* RESULT */}
          {migrationResult && (
            <div className={`mt-6 p-5 rounded-xl shadow-lg border 
                ${migrationResult.success 
                ? "bg-green-100 border-green-400 text-green-900" 
                : "bg-red-100 border-red-400 text-red-900"
                }`}>

                <h2 className="text-2xl font-bold mb-3">
                {migrationResult.success ? "🎉 Migration Successful" : "❌ Migration Failed"}
                </h2>

                {migrationResult.success ? (
                <div className="space-y-1 text-lg">
                    <p><span className="font-semibold">Total Records:</span> {migrationResult.totalRecords}</p>
                    <p><span className="font-semibold">Inserted:</span> {migrationResult.inserted}</p>
                    <p><span className="font-semibold">Skipped (Duplicates):</span> {migrationResult.skippedDuplicates}</p>
                    <p><span className="font-semibold">Failed:</span> {migrationResult.failed}</p>
                </div>
                ) : (
                <p className="text-lg">
                    {migrationResult.message} <br/>
                    {migrationResult.error && (
                    <span className="font-semibold">Reason: {migrationResult.error}</span>
                    )}
                </p>
                )}
            </div>
            )}


        </div>
      )}
    </div>
  );
}
