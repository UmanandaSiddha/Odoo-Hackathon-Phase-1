import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search, Send, Smile, Paperclip, MoreVertical, Phone, Video,
    ChevronLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchConversations, fetchMessages, sendMessage, clearCurrentMessages } from '@/store/slice/chat.slice';
import { Conversation as ConversationType, Chat as MessageType, User } from '@/types/types';

const ChatMessage = ({ message }: { message: MessageType }) => {
    const currentUser = useAppSelector((state) => state.auth.user);
    const isMe = message.senderId === currentUser?.id;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message.message}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {/* {isMe && message.status && (
                        <div className="flex items-center">
                            {message.status === 'sent' && <Check className="w-3 h-3" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                            {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                    )} */}
                </div>
            </div>
        </motion.div>
    );
};

const ContactList = ({ selectedConversation, onSelectConversation }: { selectedConversation: ConversationType | null; onSelectConversation: (conversation: ConversationType) => void; }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useAppDispatch();
    const { conversations } = useAppSelector((state) => state.chat);
    const currentUser = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const filteredConversations = conversations.filter(convo => {
        const recipient = convo.participants.find(p => p.id !== currentUser?.id);
        return recipient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || recipient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="w-80 border-r h-full flex flex-col">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                    {filteredConversations.map((convo) => {
                        const recipient = convo.participants.find(p => p.id !== currentUser?.id);
                        if (!recipient) return null;
                        
                        return (
                            <motion.div
                                key={convo.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => onSelectConversation(convo)}
                                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation?.id === convo.id ? 'bg-muted' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={recipient.profilePicture || `https://ui-avatars.com/api/?name=${recipient.firstName}+${recipient.lastName}`} alt={recipient.firstName} className="w-12 h-12 rounded-full" />
                                        {recipient.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">{recipient.firstName} {recipient.lastName}</h3>
                                            <span className="text-xs text-muted-foreground">{new Date(convo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground truncate">{convo.chats[0]?.message}</p>
                                            {/* {convo.unreadCount > 0 && <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">{convo.unreadCount}</div>} */}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ChatHeader = ({ recipient }: { recipient: Partial<User> }) => (
    <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden"><ChevronLeft className="h-5 w-5" /></Button>
            <img src={recipient.profilePicture || `https://ui-avatars.com/api/?name=${recipient.firstName}+${recipient.lastName}`} alt={recipient.firstName} className="w-10 h-10 rounded-full" />
            <div>
                <h2 className="font-medium">{recipient.firstName} {recipient.lastName}</h2>
                {recipient.isOnline && <p className="text-xs text-muted-foreground">online</p>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
        </div>
    </div>
);

const ChatInput = ({ recipientId }: { recipientId: string }) => {
    const [message, setMessage] = useState('');
    const dispatch = useAppDispatch();

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !recipientId) return;
        dispatch(sendMessage({ recipientId, message }));
        setMessage('');
    };

    return (
        <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" type="button"><Smile className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" type="button"><Paperclip className="h-5 w-5" /></Button>
                <Input placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
                <Button size="icon" type="submit"><Send className="h-5 w-5" /></Button>
            </div>
        </form>
    );
};

const Chat = () => {
    const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
    const dispatch = useAppDispatch();
    const { currentMessages, loading } = useAppSelector((state) => state.chat);
    const currentUser = useAppSelector((state) => state.auth.user);

    const handleSelectConversation = (conversation: ConversationType) => {
        setSelectedConversation(conversation);
        dispatch(fetchMessages(conversation.id));
    };
    
    useEffect(() => {
        return () => {
            dispatch(clearCurrentMessages());
        }
    }, [dispatch]);

    const recipient = selectedConversation?.participants.find(p => p.id !== currentUser?.id);

    return (
        <div className="h-[calc(100vh-4rem)] flex">
            <ContactList selectedConversation={selectedConversation} onSelectConversation={handleSelectConversation} />
            {selectedConversation && recipient ? (
                <div className="flex-1 flex flex-col">
                    <ChatHeader recipient={recipient} />
                    <div className="flex-1 overflow-y-auto p-4">
                        <AnimatePresence>
                            {loading && <div>Loading...</div>}
                            {currentMessages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                        </AnimatePresence>
                    </div>
                    <ChatInput recipientId={recipient.id!} />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
                        <p className="text-muted-foreground">Select a contact to start chatting</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;