"use client";;
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";


const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const animate = true;
  return (
    <div className="relative">
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden md:flex md:flex-col bg-black dark:bg-black shrink-0 relative",
          className
        )}
        animate={{
          width: animate ? (isOpen ? "300px" : "60px") : "300px",
        }}
        {...props}
      >
        {children}
      </motion.div>
      
      {/* Move toggle button outside the animated div */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-0 top-13 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white rounded-full p-1.5 shadow-lg transition-colors border border-neutral-200 dark:border-neutral-600 z-10"
      >
        {isOpen ? (
          <IconChevronLeft className="w-2 h-2" />
        ) : (
          <IconChevronRight className="w-2 h-2" />
        )}
      </button>
    </div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}>
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}>
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}>
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  isActive,
  ...props
}) => {
  // const { open, animate } = useSidebar();
  const { animate } = useSidebar();
  const [isOpen] = useState(true); // Add this state
 return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-2 group/sidebar py-2 px-2 rounded-md transition-colors relative",
        isActive 
          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
          : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
        className
      )}
      {...props}
    >
      {link.icon}
      {isOpen ? (
        <motion.span
          animate={{
            display: animate ? (isOpen ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (isOpen ? 1 : 0) : 1,
          }}
          className={cn(
            "text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre",
            isActive && "text-blue-600 dark:text-blue-400 font-medium"
          )}
        >
          {link.label}
        </motion.span>
      ) : (
        <div
          className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover/sidebar:opacity-100 transition-opacity whitespace-nowrap"
        >
          {link.label}
        </div>
      )}
    </Link>
  );
};
