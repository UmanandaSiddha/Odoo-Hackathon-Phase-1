import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  getConversations,
  getMessagesForConversation,
  sendMessage,
  updateMessageStatus,
  searchContacts,
  type ChatContact,
  type ChatMessage,
  type Conversation,
} from '@/services/api';
import { chatSocket } from '@/services/socket';

const ChatMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          message.sender === 'me'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">{message.timestamp}</span>
          {message.sender === 'me' && (
            <div className="flex items-center">
              {message.status === 'sent' && <Check className="w-3 h-3" />}
              {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'read' && (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ContactList = ({
  selectedContact,
  onSelectContact,
}: {
  selectedContact: Conversation | null;
  onSelectContact: (contact: Conversation) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchResults, setSearchResults] = useState<ChatContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = window.setTimeout(async () => {
        try {
          const results = await searchContacts(searchQuery);
          setSearchResults(results);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to search contacts',
            variant: 'destructive',
          });
        }
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, toast]);

  const displayItems = searchQuery ? searchResults : conversations;

  return (
    <div className="w-80 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : displayItems.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? 'No contacts found' : 'No conversations yet'}
            </div>
          ) : (
            displayItems.map((item) => {
              const contact = 'contact' in item ? item.contact : item;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    if ('contact' in item) {
                      onSelectContact(item);
                    } else {
                      // Create a new conversation object for search results
                      onSelectContact({
                        id: '',
                        contact: item,
                        lastMessage: '',
                        timestamp: '',
                        unreadCount: 0,
                        totalMessages: 0,
                      });
                    }
                  }}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedContact?.contact.id === contact.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{contact.name}</h3>
                        {'timestamp' in item && (
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp}
                          </span>
                        )}
                      </div>
                      {'lastMessage' in item && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {item.lastMessage}
                          </p>
                          {item.unreadCount > 0 && (
                            <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {item.unreadCount}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ChatHeader = ({ contact }: { contact: ChatContact }) => (
  <div className="p-4 border-b flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="md:hidden">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
      <div>
        <h2 className="font-medium">{contact.name}</h2>
        {contact.online && (
          <p className="text-xs text-muted-foreground">online</p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon">
        <Phone className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon">
        <Video className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  </div>
);

const ChatInput = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon">
          <Smile className="h-5 w-5" />
        </Button>
        <Button type="button" variant="ghost" size="icon">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMessages = useCallback(async (conversationId: string, page: number) => {
    try {
      setIsLoadingMessages(true);
      const data = await getMessagesForConversation(conversationId, page);
      if (page === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...prev, ...data.messages]);
      }
      setHasMore(data.currentPage < data.totalPages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedConversation?.id) {
      setPage(1);
      loadMessages(selectedConversation.id, 1);
    } else {
      setMessages([]);
      setHasMore(true);
    }
  }, [selectedConversation?.id, loadMessages]);

  useEffect(() => {
    if (user?.id) {
      chatSocket.connect(user.id);
      
      const messageHandler = (message: ChatMessage) => {
        setMessages(prev => [message, ...prev]);
        if (message.sender === 'other') {
          updateMessageStatus(message.id, 'delivered');
        }
      };

      const statusHandler = (data: { messageId: string; status: string }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.messageId
              ? { ...msg, status: data.status as 'sent' | 'delivered' | 'read' }
              : msg
          )
        );
      };

      const unsubscribeMessage = chatSocket.onMessage(messageHandler);
      const unsubscribeStatus = chatSocket.onStatusUpdate(statusHandler);

      return () => {
        unsubscribeMessage();
        unsubscribeStatus();
        chatSocket.disconnect();
      };
    }
  }, [user?.id]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation?.contact.id) return;

    try {
      const message = await sendMessage(selectedConversation.contact.id, content);
      setMessages(prev => [message, ...prev]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isLoadingMessages && selectedConversation?.id) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(selectedConversation.id, nextPage);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <ContactList
        selectedContact={selectedConversation}
        onSelectContact={setSelectedConversation}
      />
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          <ChatHeader contact={selectedConversation.contact} />
          <div
            className="flex-1 overflow-y-auto p-4"
            onScroll={handleScroll}
          >
            {isLoadingMessages && (
              <div className="text-center py-4">
                <span className="text-muted-foreground">Loading messages...</span>
              </div>
            )}
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
            <p className="text-muted-foreground">
              Select a contact to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 