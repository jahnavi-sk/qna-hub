"use client";
import React , {useState , useEffect} from "react";
import { FileUpload } from "../../components/ui/file-upload";
import { InfiniteMovingCards } from "../../components/ui/infinite-moving-cards";
import { useRouter } from "next/navigation";


export default function AdminLand(){
  const router = useRouter();
  const TAG_SUGGESTIONS = [
  "math",
  "science",
  "history",
  "geography",
  "coding",
  "react",
  "javascript",
  "python",
  "ai",
  "machine learning",
];


    
    const [questions, setQuestions] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [questionFile, setQuestionFile] = useState(null);
    const [answerFile, setAnswerFile] = useState(null);
    const [testimonials, setTestimonials] = useState([]);



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

        alert("Please upload both question and answer files.");
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
          alert("Upload successful!");
          setShowUpload(false);
          // router.replace("/user");
          } else {
            const data = await res.json();
            alert(data.error || "Upload failed");
          }
        }
        catch{
           alert("Upload failed - catch");
        }
        
    };   

    const filteredSuggestions = TAG_SUGGESTIONS.filter(
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
    }
    setTagInput("");
    setShowSuggestions(false);
  };


//   const testimonials = [
//   {
//     question:"img1.jpg",
//     tags: "science"
//   },
//   {
//     question:"img1.jpg",
//     tags: "physics"
//   },
//   {
//     question:"img1.jpg",
//     tags: "math"
//   },
//   {
//     question:"img1.jpg",
//     tags: "english"
//   },
//   {
//     question:"img1.jpg",
//     tags: "science, physics"
//   }
// ];




    return (
    <div>
      {!showUpload && (
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
      )}
      {showUpload && (
        <div>
          <div className="mt-10 pt-5 flex flex-row justify-center gap-8">
            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 font-medium">Question File Upload:</span>
              <FileUpload id="questions" onChange={(files) => setQuestionFile(files[0])} />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 font-medium">Answer File Upload:</span>
              <FileUpload id="answers" onChange={(files) => setAnswerFile(files[0])} />
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <label className="mb-2 font-medium">Enter tag:</label>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Enter tag"
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
                <ul className="absolute left-0 right-0 bg-gray-400 border border-gray-200 rounded shadow mt-1 z-10">
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
            </div>
            {/* Show added tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
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
      )}
    </div>
  );
}