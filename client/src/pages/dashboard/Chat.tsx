import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Search,
	Send,
	Smile,
	Paperclip,
	MoreVertical,
	Phone,
	Video,
	Image as ImageIcon,
	ChevronLeft,
	Check,
	CheckCheck,
} from 'lucide-react';

interface Message {
	id: string;
	content: string;
	sender: 'me' | 'other';
	timestamp: string;
	status: 'sent' | 'delivered' | 'read';
}

interface ChatContact {
	id: string;
	name: string;
	avatar: string;
	lastMessage: string;
	timestamp: string;
	unreadCount: number;
	online: boolean;
}

const contacts: ChatContact[] = [
	{
		id: '1',
		name: 'Sarah Chen',
		avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen',
		lastMessage: 'Looking forward to our React session!',
		timestamp: '10:30 AM',
		unreadCount: 2,
		online: true,
	},
	{
		id: '2',
		name: 'Mike Johnson',
		avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson',
		lastMessage: 'Can we reschedule to tomorrow?',
		timestamp: 'Yesterday',
		unreadCount: 0,
		online: false,
	},
	// Add more contacts as needed
];

const messages: Message[] = [
	{
		id: '1',
		content: 'Hi! I saw your profile and I\'m interested in learning React from you.',
		sender: 'other',
		timestamp: '10:30 AM',
		status: 'read',
	},
	{
		id: '2',
		content: 'I\'d be happy to help! What specific areas would you like to focus on?',
		sender: 'me',
		timestamp: '10:31 AM',
		status: 'read',
	},
	{
		id: '3',
		content: 'I\'m particularly interested in hooks and state management.',
		sender: 'other',
		timestamp: '10:32 AM',
		status: 'read',
	},
	// Add more messages as needed
];

const ChatMessage = ({ message }: { message: Message }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}
		>
			<div
				className={`max-w-[70%] rounded-lg p-3 ${message.sender === 'me'
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
	selectedContact: ChatContact | null;
	onSelectContact: (contact: ChatContact) => void;
}) => {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredContacts = contacts.filter((contact) =>
		contact.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="w-80 border-r h-full flex flex-col">
			<div className="p-4 border-b">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search chats..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto">
				<AnimatePresence>
					{filteredContacts.map((contact) => (
						<motion.div
							key={contact.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => onSelectContact(contact)}
							className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedContact?.id === contact.id ? 'bg-muted' : ''
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
										<span className="text-xs text-muted-foreground">
											{contact.timestamp}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<p className="text-sm text-muted-foreground truncate">
											{contact.lastMessage}
										</p>
										{contact.unreadCount > 0 && (
											<div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
												{contact.unreadCount}
											</div>
										)}
									</div>
								</div>
							</div>
						</motion.div>
					))}
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

const ChatInput = () => {
	const [message, setMessage] = useState('');

	return (
		<div className="p-4 border-t">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon">
					<Smile className="h-5 w-5" />
				</Button>
				<Button variant="ghost" size="icon">
					<Paperclip className="h-5 w-5" />
				</Button>
				<Input
					placeholder="Type a message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="flex-1"
				/>
				<Button size="icon">
					<Send className="h-5 w-5" />
				</Button>
			</div>
		</div>
	);
};

const Chat = () => {
	const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);

	return (
		<div className="h-[calc(100vh-4rem)] flex">
			<ContactList
				selectedContact={selectedContact}
				onSelectContact={setSelectedContact}
			/>
			{selectedContact ? (
				<div className="flex-1 flex flex-col">
					<ChatHeader contact={selectedContact} />
					<div className="flex-1 overflow-y-auto p-4">
						<AnimatePresence>
							{messages.map((message) => (
								<ChatMessage key={message.id} message={message} />
							))}
						</AnimatePresence>
					</div>
					<ChatInput />
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