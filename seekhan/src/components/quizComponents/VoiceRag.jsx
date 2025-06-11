import React, { useState, useContext } from "react";
import downloadFile from "../assets/downloadFile.png";
import axios from "axios";
import { AuthContext } from "../AuthorContext";
import { Copy, RotateCw } from "lucide-react";

function VoiceRag() {
  const [ragDetails, setRagDetails] = useState({
    mp3File: null,
    TypeQ: "",
    nQuestion: 0,
    loading: false,
    answers: "",
    mainQuestion: "",
  });

  const [mp3Array, setMp3Array] = useState([]);
  const { addToHistory } = useContext(AuthContext);

  const updateFile = (e) => {
    const file = e.target.files[0];
    setRagDetails((prev) => ({ ...prev, mp3File: file }));
  };

  const getAns = async (e) => {
    try {
      e.preventDefault();
      setRagDetails((prev) => ({ ...prev, loading: true }));

      const dataForm = new FormData();
      dataForm.append("type", ragDetails.TypeQ);
      dataForm.append("number", ragDetails.nQuestion);
      dataForm.append("file", ragDetails.mp3File);

      const response = await axios.post("http://127.0.0.1:5000/VoiceRag", dataForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const answers = response.data.message;
      const prompt = `Generate ${ragDetails.nQuestion} ${ragDetails.TypeQ} from file ${ragDetails.mp3File.name}`;
      const newEntry = { ...ragDetails, answers, mainQuestion: prompt };

      setMp3Array((prev) => [...prev, newEntry]);
      setRagDetails((prev) => ({ ...prev, answers }));
      addToHistory(prompt, answers);
    } catch (error) {
      const errMessage =
        error.response?.data?.message || error.message || "An error occurred.";
      const prompt = `Generate ${ragDetails.nQuestion} ${ragDetails.TypeQ} from file ${ragDetails.mp3File?.name || "uploaded file"}`;
      const newEntry = { ...ragDetails, answers: errMessage, mainQuestion: prompt };

      setMp3Array((prev) => [...prev, newEntry]);
      setRagDetails((prev) => ({
        ...prev,
        answers: errMessage,
        mainQuestion: prompt,
      }));
    } finally {
      setRagDetails((prev) => ({ ...prev, loading: false }));
    }
  };

  const retryGeneration = async (value) => {
    try {
      setRagDetails((prev) => ({ ...prev, loading: true }));

      const dataForm = new FormData();
      dataForm.append("type", value.TypeQ);
      dataForm.append("number", value.nQuestion);
      dataForm.append("file", value.mp3File);

      const response = await axios.post("http://127.0.0.1:5000/VoiceRag", dataForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const answers = response.data.message;
      const prompt = `Generate ${value.nQuestion} ${value.TypeQ} from file ${value.mp3File?.name || "uploaded file"}`;
      const newEntry = { ...value, answers, mainQuestion: prompt };

      setMp3Array((prev) => [...prev, newEntry]);
      addToHistory(prompt, answers);
    } catch (error) {
      const errMessage =
        error.response?.data?.message || error.message || "An error occurred.";
      const prompt = `Generate ${value.nQuestion} ${value.TypeQ} from file ${value.mp3File?.name || "uploaded file"}`;
      const newEntry = { ...value, answers: errMessage, mainQuestion: prompt };

      setMp3Array((prev) => [...prev, newEntry]);
    } finally {
      setRagDetails((prev) => ({ ...prev, loading: false }));
    }
  };

  const fileDownload = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const dataFile = new Blob([ragDetails.answers], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `answers_${ragDetails.TypeQ}_${ragDetails.nQuestion}_q_${timestamp}.txt`;
    link.href = URL.createObjectURL(dataFile);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-[1100px] h-screen bg-gray-800 p-8 rounded-xl shadow-lg space-y-6 flex flex-col gap-y-[2px]">
        <p className="text-white text-4xl font-semibold mb-8">
          Generate from Transcript
        </p>

        <div className="flex-grow bg-gray-900 w-full flex flex-col h-auto overflow-y-auto scrollbar text-white">
          {mp3Array.map((value, index) => (
            <div key={index} className="mb-6">
              <label className="font-semibold">{value.mainQuestion}</label>
              <p
                className={`rounded-lg m-4 p-4 text-lg whitespace-pre-wrap ${
                  value.answers.startsWith("An error") || value.answers.includes("error")
                    ? "bg-red-100 text-red-800"
                    : "bg-[#DADADA] text-[#002D62]"
                }`}
              >
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
                  className="text-sm text-blue-400 hover:text-blue-600 flex items-center"
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
            onSubmit={getAns}
          >
            <div className="flex flex-row gap-x-5">
              <div className="flex-grow space-y-2">
                <div>
                  <label className="block text-white" htmlFor="file">
                    Upload a file:
                  </label>
                  <input
                    type="file"
                    accept=".mp3"
                    id="file"
                    onChange={updateFile}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-white">
                    Question Type:
                  </label>
                  <select
                    name="type"
                    onChange={(e) =>
                      setRagDetails((prev) => ({
                        ...prev,
                        TypeQ: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg bg-gray-600 text-white"
                    defaultValue=""
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
                    value={ragDetails.nQuestion}
                    onChange={(e) =>
                      setRagDetails((prev) => ({
                        ...prev,
                        nQuestion: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg bg-gray-600 text-white"
                    placeholder="Number of questions"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full p-3 bg-blue-600 text-white rounded-lg"
                >
                  {ragDetails.loading ? "Generating..." : "Generate Questions"}
                </button>
              </div>
            </div>
          </form>
          <div>
            <button onClick={fileDownload} className="ml-4">
              <img
                src={downloadFile}
                alt="Download File"
                className="w-[50px] h-[50px] mt-7"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceRag;
