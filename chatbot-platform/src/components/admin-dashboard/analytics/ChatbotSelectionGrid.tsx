"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Activity, Calendar, Users, MessageSquare, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

// Type for the individual chatbot
interface ChatbotItem {
  id: string;
  name: string;
  userName: string;
  userEmail: string;
  status: string;
  conversationCount: number;
  lastActive: string;
  platform: string;
  industry: string;
}

interface ChatbotSelectionGridProps {
  chatbots: ChatbotItem[];
}

export default function ChatbotSelectionGrid({ chatbots }: ChatbotSelectionGridProps) {
  const [search, setSearch] = useState("");

  // Filter chatbots based on search term
  const filteredChatbots = chatbots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.userName.toLowerCase().includes(search.toLowerCase()) ||
      bot.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      bot.platform.toLowerCase().includes(search.toLowerCase()) ||
      bot.industry.toLowerCase().includes(search.toLowerCase())
  );

  // Function to format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative w-full max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search chatbots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Chatbot grid */}
      {filteredChatbots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChatbots.map((chatbot) => (
            <Link 
              key={chatbot.id} 
              href={`/admin/analytics?chatbotId=${chatbot.id}`}
              className="block transition-transform hover:scale-[1.02]"
            >
              <Card className="bg-[#1b2539] border-0 overflow-hidden h-full hover:bg-[#232b3c] transition-colors duration-300">
                <div className={`h-2 w-full ${chatbot.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{chatbot.name}</h3>
                        <p className="text-sm text-gray-400">{chatbot.userName}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      chatbot.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {chatbot.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-[#232b3c] p-3 rounded">
                      <div className="flex items-center mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                        <p className="text-xs text-gray-400">Conversations</p>
                      </div>
                      <p className="text-lg font-medium">{chatbot.conversationCount}</p>
                    </div>
                    <div className="bg-[#232b3c] p-3 rounded">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                        <p className="text-xs text-gray-400">Last Active</p>
                      </div>
                      <p className="text-sm">{formatDate(chatbot.lastActive)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-400">{chatbot.industry}</span>
                    </div>
                    <div className="text-blue-400 flex items-center hover:text-blue-300">
                      View Analytics
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-[#1b2539] border-0">
          <CardContent className="p-6 text-center">
            <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Chatbots Found</h3>
            <p className="text-gray-400 mb-2">
              {search 
                ? "No chatbots match your search criteria." 
                : "There are no chatbots available yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}