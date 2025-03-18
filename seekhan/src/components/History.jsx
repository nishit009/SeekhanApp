import React from "react";
import { AuthContext } from "./AuthorContext";
import { useContext } from "react";
const History = () => {
  const { history } = useContext(AuthContext);

  console.log(history);
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">History</h1>
      {history.length > 0 ? (
        <div className="w-full max-w-4xl space-y-4">
          {history.map((entry, index) => {
            // Safely extract question and answer
            const question =
              typeof entry.question === "string"
                ? entry.question
                : JSON.stringify(entry.question, null, 2); // Convert objects to string
            const answer =
              typeof entry.answer === "string"
                ? entry.answer
                : JSON.stringify(entry.answer, null, 2);

            return (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded shadow-md border border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-2">Prompt:</h2>
                <p className="text-gray-300 mb-2">{question}</p>
                <h3 className="text-lg font-semibold">Result:</h3>
                <p className="text-gray-400">{answer}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">No history available yet.</p>
      )}
    </div>
  );
};

export default History;
