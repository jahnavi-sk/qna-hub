"use client";
import React , {useState , useEffect} from "react";
import { FileUpload } from "../../components/ui/file-upload";
import { InfiniteMovingCards } from "../../components/ui/infinite-moving-cards";
import { useRouter } from "next/navigation";
import { X, CheckCircle, AlertCircle } from "lucide-react"; // Import icons

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
    const [recentTags, setRecentTags] = useState([]); // Store recent tags from localStorage

    const [questionFile, setQuestionFile] = useState(null);
    const [answerFile, setAnswerFile] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    const [questionUploadKey, setQuestionUploadKey] = useState(0); // Key to force re-render
    const [answerUploadKey, setAnswerUploadKey] = useState(0); // Key to force re-render

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

    useEffect(() => {
      // console.log("in here");
    fetch("http://127.0.0.1:5000/api/questions")
      .then(res => res.json())
      .then(data => {
        console.log(data);
        // Format tags as a string for display
        setTestimonials(
          data.map(q => ({
            question: `http://127.0.0.1:5000${q.question_image}`, // This is the image path
            tags: q.tags || ""
          }))
        );
      });
  }, []);

    const handleAddQuestions = () => {
        setShowUpload(true);
    }; 
    
    const handleSave = async () => {
      if (!questionFile || !answerFile) {
        showToast("Please upload both question and answer files.", 'error');
        return;
      }
      
      const formData = new FormData();
      formData.append("question", questionFile);
      formData.append("answer", answerFile);
      tags.forEach(tag => formData.append("tags[]", tag));
        // Logic to save questions
        try{
          const res = await fetch("http://127.0.0.1:5000/api/admin/upload", {
            method: "POST",
            body: formData,
        });
          if (res.ok) {
            showToast("Upload successful! 🎉", 'success');
            setShowUpload(false);
            
            setQuestionFile(null);
            setAnswerFile(null);
            setQuestionUploadKey(prev => prev + 1); // Force re-render of question upload
            setAnswerUploadKey(prev => prev + 1); // Force re-render of answer upload
            
            // router.replace("/user");
          } else {
            const data = await res.json();
            showToast(data.error || "Upload failed", 'error');
          }
        }
        catch{
           showToast("Upload failed - connection error", 'error');
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
      updateRecentTags(tag); // Add to recent tags
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

    return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* {!showUpload && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <div className="text-center">
            {testimonials.length === 0 ? (
              <>
                <h2 className="text mb-6">
                  No questions found. Please add questions to continue.
                </h2>
            </>) : <></>
            }

                <button
                  onClick={handleAddQuestions}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Add Questions!
            </button>
            </div>
            <div className="h-[40rem] w-full rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
            <InfiniteMovingCards
                items={testimonials.map(item => {
                  console.log("item.question:", item.question);
                  
                  // Render the image in your card component
                  return{
                    ...item,
                  render: (
                    <div>
                      <img
                        src={item.question}
                        alt={item.tags}
                        className="w-32 h-32 object-contain mx-auto"
                      />
                      <div>{item.tags}</div>
                    </div>
                  )
                };
                })}
                direction="right"
                speed="fast"
              />

          </div>
        </div>
      )} */}
      {/* {showUpload && ( */}
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
              <span className="mb-2 font-medium">Answer File Upload:</span>
              <FileUpload 
                key={answerUploadKey} 
                id="answers" 
                onChange={(files) => setAnswerFile(files[0])} 
              />
            </div>
          </div>
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
            {/* Show added tags */}
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
            {/* Clear all tags button */}
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
      {/* )} */}
    </div>
  );
}