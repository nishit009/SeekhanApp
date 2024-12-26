from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from PyPDF2 import PdfReader
import ollama  # Ensure Ollama is installed and set up correctly

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    with open(pdf_path, "rb") as file:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

# Replace the WebBaseLoader with local PDF loading

# Split the document into smaller chunks using RecursiveCharacterTextSplitter

# Convert the text splits into Document objects

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Define the Ollama LLM function
def ollama_llm(question, context):
    formatted_prompt = f"Question: {question}\n\nContext: {context}"
    response = ollama.chat(model='laddo', messages=[{'role': 'user', 'content': formatted_prompt}])
    return response['message']['content']

# Define the RAG chain
def rag_chain(question):
    retrieved_docs = retriever.invoke(question)
    formatted_context = format_docs(retrieved_docs)
    return ollama_llm(question, formatted_context)


# from langchain_community.document_loaders import PyPDFLoader
# from langchain_community.llms import Ollama
# import random
# from fpdf import FPDF
# import os

# # Function to save response to a PDF
# def save_to_pdf(response, output_file):
#     pdf = FPDF()
#     pdf.set_auto_page_break(auto=True, margin=15)
#     pdf.add_page()
#     pdf.set_font("Arial", size=12)
#     pdf.multi_cell(0, 10, response)
#     pdf.output(output_file)
#     print(f"Response saved to {output_file}")

# # RAG Setup and PDF Saving
# def main():
#     # Example response for testing purposes
#     # In a real scenario, you will be working with your RAG pipeline to get this result.

#     # Get current working directory to save the output PDF
#     current_directory = os.getcwd()
#     print(f"Saving PDF in directory: {current_directory}")

#     x = random.randint(1, 1000)  # Use a larger range to reduce conflicts
#     output_file = os.path.join(current_directory, f"{q_type}_{Questions}_{x}.pdf")
#     # Save result to PDF
#     save_to_pdf(result, output_file)

# # Run the main function
# if __name__ == "__main__":
#     main()
