import React, { useState } from "react";

import SourceDBForm from "../components/source/SourceDBForm";
import DestinationDBForm from "../components/destination/DestinationDBForm";
import ColumnMapping from "../components/mapping/ColumnMapping";
import JoinBuilder from "../components/mapping/JoinBuilder";

export default function MigrationPage() {

  const [sourceConfig, setSourceConfig] = useState(null);
  const [destinationConfig, setDestinationConfig] = useState(null);
  const [joinRules, setJoinRules] = useState([]);

  // Optional future feature toggle
  const [autoJoin, setAutoJoin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">

      {/* Header */}
      <h1 className="text-4xl font-bold mb-6">Data Migration Tool</h1>

      <p className="text-gray-300 mb-8">
        Seamlessly migrate data from Source Database to Destination Database
      </p>

      {/* Source + Destination */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

        {/* SOURCE */}
        <div className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            Source Database
          </h2>

          <p className="text-gray-500">
            Connect to your source PostgreSQL database and select tables.
          </p>

          <div className="mt-4">
            <SourceDBForm onConnected={setSourceConfig} />
          </div>
        </div>

        {/* DESTINATION */}
        <div className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border">
          <h2 className="text-2xl font-semibold mb-4 text-green-700">
            Destination Database
          </h2>

          <p className="text-gray-500">
            Connect to your destination PostgreSQL database and select a table.
          </p>

          <div className="mt-4">
            <DestinationDBForm onConnected={setDestinationConfig} />
          </div>
        </div>
      </div>


      {/* OPTIONAL SMART JOIN TOGGLE (Future feature) */}
      <div className="w-full max-w-6xl mt-8 bg-white p-4 rounded-lg text-black border">
        <label className="flex items-center gap-3 text-lg font-semibold">
          <input
            type="checkbox"
            checked={autoJoin}
            onChange={() => setAutoJoin(!autoJoin)}
          />
          Enable Smart Auto Join (Future)
        </label>

        <p className="text-gray-600 text-sm mt-1">
          (Currently using manual Join Builder)
        </p>
      </div>


      {/* JOIN BUILDER */}
      {sourceConfig?.selectedTables?.length > 1 && !autoJoin && (
        <JoinBuilder
          sourceConfig={sourceConfig}
          onJoinUpdate={setJoinRules}
        />
      )}


      {/* COLUMN MAPPING SECTION */}
      <div className="w-full max-w-6xl mt-10">
        <div className="bg-white shadow-lg rounded-xl p-6 border">
          
          <h2 className="text-2xl font-semibold text-purple-700">
            Column Mapping
          </h2>

          <p className="text-gray-500">
            After selecting tables and joins, map source fields to destination fields.
          </p>

          <div className="mt-4">
            {(sourceConfig && destinationConfig) ? (
              
              <ColumnMapping
                sourceConfig={{
                  ...sourceConfig,
                  joins: joinRules
                }}
                destinationConfig={destinationConfig}
                autoJoin={autoJoin}     // ⭐ ADD THIS
              />


            ) : (
              <p className="text-gray-600">
                Connect both databases and select tables to continue…
              </p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
