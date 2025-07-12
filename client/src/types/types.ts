export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum SwapRequestStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
}

// =================================================================
// MODELS
// =================================================================

export interface Address {
    id: string;
    address: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    User?: User[];
}

export interface Session {
    id: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string; // ISO Date String
    user: User;
    userId: string;
}

export interface InvalidatedToken {
    id: string;
    refreshToken: string;
    userId: string;
    user: User;
    invalidatedAt: string; // ISO Date String
}

export interface Notification {
    id: string;
    userId: string;
    user: User;
    isRead: boolean;
    content: string;
    metadata: any; // JSON fields are best typed as `any` or a specific interface
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    userId: string;
    userOffered?: User;
    userWanted?: User;
}

export interface SwapRequest {
    id: string;
    senderId: string;
    receiverId: string;
    skillOffered: string;
    skillWanted: string;
    status: SwapRequestStatus;
    sender: User;
    receiver: User;
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface Feedback {
    id: string;
    reviewerId: string;
    revieweeId: string;
    comment?: string | null;
    rating: number; // 1 to 5
    reviewer: User;
    reviewee: User;
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface Availability {
    id: string;
    userId: string;
    day: string;
    timeSlot: string;
    user: User;
}

export interface Conversation {
    id: string;
    chats: Chat[];
    participants: User[];
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface Chat {
    id: string;
    message: string;
    senderId: string;
    receiverId: string;
    conversationId: string;
    conversation: Conversation;
    sender: User;
    receiver: User;
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface AdminMessage {
    id: string;
    title: string;
    body: string;
    sentAt: string; // ISO Date String
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password?: string; // Often omitted from frontend types
    role: UserRole;
    isVerified: boolean;
    isPublic: boolean;
    isOnline: boolean;
    isBanned: boolean;
    rating: number; // Prisma's Decimal is often handled as a number on the frontend
    location?: Address | null;
    profilePicture?: string | null;
    sessions?: Session[];
    notification?: Notification[];
    conversations?: Conversation[];
    chats?: Chat[];
    recievedChats?: Chat[];
    skillsOffered?: Skill[];
    skillsWanted?: Skill[];
    sentRequests?: SwapRequest[];
    recievedRequests?: SwapRequest[];
    feedbackGiven?: Feedback[];
    feedbackRecieved?: Feedback[];
    availability?: Availability[];
    invalidatedTokens?: InvalidatedToken[];
    lastLogin?: string | null; // ISO Date String
    oneTimePassword?: string | null;
    oneTimeExpire?: string | null; // ISO Date String
    resetToken?: string | null;
    resetTokenExpire?: string | null; // ISO Date String
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
    addressId?: string | null;
}