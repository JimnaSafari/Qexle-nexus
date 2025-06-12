import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { API_CONFIG } from '@/config/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your MNA Africa Legal Assistant. I can help you with:\n\n• Team information & leave status\n• Pending approvals & tasks\n• Client details & case files\n• Invoice tracking\n• Calendar & deadlines\n• Court schedules\n\nWhat would you like to know?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting to the system. Please try again later.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchData = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const generateResponse = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    try {
      if (lowerQuery.includes('leave') || lowerQuery.includes('team') || lowerQuery.includes('staff')) {
        const teamData = await fetchData(API_CONFIG.ENDPOINTS.TEAM);
        const leaveData = await fetchData(API_CONFIG.ENDPOINTS.LEAVE);
        return formatTeamResponse(teamData, leaveData);
      }
      
      if (lowerQuery.includes('approval') || lowerQuery.includes('pending')) {
        const approvalsData = await fetchData(API_CONFIG.ENDPOINTS.APPROVALS);
        return formatApprovalsResponse(approvalsData);
      }
      
      if (lowerQuery.includes('case') || lowerQuery.includes('file') || lowerQuery.includes('court')) {
        const casesData = await fetchData(API_CONFIG.ENDPOINTS.CASES);
        return formatCasesResponse(casesData);
      }
      
      if (lowerQuery.includes('client') || lowerQuery.includes('customer')) {
        const clientsData = await fetchData(API_CONFIG.ENDPOINTS.CLIENTS);
        return formatClientsResponse(clientsData);
      }
      
      if (lowerQuery.includes('calendar') || lowerQuery.includes('schedule') || lowerQuery.includes('meeting')) {
        const calendarData = await fetchData(API_CONFIG.ENDPOINTS.CALENDAR);
        return formatCalendarResponse(calendarData);
      }
      
      if (lowerQuery.includes('invoice') || lowerQuery.includes('billing') || lowerQuery.includes('payment')) {
        const invoicesData = await fetchData(API_CONFIG.ENDPOINTS.INVOICES);
        return formatInvoicesResponse(invoicesData);
      }
      
      if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
        return getHelpResponse();
      }
      
      return getDefaultResponse();
      
    } catch (error) {
      return 'I\'m sorry, I\'m having trouble accessing the latest information. Please try again in a moment.';
    }
  };

  const formatTeamResponse = (teamData: any, leaveData: any) => {
    return `👥 **Team Status:**\n\n${teamData?.message || 'Team information temporarily unavailable.'}\n\n📅 **Leave Status:**\n\n${leaveData?.message || 'Leave information temporarily unavailable.'}`;
  };

  const formatApprovalsResponse = (data: any) => {
    return `⚡ **Pending Approvals:**\n\n${data?.message || 'Approvals information temporarily unavailable.'}`;
  };

  const formatCasesResponse = (data: any) => {
    return `📁 **Case Files:**\n\n${data?.message || 'Case information temporarily unavailable.'}`;
  };

  const formatClientsResponse = (data: any) => {
    return `👔 **Client Information:**\n\n${data?.message || 'Client information temporarily unavailable.'}`;
  };

  const formatCalendarResponse = (data: any) => {
    return `📅 **Calendar & Schedule:**\n\n${data?.message || 'Calendar information temporarily unavailable.'}`;
  };

  const formatInvoicesResponse = (data: any) => {
    return `💰 **Invoice & Billing:**\n\n${data?.message || 'Billing information temporarily unavailable.'}`;
  };

  const getHelpResponse = () => {
    return '🤖 **MNA Africa Assistant Capabilities:**\n\n📋 **Information I Can Provide:**\n• Team members & leave schedules\n• Pending approvals & priorities\n• Case files & court dates\n• Client information & contacts\n• Invoice tracking & billing\n• Calendar events & deadlines\n\n💬 **Sample Questions:**\n• "Who is on leave this week?"\n• "Show me pending approvals"\n• "What\'s my schedule tomorrow?"\n• "Client information"\n• "Outstanding invoices"\n\nTry asking me anything about your legal practice!';
  };

  const getDefaultResponse = () => {
    return '🤔 I\'m here to help with your MNA Africa legal practice! I can assist with:\n\n📋 **Quick Options:**\n• Team & Leave Status\n• Pending Approvals\n• Case Files & Court Dates\n• Client Information\n• Invoice & Billing\n• Calendar & Scheduling\n\nWhat specific information would you like to know?';
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-mna-primary hover:bg-mna-primary/90 shadow-2xl z-50 transition-all duration-300 hover:scale-110",
            isMobile ? "bottom-4 right-4" : "bottom-6 right-6"
          )}
          size="icon"
        >
          <MessageCircle size={isMobile ? 24 : 28} className="animate-pulse" />
          <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-mna-accent rounded-full flex items-center justify-center text-xs font-bold text-mna-primary animate-ping">
            !
          </div>
        </Button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <Card className={cn(
          "fixed shadow-2xl z-50 animate-scale-in border-2 border-mna-primary/20 backdrop-blur-sm",
          isMobile 
            ? "inset-4 h-[calc(100vh-2rem)]" 
            : "bottom-6 right-6 w-96 h-[600px]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-mna-primary to-mna-primary/90 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-mna-accent rounded-full animate-pulse"></div>
              <CardTitle className="text-base sm:text-lg font-semibold">MNA Africa Assistant</CardTitle>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 w-8 p-0 transition-all duration-200"
            >
              <X size={16} />
            </Button>
          </CardHeader>
          
          <CardContent className={cn(
            "p-0 flex flex-col",
            isMobile ? "h-[calc(100%-4rem)]" : "h-[500px]"
          )}>
            <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex animate-fade-in",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] p-2 sm:p-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg",
                        message.isUser
                          ? "bg-gradient-to-r from-mna-primary to-mna-primary/90 text-white rounded-br-md"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 rounded-bl-md border border-gray-200"
                      )}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      <span className={cn(
                        "text-xs opacity-70 mt-1 sm:mt-2 block",
                        message.isUser ? "text-white/80" : "text-gray-500"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 sm:p-3 rounded-2xl rounded-bl-md border border-gray-200 flex items-center space-x-2">
                      <Loader2 size={14} className="animate-spin text-mna-primary" />
                      <span className="text-xs sm:text-sm text-gray-600">MNA Assistant is typing...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input area */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isMobile ? "Ask about team, cases..." : "Ask about team, approvals, cases, or schedule..."}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mna-primary focus:border-transparent transition-all duration-200 hover:border-mna-primary/50"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-mna-primary to-mna-primary/90 hover:from-mna-primary/90 hover:to-mna-primary px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </Button>
              </div>
              
              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                {['Team Status', 'Approvals', 'Calendar', 'Clients'].map((action) => (
                  <button
                    key={action}
                    onClick={() => setInputValue(action.toLowerCase())}
                    className="px-2 sm:px-3 py-1 text-xs bg-mna-primary/10 text-mna-primary rounded-full hover:bg-mna-primary hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;
