import React, { useState, useContext } from "react";
import downloadFile from "../assets/downloadFile.png";
import { AuthContext } from "../AuthorContext";
import axios from "axios";
import { Copy, RotateCw } from "lucide-react";

function FineTune() {
  const [topic, setTopic] = useState("");
  const [question, setQuestions] = useState(0);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState([]);
  const { addToHistory } = useContext(AuthContext);

  const pushAll = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/submit", {
        Topic: topic,
        noQ: question,
        Type: type,
      });

      const answers = response.data.message;
      const mainQuestion = `Generate ${question} ${type} questions on the topic "${topic}"`;
      const entry = {
        topic,
        questionType: type,
        numberOfQuestions: question,
        answers,
        mainQuestion,
      };

      setOutput((prev) => [...prev, entry]);
      addToHistory(mainQuestion, answers);

      setTopic("");
      setQuestions(0);
      setType("");
    } catch (error) {
      const errorMsg = "Error connecting to the backend";
      const mainQuestion = `Generate ${question} ${type} questions on the topic "${topic}"`;
      const entry = {
        topic,
        questionType: type,
        numberOfQuestions: question,
        answers: errorMsg,
        mainQuestion,
      };

      setOutput((prev) => [...prev, entry]);
    } finally {
      setLoading(false);
    }
  };

  const retryGeneration = async (value) => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/submit", {
        Topic: value.topic,
        noQ: value.numberOfQuestions,
        Type: value.questionType,
      });

      const answers = response.data.message;
      const mainQuestion = `Generate ${value.numberOfQuestions} ${value.questionType} questions on the topic "${value.topic}"`;
      const entry = { ...value, answers, mainQuestion };

      setOutput((prev) => [...prev, entry]);
      addToHistory(mainQuestion, answers);
    } catch (error) {
      const errorMsg = "Error connecting to the backend";
      const mainQuestion = `Generate ${value.numberOfQuestions} ${value.questionType} questions on the topic "${value.topic}"`;
      const entry = { ...value, answers: errorMsg, mainQuestion };

      setOutput((prev) => [...prev, entry]);
    } finally {
      setLoading(false);
    }
  };

  const getFileDownload = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const dataFile = new Blob([output.map((o) => o.answers).join("\n\n")], {
      type: "text/plain",
    });
    const link = document.createElement("a");
    link.download = `answers_${type}_${question}_q_${timestamp}.txt`;
    link.href = URL.createObjectURL(dataFile);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-[1100px] h-screen bg-gray-800 p-8 rounded-xl shadow-lg space-y-6 flex flex-col gap-y-[2px]">
        <p className="text-white text-4xl font-semibold mb-8">Ask AI</p>

        <div className="flex-grow bg-gray-900 w-full flex flex-col h-auto overflow-y-auto scrollbar text-white">
          {output.map((value, index) => (
            <div key={index} className="mb-6">
              <label className="font-semibold">{value.mainQuestion}</label>
              <p className="bg-[#DADADA] rounded-lg m-4 p-4 text-lg text-[#002D62] whitespace-pre-wrap">
                {value.answers}
              </p>
              <div className="flex items-center gap-4 ml-4">
                <button
                  onClick={() => navigator.clipboard.writeText(value.answers)}
                  className="text-sm text-blue-400 hover:text-blue-600 flex items-center"
                >
                  <Copy size={16} className="mr-1" /> Copy
                </button>
                <button
                  onClick={() => retryGeneration(value)}
                  className="text-sm text-yellow-400 hover:text-yellow-600 flex items-center"
                >
                  <RotateCw size={16} className="mr-1" /> Retry
                </button>
              </div>
            </div>
          ))}
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
                <div className="w-[300px]">
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
