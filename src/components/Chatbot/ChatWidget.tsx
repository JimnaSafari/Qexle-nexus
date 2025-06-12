
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Comprehensive leave status responses
    if (lowerQuery.includes('leave') || lowerQuery.includes('who is on leave') || lowerQuery.includes('on leave') || lowerQuery.includes('vacation') || lowerQuery.includes('absent')) {
      return '📅 **Current Leave Status:**\n\n✅ **Available Team Members:**\n• Michael Brown - Legal Counsel\n• Emily Davis - Paralegal\n• David Wilson - Junior Associate\n\n🏖️ **Currently on Leave:**\n• Sarah Johnson - Senior Associate\n  📅 June 15-17, 2024 (3 days annual leave)\n  📞 Contact: michael.brown@mnaafrica.co.ke for urgent matters\n\n📋 **Upcoming Leave:**\n• Emily Davis - June 20-22, 2024 (Personal leave)\n• David Wilson - June 25-30, 2024 (Annual leave)\n\nWould you like me to show you how to request leave or check team availability for specific dates?';
    }
    
    // Enhanced pending approvals responses
    if (lowerQuery.includes('approval') || lowerQuery.includes('pending') || lowerQuery.includes('approve') || lowerQuery.includes('waiting')) {
      return '⚡ **Pending Approvals (4 items):**\n\n🔴 **High Priority:**\n• Michael Brown - Budget Approval\n  💰 Legal research subscription renewal - $2,400\n  ⏰ Due: Today\n\n• Emily Davis - Client Contract\n  📋 TechCorp Industries partnership agreement\n  ⏰ Due: Tomorrow\n\n🟡 **Medium Priority:**\n• Sarah Johnson - Leave Request\n  📅 Additional 2 days annual leave extension\n  ⏰ Due: June 18\n\n🟢 **Low Priority:**\n• David Wilson - Equipment Request\n  💻 New laptop for case research\n  ⏰ Due: June 20\n\n💡 **Quick Actions:**\n• Approve all high priority items\n• Review contract terms\n• Schedule approval meeting\n\nWhich approval would you like to review first?';
    }
    
    // Enhanced file search responses
    if (lowerQuery.includes('johnson') || lowerQuery.includes('smith') || lowerQuery.includes('case')) {
      return '📁 **Johnson vs. Smith Case File:**\n\n📋 **Case Details:**\n• Case ID: #2024-001\n• Type: Contract Dispute\n• Status: Active - Discovery Phase\n• Assigned: Sarah Johnson (Primary), David Wilson (Support)\n• Client: Johnson Enterprises Ltd.\n\n📅 **Key Dates:**\n• Filed: March 15, 2024\n• Next Hearing: June 18, 2024 - 10:00 AM\n• Discovery Deadline: June 25, 2024\n\n📄 **Recent Activity:**\n• June 10: Witness statements submitted\n• June 8: Expert reports filed\n• June 5: Mediation scheduled\n\n⚠️ **Action Required:**\n• Prepare cross-examination questions\n• Review opposing counsel\'s evidence\n• Schedule client meeting\n\nWould you like me to show similar cases or court calendar details?';
    }
    
    // Team information with more details
    if (lowerQuery.includes('team') || lowerQuery.includes('staff') || lowerQuery.includes('who works') || lowerQuery.includes('lawyers')) {
      return '👥 **MNA Africa Legal Team:**\n\n⚖️ **Senior Staff:**\n• Sarah Johnson - Senior Associate\n  📧 sarah.johnson@mnaafrica.co.ke\n  💼 Specialization: Corporate Law, Litigation\n  📊 Current Cases: 12 active\n  🏖️ Status: On Leave (June 15-17)\n\n• Michael Brown - Legal Counsel\n  📧 michael.brown@mnaafrica.co.ke\n  💼 Specialization: Contract Law, Compliance\n  📊 Current Cases: 8 active\n  ✅ Status: Available\n\n👨‍💼 **Supporting Staff:**\n• Emily Davis - Paralegal\n  📧 emily.davis@mnaafrica.co.ke\n  💼 Focus: Research, Document Preparation\n  ✅ Status: Available\n\n• David Wilson - Junior Associate\n  📧 david.wilson@mnaafrica.co.ke\n  💼 Focus: Case Research, Client Support\n  ✅ Status: Available\n\n📞 **Emergency Contacts:**\n• Main Office: +254 (0) 20 123 4567\n• After Hours: +254 (0) 722 123 456\n\nNeed specific contact information or team schedules?';
    }
    
    // Enhanced client information
    if (lowerQuery.includes('client') || lowerQuery.includes('techcorp') || lowerQuery.includes('customer')) {
      return '👔 **Active Clients (4 companies):**\n\n🏢 **TechCorp Industries Ltd.**\n• Contact: James Mitchell, CEO\n• 📧 j.mitchell@techcorp.com\n• 📞 +254 (0) 20 456 7890\n• Active Matters: Partnership Agreement, IP Protection\n• Last Invoice: $15,000 (Paid)\n• Status: Contract pending approval\n\n💰 **Global Investments Ltd.**\n• Contact: Maria Santos, Legal Director\n• 📧 m.santos@globalinv.com\n• Active Matters: Regulatory Compliance, M&A\n• Outstanding Invoice: $8,500\n\n🏠 **Estate Planning Solutions**\n• Contact: Robert Kim, Managing Partner\n• Active Matters: Estate Planning, Trust Formation\n• Status: Retainer active\n\n🏭 **Manufacturing Co.**\n• Contact: Lisa Chen, General Counsel\n• Active Matters: Labor Disputes, Contract Review\n• Status: Ongoing consultation\n\n💡 **Quick Stats:**\n• Total Active Clients: 4\n• Monthly Revenue: $45,000\n• Outstanding Invoices: $12,500\n\nWould you like details about a specific client or billing information?';
    }
    
    // Calendar and scheduling
    if (lowerQuery.includes('calendar') || lowerQuery.includes('schedule') || lowerQuery.includes('meeting') || lowerQuery.includes('court')) {
      return '📅 **This Week\'s Schedule:**\n\n**Today (June 12, 2024):**\n• 9:00 AM - Team Meeting (Conference Room A)\n• 11:00 AM - Client Call - TechCorp Industries\n• 2:00 PM - Document Review - Johnson vs. Smith\n• 4:00 PM - Approval Meeting - Budget Items\n\n**Tomorrow (June 13, 2024):**\n• 10:00 AM - Court Hearing - Case #2024-001\n  📍 Courtroom 3A, Milimani Law Courts\n• 2:00 PM - Client Consultation - Estate Planning\n• 3:30 PM - Contract Review - TechCorp Partnership\n\n**Thursday (June 14, 2024):**\n• 9:00 AM - Deposition - Johnson vs. Smith\n• 1:00 PM - Lunch Meeting - New Client Prospect\n• 4:00 PM - Case Strategy Session\n\n⚠️ **Upcoming Deadlines:**\n• June 18: Court filing deadline\n• June 20: Client presentation\n• June 25: Discovery deadline\n\nWould you like me to schedule a meeting or show next week\'s calendar?';
    }
    
    // Invoice and billing information
    if (lowerQuery.includes('invoice') || lowerQuery.includes('billing') || lowerQuery.includes('payment') || lowerQuery.includes('money')) {
      return '💰 **Invoice & Billing Summary:**\n\n📊 **This Month (June 2024):**\n• Total Invoiced: $45,000\n• Paid Invoices: $32,500\n• Outstanding: $12,500\n• Pending Approval: $8,200\n\n📋 **Recent Invoices:**\n• INV-2024-056: TechCorp Industries - $15,000 ✅ Paid\n• INV-2024-057: Global Investments - $8,500 ⏳ Due June 15\n• INV-2024-058: Manufacturing Co. - $4,000 ⏳ Due June 20\n\n🔔 **Overdue Alerts:**\n• Estate Planning Solutions - $2,200 (5 days overdue)\n• Follow-up required\n\n💡 **Quick Actions:**\n• Send payment reminders\n• Generate new invoices\n• View payment history\n• Export financial reports\n\n📈 **Year-to-Date Performance:**\n• Total Revenue: $180,000\n• Collection Rate: 94%\n• Average Days to Payment: 18\n\nNeed help generating an invoice or checking payment status?';
    }
    
    // Help and capabilities
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do') || lowerQuery.includes('commands')) {
      return '🤖 **MNA Africa Assistant Capabilities:**\n\n📋 **Information I Can Provide:**\n• Team members & leave schedules\n• Pending approvals & priorities\n• Case files & court dates\n• Client information & contacts\n• Invoice tracking & billing\n• Calendar events & deadlines\n• Court schedules & hearings\n\n💬 **Sample Questions:**\n• "Who is on leave this week?"\n• "Show me pending approvals"\n• "Find the Johnson vs. Smith case"\n• "What\'s my schedule tomorrow?"\n• "Client contact for TechCorp"\n• "Outstanding invoices this month"\n• "Upcoming court dates"\n\n⚡ **Quick Commands:**\n• Type "team" for staff information\n• Type "approvals" for pending items\n• Type "calendar" for schedule\n• Type "clients" for client list\n• Type "invoices" for billing info\n\n🔍 **Advanced Features:**\n• Natural language search\n• Context-aware responses\n• Real-time data updates\n• Priority notifications\n\nTry asking me anything about your legal practice management!';
    }
    
    // Default enhanced response
    return '🤔 I\'m here to help with your MNA Africa legal practice! I can assist with:\n\n📋 **Quick Options:**\n• Team & Leave Status\n• Pending Approvals\n• Case Files & Court Dates\n• Client Information\n• Invoice & Billing\n• Calendar & Scheduling\n\n💡 **Try asking:**\n• "Who\'s available for meetings?"\n• "What needs approval?"\n• "Show me this week\'s calendar"\n• "Client contact information"\n• "Outstanding invoices"\n\nWhat specific information would you like to know?';
  };

  return (
    <>
      {/* Enhanced Floating Chat Button with animation */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-mna-primary hover:bg-mna-primary/90 shadow-2xl z-50 animate-bounce hover:animate-none transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageCircle size={28} className="animate-pulse" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-mna-accent rounded-full flex items-center justify-center text-xs font-bold text-mna-primary animate-ping">
            !
          </div>
        </Button>
      )}

      {/* Enhanced Chat Widget with animations */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 animate-scale-in border-2 border-mna-primary/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-mna-primary to-mna-primary/90 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-mna-accent rounded-full animate-pulse"></div>
              <CardTitle className="text-lg font-semibold">MNA Africa Assistant</CardTitle>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 w-8 p-0 transition-all duration-200 hover:rotate-90"
            >
              <X size={16} />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[500px]">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
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
                        "max-w-[85%] p-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg",
                        message.isUser
                          ? "bg-gradient-to-r from-mna-primary to-mna-primary/90 text-white rounded-br-md"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 rounded-bl-md border border-gray-200"
                      )}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      <span className={cn(
                        "text-xs opacity-70 mt-2 block",
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
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-2xl rounded-bl-md border border-gray-200 flex items-center space-x-2">
                      <Loader2 size={16} className="animate-spin text-mna-primary" />
                      <span className="text-sm text-gray-600">MNA Assistant is typing...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Enhanced input area */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about team, approvals, cases, or schedule..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mna-primary focus:border-transparent transition-all duration-200 hover:border-mna-primary/50"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-mna-primary to-mna-primary/90 hover:from-mna-primary/90 hover:to-mna-primary px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </Button>
              </div>
              
              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['Team Status', 'Approvals', 'Calendar', 'Clients'].map((action) => (
                  <button
                    key={action}
                    onClick={() => setInputValue(action.toLowerCase())}
                    className="px-3 py-1 text-xs bg-mna-primary/10 text-mna-primary rounded-full hover:bg-mna-primary hover:text-white transition-all duration-200 hover:scale-105"
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
