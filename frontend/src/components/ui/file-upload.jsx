import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Clipboard } from "lucide-react";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
    opacity: 1,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 1,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: 1,
  },
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ...existing code...
export const FileUpload = ({
  onChange,
  id = "default"
}) => {
  const [files, setFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null); 

  const handleFileChange = (newFiles) => {
    // Merge new files with existing, avoiding duplicates by name
  const mergedFiles = [...files, ...newFiles].reduce((acc, file) => {
    if (!acc.some(f => f.name === file.name && f.size === file.size)) {
      acc.push(file);
    }
    return acc;
  }, []);
  setFiles(mergedFiles);
  onChange && onChange(mergedFiles);
  };

  const handlePaste = (e) => {
    console.log("in pastinggg")
    e.preventDefault();
    const items = e.clipboardData?.items;
    if (!items) return;
    
    const pastedFiles = [];
    
    // Convert DataTransferItemList to array and process
    Array.from(items).forEach((item) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          pastedFiles.push(file);
        }
      }
    });
    
    if (pastedFiles.length > 0) {
      handleFileChange(pastedFiles);
    }
  };

  const handlePasteFromClipboard = async () => {
    setIsPasting(true);
    try {
      const clipboardItems = await navigator.clipboard.read();
      const pastedFiles = [];

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            // Create a file from the blob with a proper name
            const file = new File([blob], `pasted-image-${Date.now()}.${type.split('/')[1]}`, {
              type: type,
              lastModified: Date.now()
            });
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        handleFileChange(pastedFiles);
      } else {
        console.log('No image files found in clipboard');
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      // Fallback: focus the container to enable paste event
      if (containerRef.current) {
        containerRef.current.focus();
      }
    } finally {
      setIsPasting(false);
    }
  };

  const handleMouseEnter = () => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full" 
      tabIndex={0}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onMouseEnter={handleMouseEnter}
      style={{ outline: 'none' }}
    >
      <motion.div
        whileHover="animate"
        className="p-10 group/file block rounded-lg w-full relative overflow-hidden">
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden" />
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p
            className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload file
          </p>
          <p
            className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag or drop your files here or click to upload
          </p>
          <p
            className="relative z-20 font-sans font-normal text-blue-400 dark:text-blue-300 text-sm mt-1">
            You can also paste screenshots here (Cmd+V)
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePasteFromClipboard();
            }}
            disabled={isPasting}
            className="relative z-20 mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <Clipboard className="h-4 w-4" />
            {isPasting ? 'Pasting...' : 'Paste from Clipboard'}
          </button>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? `file-upload-${id}` : `file-upload-${id}-${idx}`}
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                    "shadow-sm"
                  )}>
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs">
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div
                    className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 ">
                      {file.type}
                    </motion.p>

                    <motion.p initial={{ opacity: 1 }} animate={{ opacity: 1 }} layout>
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                onClick={handleClick}
                layoutId={`file-upload-${id}`}
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md cursor-pointer",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}>
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center">
                    Drop it
                    <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
// ...existing code...
// ...existing code...

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div
      className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`} />
          );
        }))}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <FileUpload onChange={(files) => console.log('Files:', files)} />
    </div>
  );
}