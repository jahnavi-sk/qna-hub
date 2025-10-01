"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../../components/ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { Carousel, Card } from "../../../components/ui/apple-cards-carousel";
import { PlaceholdersAndVanishInput } from "../../../components/ui/placeholders-and-vanish-input";

import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export default function ExplorePage() {
    const pathname = usePathname();
   
    const links = [
    {
      label: "Solved Questions",
      href: "/user/solved",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Explore New !",
      href: "/user/new",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Practice Session",
      href: "/user/practice",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "/user/logout",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
    const [open, setOpen] = useState(true);
  return (
    <div
          className={cn(
            "mx-auto flex w-screen flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-black",
            // for your use case, use `h-screen` instead of `h-[60vh]`
            "h-screen"
          )}>
          <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                {open ? <Logo /> : <LogoIcon />}
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <SidebarLink 
                      key={idx} 
                      link={link} 
                      isActive={pathname === link.href}
                    />
                  ))}
                </div>
              </div>
              <div>
                
              </div>
            </SidebarBody>
          </Sidebar>
          <Dashboard />
        </div>
    
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div
        className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white">
        QnA Hub
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div
        className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

const Dashboard = () => {
    const [inputValue, setInputValue] = useState('');
    const [enteredTags, setEnteredTags] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswerIndex, setCurrentAnswerIndex] = useState(-1); // Add this for multiple answers
    // const [showAnswer, setShowAnswer] = useState(false);
    
    const [questionAnswers, setQuestionAnswers] = useState({});
    const [unsolvedOnly, setUnsolvedOnly] = useState(false); // New state for filter

    const BACKEND_URL = 'http://127.0.0.1:5000/';

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't handle navigation keys if user is typing in the input
            if (document.activeElement?.tagName === 'INPUT') return;
            
            if (questions.length === 0) return;
            
            const currentQuestion = questions[currentQuestionIndex];
            const answerImages = questionAnswers[currentQuestion?.id]?.answer_images || [];
            
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    setCurrentQuestionIndex((prev) => 
                        prev < questions.length - 1 ? prev + 1 : 0
                    );
                    setCurrentAnswerIndex(-1); // Reset answer index when changing questions
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setCurrentQuestionIndex((prev) => 
                        prev > 0 ? prev - 1 : questions.length - 1
                    );
                    setCurrentAnswerIndex(-1); // Reset answer index when changing questions
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!questionAnswers[currentQuestion?.id]) {
                        // Load answers if not loaded
                        loadAnswerForQuestion(currentQuestion);
                        setCurrentAnswerIndex(0);
                    } else {
                        // Navigate through answer images
                        setCurrentAnswerIndex((prev) => {
                            if (prev === -1) return 0; // Show first answer
                            if (prev < answerImages.length - 1) return prev + 1; // Show next answer
                            return prev; // Stay on last answer
                        });
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setCurrentAnswerIndex((prev) => {
                        if (prev <= 0) return -1; // Hide answer
                        return prev - 1; // Show previous answer
                    });
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [questions, currentQuestionIndex, currentAnswerIndex, questionAnswers]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                // Add new tag
                const newTag = inputValue.trim();
                if (!enteredTags.includes(newTag)) {
                    setEnteredTags(prev => [...prev, newTag]);
                    setInputValue(''); // Clear input after adding tag
                }
            }
        }
    };

    const fetchQuestions = async (tags,filterUnsolved = unsolvedOnly) => {
        if (!tags || tags.length === 0) return;
        
        setLoading(true);
        setError(null);
        setHasSearched(true);
        setCurrentQuestionIndex(0);
        // setShowAnswer(false);
        
        try {
            const tagsString = tags.join(', ');
            const url = `${BACKEND_URL}api/questions?user_id=default_user&tags=${encodeURIComponent(tagsString)}&unsolved_only=${filterUnsolved}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setQuestions(data);
        } catch (err) {
            setError(err.message);
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };



    const loadAnswerForQuestion = async (question) => {
        if (questionAnswers[question.id]) return; // Already loaded

        try {
            const response = await fetch(`${BACKEND_URL}api/questions_by_ids?ids=${question.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.length > 0) {
                setQuestionAnswers(prev => ({
                    ...prev,
                    [question.id]: {
                        answer_images: data[0].answer_images || [] // Use answer_images array
                    }
                }));
            }
        } catch (err) {
            console.error('Error loading answer:', err);
        }
    };

    const handleManualSearch = () => {
        if (enteredTags.length > 0) {
            fetchQuestions(enteredTags);
        }
    };

    const removeTag = (indexToRemove) => {
        const newTags = enteredTags.filter((_, index) => index !== indexToRemove);
        setEnteredTags(newTags);
        
        // If we have questions and tags change, re-search
        if (hasSearched && newTags.length > 0) {
            fetchQuestions(newTags);
        } else if (newTags.length === 0) {
            setQuestions([]);
            setHasSearched(false);
        }
    };

    const handleFilterChange = (filterValue) => {
        setUnsolvedOnly(filterValue);
        // If we have tags, re-search with the new filter
        if (enteredTags.length > 0) {
            fetchQuestions(enteredTags, filterValue);
        }
    };

    
    const markQuestionAsSolved = async (questionId) => {
        try {
            const response = await fetch(`${BACKEND_URL}api/questions/${questionId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: 'default_user' })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Update the current question's last solved text
            setQuestions(prev => prev.map(q => 
                q.id === questionId 
                    ? { ...q, last_solved_text: 'Today' }
                    : q
            ));
        } catch (err) {
            console.error('Error marking question as solved:', err);
        }
    };



    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswerImages = questionAnswers[currentQuestion?.id]?.answer_images || [];
    const showAnswer = currentAnswerIndex >= 0;
    const currentAnswerImage = showAnswer ? currentAnswerImages[currentAnswerIndex] : null;


    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Search Container - Always visible */}
            <div className="sticky top-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50 px-8 py-4">
                 <div className="flex items-start gap-4 max-w-6xl mx-auto">
                {/* Last solved info - Fixed width */}
                <div className="flex-shrink-0 w-48">
                    {currentQuestion && currentQuestion.last_solved_text && (
                        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Last solved:</span>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 ml-1">
                                {currentQuestion.last_solved_text}
                            </span>
                        </div>
                    )}

                    {/* Filter Options */}
                        <div className="mt-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Filter:</div>
                            <div className="space-y-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="questionFilter"
                                        checked={!unsolvedOnly}
                                        onChange={() => handleFilterChange(false)}
                                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">All Questions</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="questionFilter"
                                        checked={unsolvedOnly}
                                        onChange={() => handleFilterChange(true)}
                                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">Unsolved Only</span>
                                </label>
                            </div>
                        </div>



                </div>
                               
                <div className="flex-1 relative">
                    
                    
                    {/* Main search input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a tag and press Enter to add it..."
                            className="w-full h-12 px-6 pr-16 rounded-xl bg-white dark:bg-zinc-800 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 border-2 border-neutral-200 dark:border-neutral-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        />
                        
                        {/* Search button */}
                        <button
                            onClick={handleManualSearch}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                                enteredTags.length === 0 
                                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-blue-500/25'
                            }`}
                            disabled={enteredTags.length === 0}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Tags display */}
                    {enteredTags.length > 0 && (
                        <div className="mt-4">
                            
                            <div className="flex flex-wrap gap-2">
                                {enteredTags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700/50 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <span className="flex items-center gap-1">
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {tag}
                                        </span>
                                        <button
                                            onClick={() => removeTag(index)}
                                            className="ml-1 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-all duration-200"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3 w-3"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                    
                </div>
                
            </div>

            {/* Question Display Section */}
            <div className="flex-1 overflow-hidden">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="text-lg text-neutral-600 dark:text-neutral-400">
                                Searching questions...
                            </span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
                            <div className="flex items-center gap-3">
                                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !error && hasSearched && questions.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <svg className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">
                                No questions found
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Try different tags or check your spelling
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && questions.length > 0 && currentQuestion && (
                    <div className="h-full flex flex-col p-6">
                        {/* Question navigation header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                
                                <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={() => markQuestionAsSolved(currentQuestion.id)}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Mark as Solved
                                </button>
                                <button
                                        onClick={() => {
                                            if (!questionAnswers[currentQuestion.id]) {
                                                loadAnswerForQuestion(currentQuestion);
                                            }
                                            setCurrentAnswerIndex(prev => prev === -1 ? 0 : -1);
                                        }}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                    >
                                        {showAnswer ? 'Hide Answers' : 'Show Answers'}
                                    </button>
                            </div>
                                {/* {currentQuestion.last_solved_text && (
                                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                                        Last solved: {currentQuestion.last_solved_text}
                                    </span>
                                )} */}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Answer navigation buttons */}
                                {currentAnswerImages.length > 0 && showAnswer && (
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                        <button
                                            onClick={() => setCurrentAnswerIndex(prev => Math.max(-1, prev - 1))}
                                            disabled={currentAnswerIndex <= 0}
                                            className="p-1 rounded bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ↑
                                        </button>
                                        <span className="px-2 text-xs text-gray-600 dark:text-gray-400">
                                            {currentAnswerIndex + 1}/{currentAnswerImages.length}
                                        </span>
                                        <button
                                            onClick={() => setCurrentAnswerIndex(prev => Math.min(currentAnswerImages.length - 1, prev + 1))}
                                            disabled={currentAnswerIndex >= currentAnswerImages.length - 1}
                                            className="p-1 rounded bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ↓
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Question/Answer Display */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                {/* Question */}
                                <div className="flex flex-col">
                                    <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
                                        <div className="h-[60vh] w-full overflow-auto flex items-start justify-center">
                                            <img
                                                src={`${BACKEND_URL}${currentQuestion.question_image}`}
                                                alt={`Question ${currentQuestion.id}`}
                                                className="max-w-full h-auto object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Answer */}
                               <div className="flex flex-col">
                                    <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
                                        <div className="h-[60vh] w-full overflow-auto flex items-start justify-center">
                                            {showAnswer && currentAnswerImage ? (
                                                <img
                                                    src={`${BACKEND_URL}${currentAnswerImage}`}
                                                    alt={`Answer ${currentAnswerIndex + 1} for Question ${currentQuestion.id}`}
                                                    className="max-w-full h-auto object-contain"
                                                />
                                            ) : (
                                                <div className="text-center text-neutral-500 dark:text-neutral-400 flex items-center justify-center h-full">
                                                    {questionAnswers[currentQuestion.id] && currentAnswerImages.length === 0 ? 
                                                        'No answers available' : 
                                                        showAnswer ? 'Loading answers...' : 'Press "Show Answers" or ↓ to reveal'
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation hints */}
                        <div className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            Use ← → arrow keys to navigate questions • ↓ ↑ to navigate through answers • Multiple answers per question supported

                        </div>
                    </div>
                )}

                {!hasSearched && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <svg className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">
                                Start exploring questions
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Add multiple tags above and click search to find relevant questions
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};