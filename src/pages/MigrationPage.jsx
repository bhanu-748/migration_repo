import React, { useState } from "react";

import SourceDBForm from "../components/source/SourceDBForm";
import DestinationDBForm from "../components/destination/DestinationDBForm";
import ColumnMapping from "../components/mapping/ColumnMapping";

export default function MigrationPage() {

  const [sourceConfig, setSourceConfig] = useState(null);
  const [destinationConfig, setDestinationConfig] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">

      {/* Header */}
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-md">
        Data Migration Tool
      </h1>

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

      {/* COLUMN MAPPING SECTION */}
      <div className="w-full max-w-6xl mt-10">
        <div className="bg-white shadow-lg rounded-xl p-6 border">
          <h2 className="text-2xl font-semibold text-purple-700">
            Column Mapping
          </h2>

          <p className="text-gray-500">
            After selecting source & destination tables, you’ll map columns here.
          </p>

          <div className="mt-4">
            <ColumnMapping
              sourceConfig={sourceConfig}
              destinationConfig={destinationConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
