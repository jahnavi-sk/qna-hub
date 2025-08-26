"use client";
import React , {useState} from "react";
import { Label } from "../components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";



export default function LoginPg() {
  const router = useRouter();
  const [formType, setFormType] = useState("signup");

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.firstname.value;
    const email = e.target.email.value;
    const password = e.target.password.value; 

    try{
      const res = await fetch("http://127.0.0.1:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) {
      alert("Sign up successful!");
      router.replace("/user");
      // setFormType("login");
    } else {
      alert(data.error || "Sign up failed");
    }
  } catch (err) {
    alert("Server error. Please try again.");
  }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    console.log("Admin Sign In submitted");
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    const username = e.target["firstname"].value; // If you use email as username
  const password = e.target["login-password"].value;

  try {
    const res = await fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Login successful!");
      router.replace("/user");
      // Redirect or set user state here
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    alert("Server error. Please try again.");
  }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative w-full max-w-md h-[500px]">
        <AnimatePresence mode="wait">
          {formType === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-white dark:bg-black rounded-2xl shadow-input p-8"
            >
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                User Sign Up
              </h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Welcome to QnA Hub. Sign up as a user.
              </p>
              <form className="my-8" onSubmit={handleUserSubmit}>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <LabelInputContainer>
                    <Label htmlFor="firstname">Username</Label>
                    <Input id="firstname" placeholder="Virat" type="text" />
                  </LabelInputContainer>
                  
                </div>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="viratkohli@fc.com" type="email" />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" placeholder="••••••••" type="password" />
                </LabelInputContainer>
                <button
                  className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                  type="submit"
                >
                  Sign up &rarr;
                  <BottomGradient />
                </button>
              </form>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  className="mt-2 text-sm text-blue-500 underline hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded transition-all duration-200"
                  type="button"
                  onClick={() => setFormType("login")}
                >
                  Already have an account? Log in
                </button>
                <button
                  className="mt-2 text-sm text-blue-500 underline hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded transition-all duration-200"
                  type="button"
                  onClick={() => setFormType("admin")}
                >
                  Switch to Admin Sign In
                </button>
              </div>
            </motion.div>
          )}

          {formType === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-white dark:bg-black rounded-2xl shadow-input p-8"
            >
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                User Log In
              </h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Log in to your Aceternity account.
              </p>
              <form className="my-8" onSubmit={handleUserLogin}>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="firstname">Email Address</Label>
                  <Input id="firstname" placeholder="viratkohli" type="text" />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" placeholder="••••••••" type="password" />
                </LabelInputContainer>
                <button
                  className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                  type="submit"
                >
                  Log In &rarr;
                  <BottomGradient />
                </button>
              </form>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  className="mt-2 text-sm text-blue-500 underline hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded transition-all duration-200"
                  type="button"
                  onClick={() => setFormType("signup")}
                >
                  Don't have an account? Sign up
                </button>
                <button
                  className="mt-2 text-sm text-blue-500 underline hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded transition-all duration-200"
                  type="button"
                  onClick={() => setFormType("admin")}
                >
                  Switch to Admin Sign In
                </button>
              </div>
            </motion.div>
          )}

          {formType === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-white dark:bg-black rounded-2xl shadow-input p-8"
            >
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Admin Sign In
              </h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Sign in as an admin to manage QnA Hub.
              </p>
              <form className="my-8" onSubmit={handleAdminSubmit}>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" placeholder="admin@aceternity.com" type="email" />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input id="admin-password" placeholder="••••••••" type="password" />
                </LabelInputContainer>
                <button
                  className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                  type="submit"
                >
                  Sign In &rarr;
                  <BottomGradient />
                </button>
              </form>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  className="mt-2 text-sm text-blue-500 underline hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded transition-all duration-200"
                  type="button"
                  onClick={() => setFormType("signup")}
                >
                  Switch to User Sign Up
                </button>
                <button
                  className="mt-2 text-sm text-blue-500 underline hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded transition-all duration-200"
                  type="button"
                  onClick={() => setFormType("login")}
                >
                  Switch to User Log In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
    

const BottomGradient = () => {
  return (
    <>
      <span
        className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span
        className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};