"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";

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
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function AdminEditPage() {
  const router = useRouter();
  const [editInputValue, setEditInputValue] = useState('');
  const [editEnteredTags, setEditEnteredTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editInputValue.trim()) {
        const newTag = editInputValue.trim();
        if (!editEnteredTags.includes(newTag)) {
          setEditEnteredTags(prev => [...prev, newTag]);
          setEditInputValue('');
        }
      } else {
        handleEditSearch();
      }
    }
  };

  const handleEditSearch = async () => {
    if (editEnteredTags.length === 0) {
      showToast("Please add at least one tag to search", 'error');
      return;
    }

    try {
      const tagsString = editEnteredTags.join(', ');
      const response = await fetch(`http://127.0.0.1:5000/api/questions?tags=${encodeURIComponent(tagsString)}&user_id=default_user`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const questionsWithAnswers = await Promise.all(
        data.map(async (question) => {
          try {
            const detailResponse = await fetch(`http://127.0.0.1:5000/api/questions_by_ids?ids=${question.id}`);
            const detailData = await detailResponse.json();
            return {
              ...question,
              answer_images: detailData[0]?.answer_images || []
            };
          } catch (err) {
            console.error(`Error fetching details for question ${question.id}:`, err);
            return question;
          }
        })
      );
      
      setSearchResults(questionsWithAnswers);
    } catch (err) {
      console.error('Error searching questions:', err);
      showToast("Search failed", 'error');
    }
  };

  const removeEditTag = (indexToRemove) => {
    setEditEnteredTags(editEnteredTags.filter((_, index) => index !== indexToRemove));
  };

  const handleQuestionClick = (questionId) => {
    console.log('Clicking question with ID:', questionId);
  console.log('Navigating to:', `/admin/edit/${questionId}`);
  
    const currentState = {
    editInputValue,
    editEnteredTags,
    searchResults
  };
  sessionStorage.setItem('adminEditState', JSON.stringify(currentState));
  
    // Navigate to question edit page
    router.push(`/admin/edit/${questionId}`);
  };


  useEffect(() => {
  const savedState = sessionStorage.getItem('adminEditState');
  if (savedState) {
    try {
      const { editInputValue: savedInput, editEnteredTags: savedTags, searchResults: savedResults } = JSON.parse(savedState);
      setEditInputValue(savedInput || '');
      setEditEnteredTags(savedTags || []);
      setSearchResults(savedResults || []);
    } catch (err) {
      console.error('Error restoring state:', err);
    }
  }
}, []);




  return (
    <div className="min-h-screen bg-black py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Edit Questions</h1>
          <button
            onClick={() => router.push('/admin')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Admin
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

      {/* Search Interface */}
      <div className="max-w-6xl mx-auto px-8">
        {/* Search Bar */}
        <div className="w-full mb-8">
          <div className="relative">
            <input
              type="text"
              value={editInputValue}
              onChange={(e) => setEditInputValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              placeholder="Type a tag and press Enter to add it..."
              className="w-full h-12 px-6 pr-16 rounded-xl bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 border-2 border-neutral-200 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            
            <button
              onClick={handleEditSearch}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                editEnteredTags.length === 0 
                  ? 'bg-neutral-100 text-neutral-400' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
              }`}
              disabled={editEnteredTags.length === 0}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Tags display */}
          {editEnteredTags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {editEnteredTags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {tag}
                    </span>
                    <button
                      onClick={() => removeEditTag(index)}
                      className="ml-1 p-1 hover:bg-red-100 hover:text-red-600 rounded-full transition-all duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Results as Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map(question => (
            <div
              key={question.id}
              className="bg-black rounded-lg shadow-lg p-4 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200 hover:shadow-xl border border-gray-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuestionClick(question.id);
                }}
            >
              <div className="mb-3">
                <img 
                  src={`http://127.0.0.1:5000${question.question_image}`} 
                  alt="Question" 
                  className="w-full h-32 object-contain rounded border"
                />
              </div>
              
              <div className="text-xs text-gray-500 mb-2">
                Question ID: {question.id}
              </div>
              
              {question.answer_images && question.answer_images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {question.answer_images.slice(0, 3).map((img, idx) => (
                    <img 
                      key={idx} 
                      src={`http://127.0.0.1:5000${img}`} 
                      alt={`Answer ${idx+1}`} 
                      className="w-12 h-12 object-contain border rounded"
                    />
                  ))}
                  {question.answer_images.length > 3 && (
                    <div className="w-12 h-12 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-600">
                      +{question.answer_images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}