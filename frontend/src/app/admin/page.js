"use client";
import React , {useState , useEffect} from "react";
import { FileUpload } from "../../components/ui/file-upload";
import { InfiniteMovingCards } from "../../components/ui/infinite-moving-cards";
import { useRouter } from "next/navigation";
import { X, CheckCircle, AlertCircle,Edit, Search } from "lucide-react"; // Import icons

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds

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
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


export default function AdminLand(){
  const router = useRouter();

    const [questions, setQuestions] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentTags, setRecentTags] = useState([]);

    const [questionFile, setQuestionFile] = useState(null);
    const [answerFiles, setAnswerFiles] = useState([]); // Changed from answerFile to answerFiles array
    const [testimonials, setTestimonials] = useState([]);
    const [questionUploadKey, setQuestionUploadKey] = useState(0);
    const [answerUploadKey, setAnswerUploadKey] = useState(0);




    const [editMode, setEditMode] = useState(false);
    const [editInputValue, setEditInputValue] = useState('');
    const [editEnteredTags, setEditEnteredTags] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [editQuestionFile, setEditQuestionFile] = useState(null);
    const [editAnswerFiles, setEditAnswerFiles] = useState([]);
    const [editTags, setEditTags] = useState([]);
    const [editQuestionUploadKey, setEditQuestionUploadKey] = useState(0);
    const [editAnswerUploadKey, setEditAnswerUploadKey] = useState(0);




    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
      setToast({ message, type });
    };

    const hideToast = () => {
      setToast(null);
    };

    // Load recent tags from localStorage on component mount
    useEffect(() => {
      const savedRecentTags = localStorage.getItem('recentTags');
      if (savedRecentTags) {
        setRecentTags(JSON.parse(savedRecentTags));
      }
    }, []);

    // Function to update recent tags in localStorage
    const updateRecentTags = (newTag) => {
      const updatedRecentTags = [newTag, ...recentTags.filter(tag => tag !== newTag)].slice(0, 5);
      setRecentTags(updatedRecentTags);
      localStorage.setItem('recentTags', JSON.stringify(updatedRecentTags));
    };

    const handleAddQuestions = () => {
        setShowUpload(true);
    }; 
    
    const handleSave = async () => {
      if (!questionFile || answerFiles.length === 0) { // Changed condition
        showToast("Please upload both question and at least one answer file.", 'error');
        return;
      }
      
    const formData = new FormData();
    formData.append("question", questionFile);
      
      // Append multiple answer files with correct naming
    answerFiles.forEach((file, index) => {
      formData.append(`answer_${index}`, file);
    });
      
    tags.forEach(tag => formData.append("tags[]", tag));

    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
  }
      
      try{
        const res = await fetch("http://127.0.0.1:5000/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          showToast("Upload successful! 🎉", 'success');
          setShowUpload(false);
          
          setQuestionFile(null);
          setAnswerFiles([]); // Clear answer files array
          setQuestionUploadKey(prev => prev + 1);
          setAnswerUploadKey(prev => prev + 1);
          
        } else {
          const data = await res.json();
          showToast(data.error || "Upload failed", 'error');
        }
      }
      catch{
         showToast("Upload failed - connection error", 'error');
      }
    };   

    // Handle multiple answer files from single upload
    const handleAnswerFileChange = (files) => {
      // Limit to 5 files maximum
      const limitedFiles = Array.from(files).slice(0, 5);
      setAnswerFiles(limitedFiles);
    };


    // Edit Mode Functions
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
                // If empty, search with current tags
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
            
            // Fetch full question details including answers for each question
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

    const handleEditClick = async (question) => {
        setSelectedQuestion(question);
        setEditQuestionFile(null);
        setEditAnswerFiles([]);
        
        // Get tags for this question
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/questions/${question.id}/tags`);
            const tagsData = await response.json();
            setEditTags(tagsData.tags || []);
        } catch (err) {
            console.error('Error fetching question tags:', err);
            setEditTags([]);
        }
    };

    const handleEditSave = async () => {
        if (!selectedQuestion) return;

        const formData = new FormData();
        formData.append("question_id", selectedQuestion.id);
        
        if (editQuestionFile) {
            formData.append("question", editQuestionFile);
        }
        
        editAnswerFiles.forEach((file, index) => {
            formData.append(`answer_${index}`, file);
        });
        
        editTags.forEach(tag => formData.append("tags[]", tag));

        try {
            const res = await fetch("http://127.0.0.1:5000/api/admin/edit", {
                method: "POST",
                body: formData,
            });
            
            if (res.ok) {
                showToast("Question updated successfully!", 'success');
                setSelectedQuestion(null);
                setEditMode(false);
                setSearchResults([]);
                setEditEnteredTags([]);
                setEditInputValue('');
            } else {
                const data = await res.json();
                showToast(data.error || "Update failed", 'error');
            }
        } catch (err) {
            console.error('Error updating question:', err);
            showToast("Update failed - connection error", 'error');
        }
    };

    
    // Filter recent tags based on input
    const filteredSuggestions = recentTags.filter(
      (tag) =>
        tagInput &&
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(tag)
    );

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    setShowSuggestions(true);
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      updateRecentTags(tag);
    }
    setTagInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const clearAllTags = () => {
    setTags([]);
  };


  const addEditTag = (tag) => {
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
  };

  const removeEditTagFromList = (tagToRemove) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };


    return (
    <div className="relative">

      <button
        onClick={() => router.push('/admin/edit')}
        className="absolute top-4 right-4 z-10 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Edit className="w-4 h-4" />
        {editMode ? 'Cancel Edit' : 'Edit'}
      </button>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}


      

      {/* Original Upload Interface - Only show when not in edit mode */}
      <div>
        <div>
          <div className="mt-10 pt-5 flex flex-row justify-center gap-8">
            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 font-medium">Question File Upload:</span>
              <FileUpload 
                key={questionUploadKey} 
                id="questions" 
                onChange={(files) => setQuestionFile(files[0])} 
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 font-medium">Answer Files Upload (Max 5):</span>
              <FileUpload 
                key={answerUploadKey} 
                id="answers" 
                onChange={handleAnswerFileChange}
              />
              {answerFiles.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ {answerFiles.length} answer file(s) selected
                  <div className="text-xs text-gray-500">
                    {answerFiles.map((file, index) => (
                      <div key={index}>{file.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tags section */}
          <div className="mt-8 flex flex-col items-center">
            <label className="mb-2 font-medium">Enter tag:</label>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Enter tags! "
                className="w-full p-2 border border-gray-300 rounded"
                value={tagInput}
                onChange={handleTagInput}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                onKeyDown={(e) => {
                  if ((e.key === "Tab" || e.key === "Enter") && tagInput) {
                    e.preventDefault();
                    addTag(tagInput.trim());
                  }
                }}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bg-black border border-gray-200 rounded shadow mt-1 z-10">
                  {filteredSuggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                      onMouseDown={() => addTag(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              {showSuggestions && tagInput && filteredSuggestions.length === 0 && recentTags.length === 0 && (
                <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded shadow mt-1 z-10 px-3 py-2 text-gray-500 text-sm">
                  No recent tags. Start typing to create new ones!
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 max-w-md">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            {tags.length > 0 && (
              <button
                onClick={clearAllTags}
                className="mt-3 text-red-500 hover:text-red-700 text-sm underline transition-colors"
                type="button"
              >
                Clear All Tags
              </button>
            )}
          </div>
          <div className="flex flex-col items-center mt-5">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded transform hover:scale-105"
            >
              Save!
            </button>
          </div>
        </div>
      </div>

      
     
    </div>
  );
}