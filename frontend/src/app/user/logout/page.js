"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Handle logout logic here
    console.log("Logging out...");
    // Clear tokens, etc.
    
    // Redirect to home or login page
    router.replace("/");
  }, [router]);
  
//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="text-center">
//         <h1 className="text-2xl font-semibold">Logging out...</h1>
//       </div>
//     </div>
//   );
}