
import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your MNA Legal Assistant. I can help you find files, check case statuses, and navigate the system. What can I help you with today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

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

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // File search responses
    if (lowerQuery.includes('johnson') || lowerQuery.includes('smith')) {
      return 'I found the Johnson vs. Smith case! It\'s a contract dispute case that\'s currently active and being handled by Sarah Johnson. Last updated on June 10, 2024. Would you like me to show you more details?';
    }
    
    if (lowerQuery.includes('peterson')) {
      return 'I found the Peterson Estate Planning file. It\'s a general case marked as complete, handled by Michael Brown. Last updated on June 8, 2024.';
    }
    
    if (lowerQuery.includes('active') && lowerQuery.includes('files')) {
      return 'Currently you have 2 active files: Johnson vs. Smith Contract Dispute and Wilson Family Trust. Both need attention this week.';
    }
    
    if (lowerQuery.includes('court') && lowerQuery.includes('files')) {
      return 'Your court files include: Johnson vs. Smith Contract Dispute (Active) and Corporate Merger - TechCorp (Pending). The Johnson case has a hearing scheduled soon.';
    }
    
    if (lowerQuery.includes('tasks') && lowerQuery.includes('due')) {
      return 'You have 3 tasks due this week: Client consultation preparation, court filing review, and contract analysis. The court filing review is high priority.';
    }
    
    if (lowerQuery.includes('calendar') || lowerQuery.includes('schedule')) {
      return 'Your upcoming schedule includes: Court Hearing for Case #2024-001 tomorrow at 10:00 AM in Courtroom 3A, and a client consultation on June 11th at 2:00 PM.';
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return 'I can help you with:\n• Finding specific case files\n• Checking task deadlines\n• Viewing calendar events\n• Getting case status updates\n• Searching by client name or case type\n\nJust ask me naturally, like "Show me Peterson case" or "What tasks are due today?"';
    }
    
    // Default response
    return 'I\'m here to help you with the MNA system! You can ask me about specific cases, files, tasks, or schedules. Try asking something like "Show me active court files" or "What\'s due today?"';
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-mna-navy hover:bg-mna-navy/90 shadow-lg z-50"
          size="icon"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-mna-navy text-white rounded-t-lg">
            <CardTitle className="text-lg">MNA Legal Assistant</CardTitle>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg",
                        message.isUser
                          ? "bg-mna-navy text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about files, cases, or tasks..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-mna-navy"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-mna-navy hover:bg-mna-navy/90"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;
