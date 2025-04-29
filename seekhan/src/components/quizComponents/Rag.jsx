import React, { useEffect, useState, useContext } from "react";
import downloadFile from "../assets/downloadFile.png";
import axios from "axios";
import { AuthContext } from "../AuthorContext";
import {Copy} from "lucide-react";

function Rag() {
  const [details, setDetails] = useState({
    file: null,
    questionType: "",
    numberOfQuestions: 0,
    loading: false,
    answers: "",
    mainQuestion: "",
    id: Date.now(),
  });
  const [output, setOutput] = useState([]);
  const { addToHistory } = useContext(AuthContext);

  // useEffect(() => {
  //   const savedOutput = localStorage.getItem("output");
  //   if (savedOutput) {
  //     setOutput(JSON.parse(savedOutput));
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("output", JSON.stringify(output));
  // }, [output]);

  const fileUpdate = (e) => {
    const file = e.target.files[0];
    setDetails((prev) => ({ ...prev, file: file }));
  };

  const getQuestions = async (e) => {
    try {
      e.preventDefault();
      setDetails((prev) => ({ ...prev, loading: true }));
      const formData = new FormData();
      formData.append("type", details.questionType);
      formData.append("number", details.numberOfQuestions);
      formData.append("file", details.file);
      const response = await axios.post("http://127.0.0.1:5000/Rag", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const answers = response.data.message;
      setDetails((prev) => ({ ...prev, answers: answers }));
      setOutput((prev) => [...prev, { ...details, answers }]);
      let prompt = `generate ${details.numberOfQuestions} ${details.questionType} from this file ${details.file}`;
      addToHistory(prompt, answers);
    } catch (error) {
      const errorMessage = error;
      setDetails((prev) => ({
        ...prev,
        answers: errorMessage,
      }));
      setOutput((prev) => [...prev, { ...details, errorMessage }]);
    }
    setDetails((prev) => ({ ...prev, loading: false }));
  };

  const getFileDownload = async () => {
    try {
      setDetails((prev) => ({ ...prev, loading: true }));
      const timestamp = Math.floor(Date.now() / 1000);
      const dataFile = new Blob([details.answers], { type: "text/plain" });
      const link = document.createElement("a");
      link.download = `answers_${details.questionType}_${details.numberOfQuestions}_q_${timestamp}.txt`;
      link.href = URL.createObjectURL(dataFile);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.log(`Error in the react to backend: ${error}`);
    }
    setDetails((prev) => ({ ...prev, loading: false }));
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-[1100px] h-screen bg-gray-800 p-8 rounded-xl shadow-lg space-y-6 flex flex-col gap-y-[2px]">
        <p className="text-white text-4xl font-semibold mb-8">
          Generate from PDF
        </p>

        <div className="flex-grow bg-gray-900 w-full flex flex-col h-auto overflow-y-auto scrollbar text-white">
          {output.map((value, index) => (
            <div key={index}>
              <label>{value.mainQuestion}</label>
              <p className="bg-[#DADADA] rounded-lg m-4 text-lg text-[#002D62]">
                {value.answers}
              </p>
              <button>{Copy}</button>
            </div>
          ))}
        </div>
        <div className="flex flex-row">
          <form
            className="space-y-4 bg-gray-800 min-h-[150px] flex-grow"
            onSubmit={getQuestions}
          >
            <div className="flex flex-row gap-x-5">
              <div className="flex-grow space-y-2">
                <div>
                  <label className="block text-white" htmlFor="file">
                    Upload a file:
                  </label>
                  <input
                    type="file"
                    id="file"
                    onChange={fileUpdate}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-white">
                    Question Type:
                  </label>
                  <select
                    name="type"
                    onChange={(e) =>
                      setDetails((prev) => ({
                        ...prev,
                        questionType: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400"
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
                <div className="w-[300px] flex flex-row justify-center items-center gap-x-2">
                  <div className="flex-grow">
                    <label className="block text-white" htmlFor="questions">
                      Number of questions:
                    </label>
                    <input
                      type="number"
                      id="questions"
                      min={1}
                      value={details.numberOfQuestions}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          numberOfQuestions: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-lg bg-gray-600 text-white placeholder-gray-400"
                      placeholder="Number of questions"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full p-3 bg-blue-600 text-white rounded-lg"
                >
                  {details.loading ? "Generating..." : "Generate Questions"}
                </button>
              </div>
            </div>
          </form>
          <div>
            <button onClick={getFileDownload} className="ml-4">
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

export default Rag;
