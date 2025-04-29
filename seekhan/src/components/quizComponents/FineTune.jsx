import React, { useState, useContext } from "react";
import downloadFile from "../assets/downloadFile.png";
import { AuthContext } from "../AuthorContext";
import axios from "axios";

function FineTune() {
  const [topic, setTopic] = useState("");
  const [question, setQuestions] = useState(0);
  const [type, setType] = useState("");
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToHistory } = useContext(AuthContext);

  const pushPrompt = (answer) => {
    const questionText = `Generate ${question} ${type} questions on the topic "${topic}"`;
    addToHistory(questionText, answer);
    setTopic("");
    setQuestions(0);
    setType("");
  };

  const pushAll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:5000/submit", {
        Topic: topic,
        noQ: question,
        Type: type,
      });
      setAnswers((prev) => [...prev, response.data.message]);
      pushPrompt(response.data.message);

      // if (response.ok) {
      //   try {
      //     await fetch("http://localhost:6969/prompt", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         userPrompt: `Generate ${question} ${type} questions on ${topic}`,
      //         answer: result.Result,
      //       }),
      //     });
      //   } catch (backendError) {
      //     console.error(`Backend error: ${backendError.message}`);
      //   }
      // } else {
      //   setError(result.error || "Something went wrong");
      // }
    } catch (fetchError) {
      setError("Error connecting to the backend");
      console.error("Error:", fetchError);
    } finally {
      setLoading(false);
    }
  };

  const getFileDownload = async () => {
    try {
      setLoading(true);
      const timestamp = Math.floor(Date.now() / 1000);
      const dataFile = new Blob([answers.join("\n")], { type: "text/plain" });
      const link = document.createElement("a");

      link.download = `answers_${type}_${question}_q_${timestamp}.txt`;
      link.href = URL.createObjectURL(dataFile);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (downloadError) {
      console.error(`Download error: ${downloadError.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-[1100px] h-screen bg-gray-800 p-8 rounded-xl shadow-lg space-y-6 flex flex-col gap-y-[2px] ">
        <p className="text-white text-4xl font-semibold mb-8">Ask AI</p>

        <div className="flex-grow bg-gray-900 w-full flex flex-col h-auto overflow-y-auto scrollbar text-white">
          {error && (
            <div className="bg-red-600 text-white p-2 rounded-lg ">
              <strong>Error:</strong> {error}
            </div>
          )}
          {answers.length > 0 && (
            <div className="bg-gray-700 text-white p-4 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">
                Generated Questions
              </h3>
              {answers.map((value, index) => (
                <div className="bg-gray-600 p-2 mb-2 rounded-lg" key={index}>
                  <p>{value.question}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-row">
          <form
            className="space-y-4 bg-gray-800 min-h-[150px] flex-grow"
            onSubmit={pushAll}
          >
            <div className="flex flex-row gap-x-5">
              <div className="flex-grow space-y-2">
                <div>
                  <label className="block text-white" htmlFor="topic">
                    Enter the topic:
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400"
                    placeholder="Topic"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-white">
                    Question Type:
                  </label>
                  <select
                    name="type"
                    className="w-full p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400"
                    onChange={(e) => setType(e.target.value)}
                    value={type}
                  >
                    <option value="" disabled>
                      ------- Select Question Type -------
                    </option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="fill-in-the-blank">Fill-in-the-Blank</option>
                  </select>
                </div>
              </div>
              <div className="w-[300px] flex flex-col justify-center items-center gap-y-7">
                <div className="w-[300px] flex flex-row justify-center items-center gap-x-2">
                  <div className="flex-grow">
                    <label className="block text-white" htmlFor="questions">
                      Number of questions:
                    </label>
                    <input
                      type="number"
                      id="questions"
                      min={1}
                      value={question}
                      onChange={(e) => setQuestions(Number(e.target.value))}
                      className="w-full p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400"
                      placeholder="Number of questions"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full p-3 bg-blue-600 text-white rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Questions"}
                </button>
              </div>
            </div>
          </form>
          <div>
            <button onClick={getFileDownload}>
              <img
                src={downloadFile}
                alt="Download File"
                className="w-[50px] h-[50px] mt-6 ml-[15px]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FineTune;
