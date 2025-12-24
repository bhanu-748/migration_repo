import React from "react";

export default function TableMapping({ sourceTables, destinationTables, onMap }) {

  if (!sourceTables?.length || !destinationTables?.length) {
    return (
      <p className="text-gray-400 mt-3">
        Connect both DBs and select tables to map…
      </p>
    );
  }

  return (
    <div className="mt-4 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold text-black mb-3">
        🔗 Table Mapping
      </h2>

      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th className="p-2 text-left">Source Table</th>
            <th className="p-2 text-center">Map To</th>
            <th className="p-2 text-left">Destination Table</th>
          </tr>
        </thead>

        <tbody>
          {sourceTables.map((src, i) => (
            <tr key={i} className="border">
              <td className="p-2 text-black font-semibold">
                {src}
              </td>

              <td className="text-center">➡️</td>

              <td className="p-2">
                <select
                  className="p-2 border rounded w-full text-black"
                  onChange={(e) => onMap(src, e.target.value)}
                >
                  <option value="">Select Destination Table</option>

                  {destinationTables.map((dest, j) => (
                    <option key={j} value={dest}>
                      {dest}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
