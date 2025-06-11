
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
      text: 'Hello! I\'m your MNA Africa Legal Assistant. I can help you find files, check case statuses, see who\'s on leave, and review pending approvals. What can I help you with today?',
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
    
    // Leave status responses
    if (lowerQuery.includes('leave') || lowerQuery.includes('who is on leave') || lowerQuery.includes('on leave')) {
      return 'Currently, Sarah Johnson is on leave from June 15-17, 2024 (3 days annual leave). All other team members are available and working. Would you like more details about upcoming leave requests?';
    }
    
    // Pending approvals responses
    if (lowerQuery.includes('approval') || lowerQuery.includes('pending') || lowerQuery.includes('approve')) {
      return 'You have 4 pending approvals:\n• Sarah Johnson - Leave Request (Medium Priority)\n• Michael Brown - Budget Approval for legal research subscription (High Priority)\n• Emily Davis - Client Contract for TechCorp Industries (High Priority)\n• David Wilson - Equipment Request for new laptop (Low Priority)\n\nWould you like me to show details for any specific approval?';
    }
    
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
    
    // Team information
    if (lowerQuery.includes('team') || lowerQuery.includes('staff') || lowerQuery.includes('who works')) {
      return 'The MNA Africa team includes:\n• Sarah Johnson - Senior Associate\n• Michael Brown - Legal Counsel\n• Emily Davis - Paralegal\n• David Wilson - Junior Associate\n\nAll team members are currently active except Sarah who is on leave June 15-17.';
    }
    
    // Client information
    if (lowerQuery.includes('client') || lowerQuery.includes('techcorp')) {
      return 'We have 4 active clients: TechCorp Industries, Global Investments Ltd, Estate Planning Solutions, and Manufacturing Co. TechCorp Industries has a new contract pending approval. Would you like details about any specific client?';
    }
    
    if (lowerQuery.includes('calendar') || lowerQuery.includes('schedule')) {
      return 'Your upcoming schedule includes: Court Hearing for Case #2024-001 tomorrow at 10:00 AM in Courtroom 3A, and a client consultation on June 11th at 2:00 PM.';
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return 'I can help you with:\n• Finding specific case files\n• Checking who is on leave\n• Showing pending approvals\n• Team member information\n• Client details\n• Task deadlines\n• Calendar events\n\nJust ask me naturally, like "Who is on leave?" or "Show me pending approvals"';
    }
    
    // Default response
    return 'I\'m here to help you with the MNA Africa system! You can ask me about team members on leave, pending approvals, specific cases, files, or schedules. Try asking something like "Who is on leave?" or "Show me pending approvals"';
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-mna-primary hover:bg-mna-primary/90 shadow-lg z-50"
          size="icon"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-mna-primary text-white rounded-t-lg">
            <CardTitle className="text-lg">MNA Africa Assistant</CardTitle>
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
                          ? "bg-mna-primary text-white"
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
                  placeholder="Ask about team, approvals, or files..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-mna-primary"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-mna-primary hover:bg-mna-primary/90"
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
