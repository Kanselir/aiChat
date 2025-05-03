
'use client';

import type {
  GeneratePracticeProblemFeedbackInput,
  GeneratePracticeProblemFeedbackOutput,
} from '@/ai/flows/generate-practice-problem-feedback';
import type { SolvePhysicsProblemFromImageInput } from '@/ai/flows/solve-physics-problem-from-image';
import type { SolvePhysicsProblemFromTextInput } from '@/ai/flows/solve-physics-problem-from-text';

import { generatePracticeProblemFeedback } from '@/ai/flows/generate-practice-problem-feedback';
import { solvePhysicsProblemFromImage } from '@/ai/flows/solve-physics-problem-from-image';
import { solvePhysicsProblemFromText } from '@/ai/flows/solve-physics-problem-from-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { HelpCircle, Home, Loader2, NotebookPen, Paperclip, User, BrainCircuit, FlaskConical } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';


type Message = {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  isFeedbackRequest?: boolean; // Special flag for practice answers
  problemContext?: string; // To store the problem text when asking for feedback
};

type ChatMode = 'chat' | 'practice' | 'homework';

// Represents the current state of the AI interaction
type InteractionState = 'idle' | 'thinking' | 'awaiting_feedback' | 'displaying_problem';

// Define the SVG icon for the AI avatar
const AiAvatarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="hsl(var(--primary))"/>
    <path d="M15.5 12c0-1.93-1.57-3.5-3.5-3.5S8.5 10.07 8.5 12s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5zm-3.5 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="hsl(var(--primary))"/>
    <circle cx="12" cy="12" r="1.5" fill="hsl(var(--primary))"/>
    <path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="hsl(var(--primary))"/>
    <path d="M12 15c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="hsl(var(--primary))"/>
    <path d="M7 10c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="hsl(var(--primary))"/>
    <path d="M17 10c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="hsl(var(--primary))"/>
  </svg>
);

export function PhysiPalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('chat');
  const [interactionState, setInteractionState] = useState<InteractionState>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentProblem, setCurrentProblem] = useState<string | null>(null); // Store the current practice problem
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Function to add a message to the chat
  const addMessage = (sender: 'user' | 'ai', content: string, isFeedbackRequest = false, problemContext?: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender, content, isFeedbackRequest, problemContext },
    ]);
  };

  // Handle AI response generation
  const getAiResponse = useCallback(async (userMessage: string, mode: ChatMode, image?: string | null, isFeedbackReq = false, problemCtx?: string) => {
    setInteractionState('thinking');
    setInput(''); // Clear input after sending
    setUploadedImage(null); // Clear image preview

    try {
      let aiResponseContent = '';
      let isCorrect: boolean | undefined = undefined;

      if (mode === 'chat') {
          const aiInput: SolvePhysicsProblemFromTextInput = { problemText: userMessage };
          const response = await solvePhysicsProblemFromText(aiInput);
          aiResponseContent = response.solution;
      } else if (mode === 'practice') {
        if (isFeedbackReq && problemCtx) {
          // User submitted an answer, get feedback
          const feedbackInput: GeneratePracticeProblemFeedbackInput = { problem: problemCtx, answer: userMessage };
          const feedbackOutput: GeneratePracticeProblemFeedbackOutput = await generatePracticeProblemFeedback(feedbackInput);
          aiResponseContent = feedbackOutput.feedback;
          isCorrect = feedbackOutput.correct;
           // Display correctness alongside feedback
          const correctnessPrefix = isCorrect ? "**Correct!** " : "**Incorrect.** ";
          aiResponseContent = correctnessPrefix + aiResponseContent;
          setInteractionState('idle'); // Ready for next problem or chat
          setCurrentProblem(null); // Clear current problem after feedback
        } else {
          // User requested a new problem
          setInteractionState('displaying_problem');
          const problemRequest: SolvePhysicsProblemFromTextInput = { problemText: "Generate a medium-difficulty high school physics practice problem. State the problem clearly." };
          const problemResponse = await solvePhysicsProblemFromText(problemRequest);
          aiResponseContent = problemResponse.solution;
          setCurrentProblem(aiResponseContent); // Store the generated problem
          setInteractionState('awaiting_feedback'); // Now wait for user's answer
        }
      } else if (mode === 'homework') {
        if (image) {
          const imageInput: SolvePhysicsProblemFromImageInput = { photoDataUri: image };
          const response = await solvePhysicsProblemFromImage(imageInput);
          aiResponseContent = response.solution;
        } else {
          const textInput: SolvePhysicsProblemFromTextInput = { problemText: userMessage };
          const response = await solvePhysicsProblemFromText(textInput);
          aiResponseContent = response.solution;
        }
      }

      if (aiResponseContent && mode !== 'practice' || (mode === 'practice' && isFeedbackReq)) {
          addMessage('ai', aiResponseContent);
      } else if (aiResponseContent && mode === 'practice' && !isFeedbackReq) {
          // Add the problem message from AI separately
           addMessage('ai', `Okay, here's a practice problem for you:\n\n${aiResponseContent}\n\nPlease provide your solution.`);
      }


    } catch (error) {
      console.error('AI Error:', error);
      addMessage('ai', 'Sorry, I encountered an error. Please try again.');
    } finally {
      // Reset state if it wasn't handled by practice mode logic
      if (mode !== 'practice' || isFeedbackReq) {
        setInteractionState('idle');
      }
    }
  }, []);


  // Handle user input submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();

    if (interactionState === 'thinking') return; // Prevent multiple submissions

    if (mode === 'practice' && interactionState === 'idle') {
        // User wants a new practice problem
        addMessage('user', "Give me a practice problem.");
        getAiResponse("Give me a practice problem.", 'practice');
        return;
    }

    if (mode === 'practice' && interactionState === 'awaiting_feedback' && trimmedInput && currentProblem) {
      // User is submitting an answer to the current practice problem
      addMessage('user', trimmedInput, true, currentProblem); // Mark as feedback request and pass context
      getAiResponse(trimmedInput, 'practice', null, true, currentProblem); // Send for feedback
      return;
    }


    if (trimmedInput || uploadedImage) {
      const messageToSend = trimmedInput || (uploadedImage ? "Please solve the problem in the image." : "");
       if (messageToSend) {
        addMessage('user', messageToSend);
        getAiResponse(messageToSend, mode, uploadedImage);
       }
    }
  };


  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setUploadedImage(dataUri);
        // Automatically trigger submission if in homework mode and an image is uploaded
        if (mode === 'homework') {
             addMessage('user', `Uploaded an image.`); // Placeholder message
             getAiResponse("Solve the problem in the image.", mode, dataUri);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Update placeholder text based on mode and state
    const getPlaceholderText = () => {
        if (interactionState === 'thinking') return 'PhysiPal is thinking...';
        if (mode === 'practice') {
            if (interactionState === 'awaiting_feedback') return 'Enter your solution to the practice problem...';
            return 'Click "Send" or type anything to get a practice problem.';
        }
        if (mode === 'homework' && uploadedImage) return 'Image uploaded. PhysiPal is working on it...';
        if (mode === 'homework') return 'Type your homework problem or upload an image...';
        return 'Ask PhysiPal anything about physics...';
    };

    const isInputDisabled = () => {
       if (interactionState === 'thinking') return true;
       if (mode === 'homework' && uploadedImage) return true; // Disable input while processing image
       if (mode === 'practice' && interactionState === 'displaying_problem') return true; // Disable while showing problem
       if (mode === 'practice' && interactionState === 'idle') return true; // Disable text input, only allow button click
       return false;
    };

    const isSendButtonDisabled = () => {
        if (interactionState === 'thinking') return true;
        if (mode === 'homework' && !input.trim() && !uploadedImage) return true;
        if (mode === 'practice' && interactionState === 'idle') return false; // Enable to request problem
        if (mode === 'practice' && interactionState === 'awaiting_feedback' && !input.trim()) return true; // Require answer input
        if (mode !== 'practice' && !input.trim() && !uploadedImage) return true; // General case
        return false;
    }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 dark">
       {/* Header */}
        <header className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
                 <FlaskConical className="text-primary h-8 w-8" />
                 <h1 className="text-2xl font-bold text-primary">PhysiPal</h1>
            </div>
             {/* Mode Selection */}
             <RadioGroup
                defaultValue="chat"
                onValueChange={(value) => setMode(value as ChatMode)}
                className="flex space-x-2 bg-secondary p-1 rounded-lg"
                aria-label="Select Mode"
              >
                <Label
                  htmlFor="chat-mode"
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer transition-colors text-sm",
                    mode === 'chat' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value="chat" id="chat-mode" className="sr-only" />
                  <BrainCircuit className="h-4 w-4" /> Chat
                </Label>
                <Label
                  htmlFor="practice-mode"
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer transition-colors text-sm",
                    mode === 'practice' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value="practice" id="practice-mode" className="sr-only" />
                  <NotebookPen className="h-4 w-4" /> Practice
                </Label>
                <Label
                  htmlFor="homework-mode"
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer transition-colors text-sm",
                    mode === 'homework' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value="homework" id="homework-mode" className="sr-only" />
                  <Home className="h-4 w-4" /> Homework
                </Label>
              </RadioGroup>
        </header>


      {/* Chat Area */}
      <ScrollArea className="flex-grow mb-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 p-2 bg-primary rounded-full text-primary-foreground">
                  <AiAvatarIcon />
                </div>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-lg shadow-md',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card text-card-foreground rounded-bl-none'
                )}
              >
                <Markdown
                   components={{
                    // Customize rendering if needed, e.g., for code blocks
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <pre className="bg-muted p-2 rounded-md overflow-x-auto my-2"><code className={className} {...props}>{children}</code></pre>
                      ) : (
                        <code className="bg-muted px-1 rounded" {...props}>{children}</code>
                      )
                    },
                    p(props) { return <p className="mb-2 last:mb-0" {...props} />},
                     ul(props) { return <ul className="list-disc list-inside mb-2" {...props}/>},
                      ol(props) { return <ol className="list-decimal list-inside mb-2" {...props}/>},
                       li(props) { return <li className="mb-1" {...props}/>},
                       strong(props) { return <strong className="font-semibold" {...props}/>},
                  }}
                >{message.content}</Markdown>
              </div>
              {message.sender === 'user' && (
                <div className="flex-shrink-0 p-2 bg-secondary text-secondary-foreground rounded-full">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          {interactionState === 'thinking' && (
            <div className="flex items-center justify-start gap-3">
               <div className="flex-shrink-0 p-2 bg-primary rounded-full text-primary-foreground">
                 <AiAvatarIcon />
               </div>
              <div className="bg-card text-card-foreground p-3 rounded-lg rounded-bl-none shadow-md flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border pt-4">
        {mode === 'homework' && (
          <>
            <Button type="button" variant="outline" size="icon" onClick={triggerFileInput} disabled={interactionState === 'thinking'} aria-label="Upload homework image">
              <Paperclip className="h-5 w-5" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              disabled={interactionState === 'thinking'}
            />
            {uploadedImage && (
                <div className="relative h-10 w-10">
                    <Image src={uploadedImage} alt="Uploaded homework problem" layout="fill" objectFit="cover" className="rounded" />
                </div>
            )}
          </>
        )}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholderText()}
          className="flex-grow resize-none min-h-[40px] max-h-[120px]"
          rows={1}
          disabled={isInputDisabled()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); // Prevent newline on Enter
              handleSubmit();
            }
          }}
          aria-label="Chat input"
        />
        <Button type="submit" disabled={isSendButtonDisabled()} size="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
            {interactionState === 'thinking' ? (
                 <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                mode === 'practice' && interactionState === 'idle' ? 'Get Problem' : 'Send'
            )
            }
        </Button>
      </form>
    </div>
  );
}
