"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../../components/ui/sidebar";
import { Carousel, Card } from "../../../components/ui/apple-cards-carousel";
import { useRouter, usePathname } from "next/navigation";

import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function SidebarDemo() {
    const pathname = usePathname();
    const router = useRouter();
    
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

// Dummy dashboard component with content
const Dashboard = () => {
    const [carouselData, setCarouselData] = useState([[], []]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/questions/completed?user_id=default_user")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.length === 0) {
                    setCarouselData([[], []]);
                    setLoading(false);
                    return;
                }

                const cards = data.map((q, idx) => ({
                    category: "Completed Question",
                    title: `Question #${q.id}`,
                    src: `http://127.0.0.1:5000${q.question_image}`,
                    content: <DummyContent completedAt={q.completed_at} />,
                }));

                // Split into two carousels of max 25 each
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
    }, []);

    // Create cards for carousels
    const cards1 = carouselData[0]?.map((card, index) => (
        <Card key={`carousel1-${card.src}`} card={card} index={index} />
    )) || [];
    
    const cards2 = carouselData[1]?.map((card, index) => (
        <Card key={`carousel2-${card.src}`} card={card} index={index} />
    )) || [];

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-lg text-neutral-600 dark:text-neutral-400">
                    Loading completed questions...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-lg text-red-600 dark:text-red-400">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (carouselData[0].length === 0 && carouselData[1].length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                        No completed questions yet!
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Complete some questions in your practice session to see them here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full py-20">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                Questions completed in the past 7 days
            </h2>
            
            {/* First carousel - only show if it has items */}
            {cards1.length > 0 && (
                <Carousel items={cards1} id="carousel1" />
            )}
            
            {/* Second carousel - only show if it has items */}
            {cards2.length > 0 && (
                <Carousel items={cards2} id="carousel2" />
            )}
        </div>
    );
};


const DummyContent = ({ completedAt }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
                <span className="font-bold text-neutral-700 dark:text-neutral-200">
                    Completed on: {completedAt ? formatDate(completedAt) : 'Unknown'}
                </span>
            </p>
            <div className="flex justify-center mt-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓ Completed
                </span>
            </div>
        </div>
    );
};