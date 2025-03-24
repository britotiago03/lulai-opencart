'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGear,
  faArrowLeft,
  faChevronDown,
  faChevronLeft,
  faHome,
} from '@fortawesome/free-solid-svg-icons';
import ProfilePictureExample from '../../../public/assets/bot_page/profile-picture-example.png';
import LulAILogoWhite from '../../../public/assets/bot_page/lulai-logo-icon-white.png';
import Link from 'next/link';
import MessageList from './MessageList';
import Image from 'next/image';
import { RotateCcw } from 'lucide-react';

// Define the type for messages
type Message = {
  text: string;
  isUser: boolean;
};

// Temporary fallback sanitize function
const sanitize = (input: string) => input;

const BotPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! How can I assist you today?', isUser: false },
  ]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const router = useRouter();

  // Check for session ID when component mounts
  useEffect(() => {
    const checkSession = () => {
      try {
        const session_id = sessionStorage.getItem("session_id");
        console.log("Session ID loaded on mount:", session_id);

        if (!session_id) {
          alert("Session expired or missing. Please start a new session.");
          router.push('/service'); // Redirect to service selection page
        }
      } catch (error) {
        console.error("Error checking session:", error);
        alert("Error accessing session. Please start a new session.");
        router.push('/service');
      }
    };

    checkSession();
  }, [router]);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    setIsRotated(newText.trim().length > 0);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      const maxHeight =
          parseInt(
              window.getComputedStyle(textareaRef.current).lineHeight || '0',
              10
          ) * 9;
      if (textareaRef.current.scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = 'scroll';
        textareaRef.current.style.height = `${maxHeight}px`;
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  };

  // Not async anymore to avoid the promise throw error
  const sendMessage = () => {
    if (isSending) return; // Prevent multiple sends
    setIsSending(true);

    let session_id;

    try {
      session_id = sessionStorage.getItem("session_id");
      console.log("Using session ID:", session_id);
    } catch (error) {
      console.error("Error getting session:", error);
      alert("Error accessing session. Please start a new session.");
      router.push('/service');
      setIsSending(false);
      return;
    }

    if (!session_id) {
      alert("Session expired or missing. Please start a new session.");
      router.push('/service'); // Redirect to service selection page
      setIsSending(false);
      return;
    }

    if (!text.trim()) {
      setIsSending(false);
      return; // Don't send empty messages
    }

    // Add user message to the chat
    const userText = text;
    setMessages((prevMessages) => [...prevMessages, { text: userText, isUser: true }]);
    setText('');
    setIsRotated(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Using standard promises instead of async/await
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    fetch(`${backendUrl}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id, question: userText }),
    })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const aiResponse = data?.answer || 'No answer received';
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: sanitize(aiResponse.trim()), isUser: false },
          ]);
        })
        .catch(error => {
          console.error('Error:', error);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: 'Sorry, there was an error processing your request.',
              isUser: false,
            },
          ]);
        })
        .finally(() => {
          setIsSending(false);
        });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsRotated(!isRotated);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
      setIsRotated(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleRefresh = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem("session_id"); // Clear session ID
    } catch (error) {
      console.error("Error removing session:", error);
    }
    router.push('/service');
  };

  return (
      <section className="h-full flex bg-gray-100 overflow-hidden w-full fixed">
        {/* SIDEBAR */}
        <div
            className={`fixed top-0 left-0 max-h-screen h-full bg-[#171717] text-white w-64 transition-transform duration-300 ease-in-out z-50
        border-r border-zinc-700 justify-between flex-col flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 ${!isSidebarOpen && 'md:-ml-64'}`}
        >
          {/* LULAI LOGO */}
          <div className="border-b border-zinc-700 flex py-6 md:justify-start z-10 gap-5 relative justify-center px-5">
            <div className="w-full text-left rounded-md font-bold justify-center flex">
              <Link href="/">
                <Image
                    src={LulAILogoWhite}
                    alt="LulAI Logo"
                    width={40}
                    height={40}
                    className="hover:cursor-pointer select-none"
                />
              </Link>
            </div>
            <button
                onClick={toggleSidebar}
                className="md:hidden text-xl hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/" className="w-full text-left p-2 hover:bg-[#ffffff09] rounded-md flex items-center">
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </Link>
          </nav>
          <nav className="p-4 space-y-2 justify-end font-light">
            <button
                onClick={handleRefresh}
                className="w-full text-left p-2 hover:bg-[#ffffff09] rounded-md flex items-center"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              New Session
            </button>
            <button className="w-full text-left p-2 hover:bg-[#ffffff09] rounded-md">
              <FontAwesomeIcon icon={faGear} className="mr-2" />
              Settings
            </button>
          </nav>
        </div>

        {/* OVERLAY SIDE BAR */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                onClick={toggleSidebar}
            ></div>
        )}

        {/* MAIN, BACKGROUND */}
        <div
            className={`flex flex-col bg-[#212121] relative transition duration-300 ease-in-out h-full max-h-screen
        ${isSidebarOpen && 'md:ml-64'}`}
            style={{ height: '100vh', width: '100%' }}
        >
          <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundSize: '10%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: 0.3,
                zIndex: 0,
              }}
          />

          {/* PROFILE */}
          <div className="flex w-full justify-between px-10">
            <div className="flex p-5 z-10 gap-5 md:justify-start">
              <button
                  onClick={toggleMenu}
                  className="rounded-full w-12 h-12 focus:outline-none"
              >
                <Image
                    src={ProfilePictureExample}
                    alt="Profile Picture"
                    width={50}
                    height={50}
                    className="hover:outline hover:outline-8 outline-[#72727269] rounded-full"
                />
              </button>
              <div className="text-white flex items-center gap-3">
                <div>
                  <h1 className="font-semibold">Your AI Agent</h1>
                  <p className="font-normal text-sm">Trained on your content</p>
                </div>
                {/* OPEN SIDEBAR */}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xl hover:cursor-pointer transform transition-transform duration-300 max-md:-rotate-90
                ${isRotated ? 'md:rotate-90' : 'md:-rotate-90'}`}
                    onClick={toggleSidebar}
                />
              </div>
            </div>
            <div className="flex text-white items-center">
              {/* REFRESH CHAT */}
              <RotateCcw
                  className="hover:cursor-pointer transform transition-transform duration-300 hover:-rotate-90"
                  onClick={handleRefresh} // Call handleRefresh when clicked
              />
            </div>
          </div>

          {/* PROFILE MENU */}
          {isMenuOpen && (
              <div
                  ref={menuRef}
                  className="flex md:absolute md:top-[90px] w-72 md:ml-5 bg-[#2c2c2c] text-white rounded-xl shadow-lg z-50 outline outline-1 outline-zinc-700 p-2 max-md:self-center mb-5"
              >
                <ul className="font-light w-full">
                  <li>
                    <Link
                        href="/"
                        className="px-4 py-2 hover:bg-[#ffffff09] rounded-lg items-center flex gap-2"
                    >
                      <FontAwesomeIcon icon={faHome} />
                      Back to Home
                    </Link>
                  </li>
                  <li>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 hover:bg-[#ffffff09] rounded-lg items-center flex gap-2 w-full text-left"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Start New Training
                    </button>
                  </li>
                </ul>
              </div>
          )}

          {/* DISPLAY MESSAGES */}
          <MessageList messages={messages} />

          {/* TEXT AREA */}
          <div className="md:px-5 pb-10 flex z-20 md:pt-0 md:border-transparent w-full justify-center">
            <div className="text-base md:px-5 max-md:w-[90%] md:w-[100%]">
              <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 w-full md:w-[100%] xl:w-[55em]">
                <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="w-full"
                    data-state="closed"
                >
                  <div className="relative flex h-full max-w-full flex-1 flex-col justify-end">
                    <div className="group relative flex w-full items-center">
                      <div className="flex w-full flex-col gap-1.5 rounded-[20px] p-2 transition-colors bg-gray-800 border-neu">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <div className="flex min-w-0 flex-1 flex-col">
                          <textarea
                              id="prompt-textarea"
                              tabIndex={0}
                              dir="auto"
                              rows={1}
                              placeholder="Message LulAI..."
                              className="m-0 resize-none border-0 bg-transparent px-0 focus:ring-0 focus-visible:ring-0 text-white max-h-52 outline-none pl-5 placeholder:text-zinc-400"
                              value={text}
                              onChange={handleInputChange}
                              onKeyDown={handleKeyDown}
                              ref={textareaRef}
                          ></textarea>
                          </div>
                          <button
                              disabled={!text.trim() || isSending}
                              aria-label="Send Prompt"
                              onClick={() => sendMessage()}
                              type="button"
                              className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#212121] text-white transition-colors hover:opacity-70 focus-visible:outline-none disabled:bg-[#a1a1a1] disabled:text-[#f4f4f4] disabled:hover:opacity-100 duration-500 ease-in-out ${
                                  isRotated ? 'rotate-90' : ''
                              }`}
                          >
                            <FontAwesomeIcon icon={faArrowLeft} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default BotPage;