"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../../components/ui/sidebar";
import { Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

import { useRouter, usePathname } from "next/navigation";
import {Carousel} from "../../../components/ui/carousel";


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
      label: "All Questions",
      href: "/user/all",
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
                <SidebarLink
                  link={{
                    label: "Yatharth",
                    href: "#",
                    icon: (
                      <img
                        src="https://assets.aceternity.com/manu.png"
                        className="h-7 w-7 shrink-0 rounded-full"
                        width={50}
                        height={50}
                        alt="Avatar" />
                    ),
                  }} />
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

const slideData = [
    {
      title: "Mystic Mountains",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Urban Dreams",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Neon Nights",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Desert Whispers",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1679420437432-80cfbf88986c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
const practiceQuestions = [
  {
    id: 1,
    questionImage: "/Questions/q1.png",
    answerImage: "/Answers/a1.png",
    completed: false
  },
  {
    id: 2,
    questionImage: "/Questions/q2.png",
    answerImage: "/Answers/a2.png",
    completed: false
  },
  {
    id: 3,
    questionImage: "/Questions/q3.png",
    answerImage: "/Answers/a3.png",
    completed: false
  },
  {
    id: 4,
    questionImage: "/Questions/q4.png",
    answerImage: "/Answers/a4.png",
    completed: false
  }
];

const FlipCard = ({ question, isFlipped, onFlip, onToggleComplete }) => {
  const [questionImgLoaded, setQuestionImgLoaded] = useState(false);
  const [answerImgLoaded, setAnswerImgLoaded] = useState(false);
  const [questionImgDim, setQuestionImgDim] = useState({ width: 400, height: 300 });
  const [answerImgDim, setAnswerImgDim] = useState({ width: 400, height: 300 });
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    // Only runs on client
    const update = () => setViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleQuestionImgLoad = (e) => {
    const img = e.target;
    setQuestionImgDim({
      width: img.naturalWidth + 200,
      height: img.naturalHeight + 200
    });
    setQuestionImgLoaded(true);
  };

  const handleAnswerImgLoad = (e) => {
    const img = e.target;
    if(img.naturalHeight < 300 && img.naturalWidth < 400){
      setAnswerImgDim({
        width: 400,
        height: 300
      });
    }
    else{setAnswerImgDim({
      width: img.naturalWidth,
      height: img.naturalHeight
    });}
    setAnswerImgLoaded(true);
  };

  // Use the image's natural size, but never overflow the viewport
  const chosenDim = isFlipped ? answerImgDim : questionImgDim;
  const dimensions = {
    width: Math.min(chosenDim.width, viewport.width - 64),
    height: Math.min(chosenDim.height, viewport.height - 200)
  };

  return (
    <div className="relative group">
      {/* Card Container */}
      <div 
        className="relative mx-auto cursor-pointer transform transition-transform duration-300 hover:scale-105"
        style={{ 
          width: `${dimensions.width}px`, 
          height: `${dimensions.height}px`,
          perspective: '1000px',
          maxWidth: '100vw',
          maxHeight: '80vh',
        }}
        onClick={onFlip}
      >
        {/* Flip Container */}
        <div 
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Question Side (Front) */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img
              src={question.questionImage}
              alt="Question"
              className="w-full h-full object-contain bg-white dark:bg-black"
              onLoad={handleQuestionImgLoad}
              draggable={false}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
            />
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
              Question
            </div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Click to flip
            </div>
           
          </div>

          {/* Answer Side (Back) */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 rotate-y-180"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <img
              src={question.answerImage}
              alt="Answer"
              className="w-full h-full object-contain bg-white dark:bg-black"
              onLoad={handleAnswerImgLoad}
              draggable={false}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
            />
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
              Answer
            </div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Click to flip back
            </div>
            
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between gap-3 items-center mt-4 px-2">
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-950 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw size={16} />
          Flip Card
        </button> */}



        <button onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="flex justify-between gap-3 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          <RotateCcw size={16} />
          Flip Card !
        </span>
      </button>

      

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            question.completed
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Check size={16} />
          {question.completed ? 'Completed' : 'Mark Done'}
        </button>


     


      </div>
    </div>
  );
};

// Replace this with your actual component in page.js
const Dashboard = () => {
  const [questions, setQuestions] = useState(practiceQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedStates, setFlippedStates] = useState({});

  const handleFlip = (questionId) => {
    setFlippedStates(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleToggleComplete = (questionId) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, completed: !q.completed } : q
    ));
  };

  const nextQuestion = () => {
    setCurrentIndex(prev => (prev + 1) % questions.length);
  };

  const prevQuestion = () => {
    setCurrentIndex(prev => (prev - 1 + questions.length) % questions.length);
  };

  const currentQuestion = questions[currentIndex];
  const completedCount = questions.filter(q => q.completed).length;
  const progress = (completedCount / questions.length) * 100;

  return (
    <div className="w-full h-full p-4 bg-gray-50 dark:bg-black overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Practice Session
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Question {currentIndex + 1} of {questions.length}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount} of {questions.length} questions completed
          </p>
        </div>

        {/* Main Card Area */}
        <div className="flex flex-col items-center mb-6">
          <FlipCard
            question={currentQuestion}
            isFlipped={flippedStates[currentQuestion.id] || false}
            onFlip={() => handleFlip(currentQuestion.id)}
            onToggleComplete={() => handleToggleComplete(currentQuestion.id)}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button
            onClick={prevQuestion}
            disabled={questions.length <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {currentIndex + 1} / {questions.length}
          </span>

          <button
            onClick={nextQuestion}
            disabled={questions.length <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Summary */}
        {completedCount === questions.length && (
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-center">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              You've completed all questions in this practice session!
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};