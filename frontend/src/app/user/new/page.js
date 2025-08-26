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

const Dashboard = () => {

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [modalInput, setModalInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [carouselData, setCarouselData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTags, setSearchTags] = useState("");
    const [restored, setRestored] = useState(false);

    const placeholders = [
        "Physics, Motion, Pseudo Force",
        "Chemistry, Ions, Orbitals",
        "Physics, Tension, Stress ",
        "Chemistry, d block elements",
    ];

    useEffect(() => {
        const savedShowSuggestions = localStorage.getItem("explore_showSuggestions");
        const savedSearchTags = localStorage.getItem("explore_searchTags");
        
        if (savedShowSuggestions !== null) {
            setShowSuggestions(JSON.parse(savedShowSuggestions));
        }
        if (savedSearchTags !== null) {
            setSearchTags(savedSearchTags);
        }
        setRestored(true);
    }, []);

    // SAVE state when it changes
    useEffect(() => {
        if (restored) {
            localStorage.setItem("explore_showSuggestions", JSON.stringify(showSuggestions));
        }
    }, [showSuggestions, restored]);

    useEffect(() => {
        if (restored) {
            localStorage.setItem("explore_searchTags", searchTags);
        }
    }, [searchTags, restored]);

    // FETCH questions when needed
    useEffect(() => {
        if (restored && showSuggestions) {
            setLoading(true);
            setError(null);
            let url = "http://127.0.0.1:5000/api/questions?user_id=default_user";
            if (searchTags.trim()) {
                url += `&tags=${encodeURIComponent(searchTags)}`;
            }
            fetch(url)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    const cards = data.map((q, idx) => ({
                        category: "Question",
                        title: `Question #${q.id}`,
                        src: `http://127.0.0.1:5000${q.question_image}`,
                        content: <DummyContent questionId={q.id}/>, 
                    }));
                    setCarouselData([
                        cards.slice(0, 25),
                        cards.slice(25, 50)
                    ]);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [restored, showSuggestions, searchTags]);



    

    
    const handleChange = (e) => {
        setSearchTags(e.target.value);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(true);
    };

    if (!restored) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-lg text-neutral-600 dark:text-neutral-400">
                    Loading...
                </div>
            </div>
        );
    }

    // Create cards for the first carousel
    const cards1 = carouselData[0]?.map((card, index) => (
        <Card key={`carousel1-${card.src}`} card={card} index={index} />
    )) || [];
    
    // Create cards for the second carousel
    const cards2 = carouselData[1]?.map((card, index) => (
        <Card key={`carousel2-${card.src}`} card={card} index={index} />
    )) || [];

    return (
        <div className="flex-1">
            {showSuggestions && (
                <div className="w-full h-full py-20">
                    <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                        {searchTags.trim() ? 
                `Getting questions of tags: ${searchTags}` : 
                "Explore new questions!"
            }
                    </h2>
                    
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="absolute top-8 right-8 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                        aria-label="Open search"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                        </svg>
                    </button>

                    {/* Loading state */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-lg text-neutral-600 dark:text-neutral-400">
                                Loading questions...
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-lg text-red-600 dark:text-red-400">
                                Error loading questions: {error}
                            </div>
                        </div>
                    )}

                    {/* Carousels */}
                    {!loading && !error && carouselData.length > 0 && (
                        <>
                            {cards1.length > 0 && (
                                <Carousel items={cards1} id="carousel1" />
                            )}
                            
                            {cards2.length > 0 && (
                                <Carousel items={cards2} id="carousel2" />
                            )}
                        </>
                    )}

                    {/* No data state */}
                    {!loading && !error && (carouselData.length === 0 || (carouselData[0]?.length === 0 && carouselData[1]?.length === 0)) && showSuggestions && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-lg text-neutral-600 dark:text-neutral-400">
                                Oops! Questions not found! Contact your admin.
                            </div>
                        </div>
                    )}

                    {/* Update the modal search functionality */}
                    {showSearchModal && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowSearchModal(false)}
                        >
                          <div
                              className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-lg w-full max-w-md relative"
                              onClick={e => e.stopPropagation()}
                          >
                              <button
                                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                                  onClick={() => setShowSearchModal(false)}
                                  aria-label="Close"
                              >
                                  ×
                              </button>
                              <h3 className="mb-4 text-lg font-semibold text-center dark:text-white">Search Questions</h3>
                              <PlaceholdersAndVanishInput
                                  placeholders={["Enter tags: chemistry, physics..."]}
                                  value={modalInput}
                                  onChange={e => setModalInput(e.target.value)}
                                  onSubmit={e => {
                                      e.preventDefault();
                                      if (modalInput.trim()) {
                                          setSearchTags(modalInput.trim());
                                          setShowSuggestions(true);
                                          setShowSearchModal(false);
                                          setModalInput(""); // Clear the modal input
                                      }
                                  }}
                              />
                          </div>
                      </div>
                  )}
                </div>
            )}

            {!showSuggestions && (
                <div className="flex min-h-screen w-full flex-col justify-center items-center px-4">
                    <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
                        Search for Questions by tags !
                    </h2>
                    <PlaceholdersAndVanishInput
                        placeholders={placeholders}
                        onChange={handleChange}
                        onSubmit={onSubmit}
                    />
                </div>
            )}
        </div>
    );
};

const DummyContent = ({ questionId }) => {
    const [isAdded, setIsAdded] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('practiceSessionQuestions');
            if (stored) {
                const arr = JSON.parse(stored);
                return arr.includes(questionId);
            }
        }
        return false;
    });

    useEffect(() => {
        const sync = () => {
            const stored = localStorage.getItem('practiceSessionQuestions');
            if (stored) {
                const arr = JSON.parse(stored);
                setIsAdded(arr.includes(questionId));
            }
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [questionId]);

    const handleToggle = () => {
        let arr = [];
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('practiceSessionQuestions');
            if (stored) arr = JSON.parse(stored);
            if (isAdded) {
                arr = arr.filter(id => id !== questionId);
            } else {
                arr.push(questionId);
            }
            localStorage.setItem('practiceSessionQuestions', JSON.stringify(arr));
            setIsAdded(!isAdded);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button 
                onClick={handleToggle}
                className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-4 py-1 text-sm font-medium bg-slate-950 text-white backdrop-blur-3xl">
                    {isAdded ? "Remove from practice session" : "Add to practice session"}
                </span>
            </button>
            {/* Green tick animation */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: isAdded ? 1 : 0, 
                    opacity: isAdded ? 1 : 0 
                }}
                transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30 
                }}
                className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full"
            >
                <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: isAdded ? 1 : 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </motion.div>
        </div>
    );
};