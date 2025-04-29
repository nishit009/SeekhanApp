from langchain_ollama import OllamaLLM
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import logging
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import os
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from PyPDF2 import PdfReader
from chromadb.config import Settings
from RAG import extract_text_from_pdf,ollama_llm,rag_chain,format_docs 
from VoiceRAG import transcribe_audio,ollama_llm,rag_chain,format_docs
from langchain_community.vectorstores import FAISS
import warnings
import re

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0" 
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  
warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 
logging.basicConfig(level=logging.INFO)
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
try:
    model = OllamaLLM(model="seekhan")
except Exception as e:
    logging.error(f"Failed to initialize model: {e}")
    model = None
    

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.get_json()
        logging.info(f"Received input: {data}")
        topic = data.get("Topic")
        num_questions = data.get("noQ")
        question_type = data.get("Type")

        if not topic or not question_type:
            return jsonify({"error": "Missing required fields"}), 400
        if not isinstance(num_questions, int) or num_questions <= 0:
            return jsonify({"error": "Number of questions must be a positive integer"}), 400
        if model is None:
            return jsonify({"error": "Model is not initialized"}), 500
        prompt = f"first generate {num_questions} {question_type} questions on {topic} and generate answers seperately after all the questions."
        labels = [
            "data structures and algorithms",
            "programming concepts",
            "software engineering",
            "databases and data management",
            "machine learning and data science"
            "Artificial Intelligence",
            "Operating Systems",
            "Computer Networks",
            "Cybersecurity",
            "Cloud Computing",
            "Distributed Systems",
            "Blockchain Technology",
            "Compiler Design",
            "Computer Architecture",
            "Human-Computer Interaction",
            "Mobile Application Development",
            "Web Development",
            "Internet of Things (IoT)",
            "Big Data",
            "React Hooks",
            "Data Abstraction",
            "Natural Language Processing",
            "Robotics",
            "Quantum Computing",
            "Graph Theory",
            "Image Processing",
            "Computer Vision",
            "Augmented Reality",
            "Virtual Reality",
            "Embedded Systems",
            "DevOps",
            "Software Testing and Quality Assurance",
            "Agile Methodologies",
            "Version Control Systems",
            "Cryptography",
            "Functional Programming",
            "Object-Oriented Programming",
            "Game Development",
            "Bioinformatics",
            "Ethical Hacking",
            "Digital Signal Processing",
            "Data Visualization",
            "Reinforcement Learning",
            "Edge Computing",
            "Neural Networks",
            "Autonomous Systems",
            "Hardware Design",
            "Semantic Web",
            "API Development",
            "Data Mining",
            "Penetration Testing",
            "Information Retrieval"
        ]
        model_path=r"C:\Users\nishi\Downloads\distilbart_model"
        model1=AutoModelForSequenceClassification.from_pretrained(model_path)
        tokenizerr=AutoTokenizer.from_pretrained(model_path)
        classifier = pipeline(
            "zero-shot-classification",
            model=model1,tokenizer=tokenizerr,
            framework="pt",
            device=-1
        )
        classification = classifier(topic, labels)
        if classification["labels"][0] in labels and classification["scores"][0] > 0.4:
            result = model.invoke(input=prompt)
            torch.cuda.empty_cache()
            logging.info(f"Questions generated successfully for topic: {topic} result: {result}")
            question_blocks = re.split(r'\n?(Question \d+:)', result)

            questions_list = []

            for i in range(1, len(question_blocks), 2):
                question_text = question_blocks[i] + " " + question_blocks[i + 1]  # Merge question number and content

                # Extract answer
                answer_match = re.search(r'Answer:\s*(.*)', question_text, re.IGNORECASE)
                answer = answer_match.group(1).strip() if answer_match else None

                # Remove answer from question text
                question_text = re.sub(r'Answer:.*', '', question_text, flags=re.IGNORECASE).strip()

                # Extract options as a list
                options = re.findall(r'[a-d]\)\s(.*)', question_text)

                # Remove options from question text
                question_text = re.sub(r'[a-d]\)\s.*', '', question_text).strip()

                # Determine question type
                if options:
                    question_type = "multiple_choice"
                elif "True or False" in question_text:
                    question_type = "true_false"
                elif "______" in question_text:
                    question_type = "fill_in_the_blank"
                else:
                    question_type = "other"

                # Store structured question
                questions_list.append({
                    "question": question_text,
                    "options": options if options else None,
                    "answer": answer,
                    "type": question_type
                })
            return jsonify({"message":questions_list})
        else:
            torch.cuda.empty_cache()
            return jsonify({"message":f"Sorry, the topic '{topic}' is out of the domain of computer science. Try again with a relevant topic."})
        # result = model.invoke(input=prompt)
        # logging.info(f"Questions generated successfully for topic: {topic} result: {result}")
        # return jsonify({"Result": result})
    except Exception as e:
        logging.error(f"Error generating questions: {e}")
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500

# @app.route("/Rag", methods=["POST", "GET"])
# def main():
#     try:
#         qType = request.form.get('type', None)
#         numberOfQ = request.form.get("number", None)
#         file = request.files.get('file', None)

#         if not qType or not numberOfQ or not file:
#             logging.warning("Missing 'qType', 'numberOfQ', or 'file' in the request.")
#             return jsonify({"message": "qtype, numberOfQ, or file is missing"}), 400

#         logging.info(f"Received file submission: type={qType}, Filename={file.filename}, number={numberOfQ}")

#         if file.filename.endswith('.pdf'):
#             file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
#             file.save(file_path)
#             document_text = extract_text_from_pdf(file_path)
#             text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#             splits = text_splitter.split_text(document_text)
#             documents = [Document(page_content=text) for text in splits]

#             chroma_settings = Settings(
#                 chroma_api_impl="rest",
#                 chroma_server_host="127.0.0.1",
#                 chroma_server_http_port="8000",
#                 tenant_id="default_tenant"  # Change as needed
#             )
#             embeddings = OllamaEmbeddings(model="seekhan")
#             vectorstore = Chroma.from_documents(
#                 documents=documents,
#                 embedding=embeddings,
#                 client_settings=chroma_settings
#             )

#             retriever = vectorstore.as_retriever()
#             Prompt = f"Generate {numberOfQ} {qType}"
#             retriever_doc = retriever.invoke(Prompt)
#             formatted_context = format_docs(retriever_doc)
#             result = ollama_llm(Prompt, formatted_context)
#         else:
#             logging.info("File is not a PDF. No further processing.")
#             return jsonify({"message": "only .pdf accept"})

#         logging.info(f"Generated Text (if any): {result}")
#         return jsonify({"message": f"generated text {result}"}), 200

#     except Exception as e:
#         logging.error(f"Error generating questions: {e}")
#         return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# route creation for Voice rag
@app.route("/VoiceRag",methods=["POST","GET"])
def main():
    try:
        qType = request.form.get('type', None)
        numberOfQ=request.form.get("number",None)
        file = request.files.get('file', None)
        
        if not qType or not numberOfQ or not file:
            logging.warning("Missing 'qType' or 'numberOfQ' or 'file'in the request.")
            return jsonify({"message": "qtype or numberOfQ or file is missing"}), 400
        
        logging.info(f"Received file submission: type={qType}, Filename={file.filename} ,number={numberOfQ}")
        if file.filename.endswith('.mp3'):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
            document_text=transcribe_audio(file_path)
            text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
            splits=text_splitter.split_text(document_text)
            
            documents=[Document(page_content=text) for text in  splits]
            embeddings=OllamaEmbeddings(model="seekhan")
            vectorstore = FAISS.from_documents(documents=documents, embedding=embeddings)
        
            retriever = vectorstore.as_retriever()
            
            Prompt = f"Generate {numberOfQ} {qType}"
            retriever_doc=retriever.invoke(Prompt)
            formatted_context=format_docs(retriever_doc)
            result=ollama_llm(Prompt,formatted_context)
        else:
            logging.info("File is not a MP3. No further processing.")
            return jsonify({"message":"only .mp3 accept"})
        
        logging.info(f"generated Text (if any): {result}")
        return jsonify({
            "message": f"generated text {result}",
        }), 200
        
        
    except Exception as e:
        logging.error(f"Error generating questions: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/Rag",methods=["POST","GET"])
def rag():
    try:
        qType = request.form.get('type', None)
        numberOfQ=request.form.get("number",None)
        file = request.files.get('file', None)
        
        if not qType or not numberOfQ or not file:
            logging.warning("Missing 'qType' or 'numberOfQ' or 'file'in the request.")
            return jsonify({"message": "qtype or numberOfQ or file is missing"}), 400
        
        logging.info(f"Received file submission: type={qType}, Filename={file.filename} ,number={numberOfQ}")
        if file.filename.endswith('.pdf'):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
            document_text=extract_text_from_pdf(file_path)
            text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
            splits=text_splitter.split_text(document_text)
            
            documents=[Document(page_content=text) for text in  splits]
            embeddings=OllamaEmbeddings(model="seekhan")
            vectorstore = FAISS.from_documents(documents=documents, embedding=embeddings)
        
            retriever = vectorstore.as_retriever()
            
            Prompt = f"Generate {numberOfQ} {qType}"
            retriever_doc=retriever.invoke(Prompt)
            formatted_context=format_docs(retriever_doc)
            result=ollama_llm(Prompt,formatted_context)
        else:
            logging.info("File is not a PDF. No further processing.")
            return jsonify({"message":"only .pdf accept"})
        
        logging.info(f"generated Text (if any): {result}")
        return jsonify({
            "message": f"generated text {result}",
        }), 200
        
        
    except Exception as e:
        logging.error(f"Error generating questions: {e}")
        return jsonify({"error": f"Oops!! we are having some internal issue 😒.Please use other AI-ML techniques .Hope you are satisfied : {str(e)}"}), 500
        
# def file():
#     try:
#         express_url="http://localhost:6969/files"
#         result = model.invoke(input=prompt)
#         file_name=f"${topic}.txt"
#         with open(file_name,'w') as file:
#             file.write(result)
#         with open(file_name,'rb') as f:
#             response_file=requests.post(express_url,files={'file':f})
#         if(response_file.status_code==200):
#             print("file sent succesfully")
#             return jsonify({"file sent to backend"}), 200
#     except Exception as e:
#         logging.error(f"Error in sending file: {e}")
#         return jsonify({"error": f"Internal server error: {str(e)}"}), 500    
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)

