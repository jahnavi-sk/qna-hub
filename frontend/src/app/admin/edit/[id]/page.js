"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileUpload } from "../../../../components/ui/file-upload";
import { X, CheckCircle, AlertCircle } from "lucide-react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
        type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id;

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editQuestionFile, setEditQuestionFile] = useState(null);
  const [editAnswerFiles, setEditAnswerFiles] = useState([]);
  const [editTags, setEditTags] = useState([]);
  const [editQuestionUploadKey, setEditQuestionUploadKey] = useState(0);
  const [editAnswerUploadKey, setEditAnswerUploadKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removedAnswerImages, setRemovedAnswerImages] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };


  const handleBackToSearch = () => {
    router.push('/admin/edit');
  };


  const hideToast = () => {
    setToast(null);
  };

  // Load question data on component mount
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        // Get question details
        console.log("in loadQuestion, questionId:", questionId);
        const username = "u2";
        const questionResponse = await fetch(`http://127.0.0.1:5000/api/questions_by_ids?ids=${questionId}&username=${username}`);
        console.log("questionResponse:", questionResponse);
        const questionData = await questionResponse.json();
        
        if (questionData.length === 0) {
          showToast("Question not found", 'error');
          console.log("Question not found, redirecting...");
          router.push('/admin/edit');
          return;
        }

        setSelectedQuestion(questionData[0]);

        // Get tags for this question
        const tagsResponse = await fetch(`http://127.0.0.1:5000/api/questions/${questionId}/tags`);
        const tagsData = await tagsResponse.json();
        setEditTags(tagsData.tags || []);

        setLoading(false);
      } catch (err) {
        console.error('Error loading question:', err);
        showToast("Failed to load question", 'error');
        router.push('/admin/edit');
      }
    };

    if (questionId) {
      loadQuestion();
    }
  }, [questionId, router]);

  const handleEditSave = async () => {
  if (!selectedQuestion) return;

  const formData = new FormData();
  formData.append("question_id", selectedQuestion.id);

  if (editQuestionFile) {
    formData.append("question", editQuestionFile);
  }

  // Add new answer files
  editAnswerFiles.forEach((file, index) => {
    formData.append(`answer_${index}`, file);
  });

  // Add removed answer images
  removedAnswerImages.forEach((img) => {
    formData.append("remove_answer_images[]", img);
  });

  editTags.forEach(tag => formData.append("tags[]", tag));

  try {
    const res = await fetch("http://127.0.0.1:5000/api/admin/edit", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      showToast("Question updated successfully!", 'success');
      // Refetch question data and update state
      setRemovedAnswerImages([]);
      setEditAnswerFiles([]);
      setEditQuestionFile(null);
      setEditQuestionUploadKey(prev => prev + 1);
      setEditAnswerUploadKey(prev => prev + 1);

      // Refetch question and tags
      setLoading(true);
      const username = "u2";
      const questionResponse = await fetch(`http://127.0.0.1:5000/api/questions_by_ids?ids=${selectedQuestion.id}&username=${username}`);
      const questionData = await questionResponse.json();
      setSelectedQuestion(questionData[0]);

      const tagsResponse = await fetch(`http://127.0.0.1:5000/api/questions/${selectedQuestion.id}/tags`);
      const tagsData = await tagsResponse.json();
      setEditTags(tagsData.tags || []);

      setLoading(false);
    } else {
      const data = await res.json();
      showToast(data.error || "Update failed", 'error');
    }
  } catch (err) {
    console.error('Error updating question:', err);
    showToast("Update failed - connection error", 'error');
  }
};


  const addEditTag = (tag) => {
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
  };

  const removeEditTagFromList = (tagToRemove) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading question...</div>
      </div>
    );
  }

  if (!selectedQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Question not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-8 mb-8 border-b border-white pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Edit Question #{selectedQuestion.id}</h1>
          <button
            onClick={handleBackToSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Search
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* Edit Interface */}
      <div className="max-w-4xl mx-auto px-8">
        <div className="bg-black rounded-lg shadow-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Question Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Question Image</h3>
              <div className="mb-4">
                <img 
                  src={`http://127.0.0.1:5000${selectedQuestion.question_image}`} 
                  alt="Current Question" 
                  className="w-full h-48 object-contain border rounded"
                />
              </div>
              
            </div>

            {/* Answers Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Answer Images</h3>
              <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedQuestion.answer_images?.map((img, idx) => (
                      removedAnswerImages.includes(img) ? null : (
                        <div key={idx} className="relative">
                          <img 
                            src={`http://127.0.0.1:5000${img}`} 
                            alt={`Answer ${idx+1}`} 
                            className="w-full h-24 object-contain border rounded"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                            onClick={() => setRemovedAnswerImages([...removedAnswerImages, img])}
                            title="Remove this answer image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              <div>
                <label className="block text-sm font-medium mb-2">Upload New Answer Images (Max 5):</label>
                <FileUpload 
                  key={editAnswerUploadKey}
                  onChange={(files) => setEditAnswerFiles(Array.from(files).slice(0, 5))} 
                />
                {editAnswerFiles.length > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {editAnswerFiles.length} new answer file(s) selected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Add new tag and press Enter..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    addEditTag(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {editTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeEditTagFromList(tag)}
                    className="text-blue-500 hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <button
              onClick={handleEditSave}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleBackToSearch}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}