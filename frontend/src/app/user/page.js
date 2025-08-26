// "use client";
// import React, { useState } from "react";
// import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
// import { Carousel, Card } from "../../components/ui/apple-cards-carousel";

// import {
//   IconArrowLeft,
//   IconBrandTabler,
//   IconSettings,
//   IconUserBolt,
// } from "@tabler/icons-react";
// import { motion } from "motion/react";
// import { cn } from "@/lib/utils";

// export default function SidebarDemo() {
    
//   const links = [
//     {
//       label: "All Questions",
//       href: "#",
//       icon: (
//         <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//       ),
//     },
//     {
//       label: "Explore New !",
//       href: "#",
//       icon: (
//         <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//       ),
//     },
//     {
//       label: "Practice Session",
//       href: "#",
//       icon: (
//         <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//       ),
//     },
//     {
//       label: "Logout",
//       href: "#",
//       icon: (
//         <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
//       ),
//     },
//   ];
//   const [open, setOpen] = useState(false);
//   return (
//     <div
//       className={cn(
//         "mx-auto flex w-screen flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-black",
//         // for your use case, use `h-screen` instead of `h-[60vh]`
//         "h-screen"
//       )}>
//       <Sidebar open={open} setOpen={setOpen}>
//         <SidebarBody className="justify-between gap-10">
//           <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
//             {open ? <Logo /> : <LogoIcon />}
//             <div className="mt-8 flex flex-col gap-2">
//               {links.map((link, idx) => (
//                 <SidebarLink key={idx} link={link} />
//               ))}
//             </div>
//           </div>
//           <div>
//             <SidebarLink
//               link={{
//                 label: "Manu Arora",
//                 href: "#",
//                 icon: (
//                   <img
//                     src="https://assets.aceternity.com/manu.png"
//                     className="h-7 w-7 shrink-0 rounded-full"
//                     width={50}
//                     height={50}
//                     alt="Avatar" />
//                 ),
//               }} />
//           </div>
//         </SidebarBody>
//       </Sidebar>
//       <Dashboard />
//     </div>
//   );
// }
// export const Logo = () => {
//   return (
//     <a
//       href="#"
//       className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
//       <div
//         className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
//       <motion.span
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="font-medium whitespace-pre text-black dark:text-white">
//         QnA Hub
//       </motion.span>
//     </a>
//   );
// };
// export const LogoIcon = () => {
//   return (
//     <a
//       href="#"
//       className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
//       <div
//         className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
//     </a>
//   );
// };

// // Dummy dashboard component with content
// const Dashboard = () => {
//     const cards = data.map((card, index) => (
//     <Card key={card.src} card={card} index={index} />
//   ));
  
//   return (
//     // <div className="flex flex-1">
//     //   <div
//     //     className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-black">
//     //     <div className="flex gap-2">
//     //       {[...new Array(4)].map((i, idx) => (
//     //         <div
//     //           key={"first-array-demo-1" + idx}
//     //           className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800"></div>
//     //       ))}
//     //     </div>
//     //     <div className="flex flex-1 gap-2">
//     //       {[...new Array(2)].map((i, idx) => (
//     //         <div
//     //           key={"second-array-demo-1" + idx}
//     //           className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800"></div>
//     //       ))}
//     //     </div>
//     //   </div>
//     // </div>
//     <div className="w-full h-full py-20">
//       <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
//         Get to know your iSad.
//       </h2>
//       <Carousel items={cards} />
//     </div>
//   );
// };


// const DummyContent = () => {
//   return (
//     <>
//       {[...new Array(3).fill(1)].map((_, index) => {
//         return (
//           <div
//             key={"dummy-content" + index}
//             className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
//           >
//             <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
//               <span className="font-bold text-neutral-700 dark:text-neutral-200">
//                 The first rule of Apple club is that you boast about Apple club.
//               </span>{" "}
//               Keep a journal, quickly jot down a grocery list, and take amazing
//               class notes. Want to convert those notes to text? No problem.
//               Langotiya jeetu ka mara hua yaar is ready to capture every
//               thought.
//             </p>
//             <img
//               src="https://assets.aceternity.com/macbook.png"
//               alt="Macbook mockup from Aceternity UI"
//               height="500"
//               width="500"
//               className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
//             />
//           </div>
//         );
//       })}
//     </>
//   );
// }

// const data = [
//   {
//     category: "Artificial Intelligence",
//     title: "You can do more with AI.",
//     src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     content: <DummyContent />,
//   },
//   {
//     category: "Productivity",
//     title: "Enhance your productivity.",
//     src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     content: <DummyContent />,
//   },
//   {
//     category: "Product",
//     title: "Launching the new Apple Vision Pro.",
//     src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     content: <DummyContent />,
//   },
 
//   {
//     category: "Product",
//     title: "Maps for your iPhone 15 Pro Max.",
//     src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     content: <DummyContent />,
//   },
//   {
//     category: "iOS",
//     title: "Photography just got better.",
//     src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     content: <DummyContent />,
//   },
//   {
//     category: "Hiring",
//     title: "Hiring for a Staff Software Engineer",
//     src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     content: <DummyContent />,
//   },
// ];


"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/user/new");
  }, [router]);
  
  return null;
}