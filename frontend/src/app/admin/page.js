"use client";
import React , {useState} from "react";
import { FileUpload } from "../../components/ui/file-upload";


export default function AdminLand(){

    const [questions, setQuestions] = useState([]);
    const [showUpload, setShowUpload] = useState(false);

    const handleAddQuestions = () => {
        setShowUpload(true);
    }; 
    const handleSave = () => {
        // Logic to save questions
        console.log("Saves button clicked");
    };   
    return (
        <div>
            {!showUpload && (
                <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
                    <div className="text-center">
                    <h2 className="text mb-6">
                        No questions found. Please add questions to continue.
                    </h2>
                    <button
                        onClick={handleAddQuestions}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                        Add Questions!
                    </button>
                    </div>
                </div>
                )}
                {showUpload && (
                    <div>
                        <div className="mt-4">
                            <div className="flex flex-col items-center justify-center">
                                Question File Upload: 
                                <FileUpload 
                                    id="questions" 
                                    onChange={(files) => setQuestions(files)} 
                                />  
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                Answer File Upload: 
                                <FileUpload 
                                    id="answers" 
                                    onChange={(files) => setQuestions(files)} 
                                />  
                            </div>

                            
                        </div>
                        <div className="flex flex-col items-center">
                            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                                Save!
                            </button>
                        </div>
                        
                    </div>
                )}
        </div>
    );
}