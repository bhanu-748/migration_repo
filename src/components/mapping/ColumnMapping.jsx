import React, { useEffect, useState } from "react";

export default function ColumnMapping({ sourceConfig, destinationConfig }) {

  const [sourceColumns, setSourceColumns] = useState([]);
  const [destinationColumns, setDestinationColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [migrationResult, setMigrationResult] = useState(null);


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


  const handleMapping = (sourceCol, destCol) => {
    setMapping(prev => ({
      ...prev,
      [sourceCol]: destCol
    }));
  };

  const handleMigrate = async () => {
  if (!sourceConfig || !destinationConfig) {
    alert("Connect both Source & Destination first");
    return;
  }

  if (!Object.keys(mapping).length) {
    alert("Please map at least one column");
    return;
  }

  const payload = {
    source: sourceConfig,
    destination: destinationConfig,
    mapping
  };

  console.log("🚀 MIGRATION PAYLOAD", payload);

  const res = await fetch("http://localhost:5000/migration/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("🔥 MIGRATION RESULT", data);

  setMigrationResult(data);
};



  return (
    <div className="mt-4">

      {!sourceColumns.length || !destinationColumns.length ? (
        <p className="text-gray-500">
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

          <button
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            onClick={handleMigrate}
            >
            Migrate Data
        </button>

        {migrationResult && (
            <div className="mt-6 bg-white p-4 rounded shadow text-black">
                <h3 className="text-xl font-bold mb-2">
                {migrationResult.success ? "✅ Migration Completed" : "❌ Migration Failed"}
                </h3>

                <pre className="text-sm">
                {JSON.stringify(migrationResult, null, 2)}
                </pre>
            </div>
            )}


        </div>
      )}
    </div>
  );
}
