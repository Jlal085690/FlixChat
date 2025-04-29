import { 
  User, InsertUser, 
  Chat, InsertChat, 
  ChatParticipant, InsertChatParticipant,
  Message, InsertMessage,
  Story, InsertStory,
  StoryView, InsertStoryView,
  Call, InsertCall,
  UserStatus,
  UserRole
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Modify the interface with CRUD methods needed
export interface IStorage {
  // Session store for auth
  sessionStore: any;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  updateUserStatus(id: number, status: UserStatus): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Chat operations
  getChat(id: number): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  getUserChats(userId: number): Promise<Chat[]>;
  
  // Chat participants operations
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  getChatParticipants(chatId: number): Promise<ChatParticipant[]>;
  removeChatParticipant(chatId: number, userId: number): Promise<boolean>;
  updateChatParticipantRole(chatId: number, userId: number, role: UserRole): Promise<ChatParticipant | undefined>;
  isChatParticipant(chatId: number, userId: number): Promise<boolean>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getChatMessages(chatId: number, limit?: number, offset?: number): Promise<Message[]>;
  markMessageAsDeleted(id: number): Promise<boolean>;
  
  // Story operations
  getStory(id: number): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  getUserStories(userId: number): Promise<Story[]>;
  getRecentStories(): Promise<Story[]>;
  
  // Story views operations
  addStoryView(storyView: InsertStoryView): Promise<StoryView>;
  getStoryViews(storyId: number): Promise<StoryView[]>;
  
  // Call operations
  getCall(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCallEndTime(id: number, endTime: Date): Promise<Call | undefined>;
  updateCallStatus(id: number, status: string): Promise<Call | undefined>;
  getUserCalls(userId: number): Promise<Call[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private chatParticipants: Map<number, ChatParticipant>;
  private messages: Map<number, Message>;
  private stories: Map<number, Story>;
  private storyViews: Map<number, StoryView>;
  private calls: Map<number, Call>;
  
  public sessionStore: any;
  
  private userIdCounter: number;
  private chatIdCounter: number;
  private chatParticipantIdCounter: number;
  private messageIdCounter: number;
  private storyIdCounter: number;
  private storyViewIdCounter: number;
  private callIdCounter: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.chatParticipants = new Map();
    this.messages = new Map();
    this.stories = new Map();
    this.storyViews = new Map();
    this.calls = new Map();
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.userIdCounter = 1;
    this.chatIdCounter = 1;
    this.chatParticipantIdCounter = 1;
    this.messageIdCounter = 1;
    this.storyIdCounter = 1;
    this.storyViewIdCounter = 1;
    this.callIdCounter = 1;
    
    // Create admin user
    this.createUser({
      username: "جلال",
      password: "vbnm085690vbnm",
      fullName: "جلال المطور",
      role: UserRole.ADMIN,
      isGuest: false
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    // تعبئة الحقول بالقيم الافتراضية إذا لم تكن موجودة
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      role: user.role || UserRole.USER,
      status: user.status || UserStatus.ONLINE,
      isGuest: user.isGuest !== undefined ? user.isGuest : false,
      bio: user.bio || null,
      avatarUrl: user.avatarUrl || null,
      coverUrl: user.coverUrl || null
    };
    
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStatus(id: number, status: UserStatus): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, status };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Chat operations
  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const id = this.chatIdCounter++;
    const newChat: Chat = { 
      id,
      type: chat.type,
      name: chat.name || null,
      avatarUrl: chat.avatarUrl || null,
      createdBy: chat.createdBy,
      createdAt: new Date() 
    };
    this.chats.set(id, newChat);
    return newChat;
  }

  async getUserChats(userId: number): Promise<Chat[]> {
    // Get all chats where user is a participant
    const userChatParticipations = Array.from(this.chatParticipants.values())
      .filter(participant => participant.userId === userId)
      .map(participant => participant.chatId);
    
    // Get the actual chat objects
    return Array.from(this.chats.values())
      .filter(chat => userChatParticipations.includes(chat.id));
  }

  // Chat participants operations
  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const id = this.chatParticipantIdCounter++;
    const newParticipant: ChatParticipant = { 
      id,
      chatId: participant.chatId,
      userId: participant.userId,
      role: participant.role || UserRole.USER,
      joinedAt: new Date() 
    };
    this.chatParticipants.set(id, newParticipant);
    return newParticipant;
  }

  async getChatParticipants(chatId: number): Promise<ChatParticipant[]> {
    return Array.from(this.chatParticipants.values())
      .filter(participant => participant.chatId === chatId);
  }

  async removeChatParticipant(chatId: number, userId: number): Promise<boolean> {
    const participant = Array.from(this.chatParticipants.values())
      .find(p => p.chatId === chatId && p.userId === userId);
    
    if (!participant) return false;
    
    this.chatParticipants.delete(participant.id);
    return true;
  }

  async updateChatParticipantRole(chatId: number, userId: number, role: UserRole): Promise<ChatParticipant | undefined> {
    const participant = Array.from(this.chatParticipants.values())
      .find(p => p.chatId === chatId && p.userId === userId);
    
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, role };
    this.chatParticipants.set(participant.id, updatedParticipant);
    return updatedParticipant;
  }

  async isChatParticipant(chatId: number, userId: number): Promise<boolean> {
    return Array.from(this.chatParticipants.values())
      .some(p => p.chatId === chatId && p.userId === userId);
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = { 
      id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      attachmentUrl: message.attachmentUrl || null,
      createdAt: new Date(),
      isDeleted: false
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getChatMessages(chatId: number, limit = 50, offset = 0): Promise<Message[]> {
    const messages = Array.from(this.messages.values())
      .filter(msg => msg.chatId === chatId && !msg.isDeleted)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return messages.slice(offset, offset + limit);
  }

  async markMessageAsDeleted(id: number): Promise<boolean> {
    const message = await this.getMessage(id);
    if (!message) return false;
    
    const updatedMessage = { ...message, isDeleted: true };
    this.messages.set(id, updatedMessage);
    return true;
  }

  // Story operations
  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async createStory(story: InsertStory): Promise<Story> {
    const id = this.storyIdCounter++;
    const newStory: Story = { 
      id, 
      userId: story.userId,
      content: story.content || null,
      mediaUrl: story.mediaUrl || null,
      expiresAt: story.expiresAt,
      createdAt: new Date()
    };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getUserStories(userId: number): Promise<Story[]> {
    // Get stories that are not expired
    const now = new Date();
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId && story.expiresAt > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentStories(): Promise<Story[]> {
    // Get all non-expired stories
    const now = new Date();
    return Array.from(this.stories.values())
      .filter(story => story.expiresAt > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Story views operations
  async addStoryView(storyView: InsertStoryView): Promise<StoryView> {
    const id = this.storyViewIdCounter++;
    const newStoryView: StoryView = { 
      ...storyView, 
      id, 
      viewedAt: new Date() 
    };
    this.storyViews.set(id, newStoryView);
    return newStoryView;
  }

  async getStoryViews(storyId: number): Promise<StoryView[]> {
    return Array.from(this.storyViews.values())
      .filter(view => view.storyId === storyId)
      .sort((a, b) => a.viewedAt.getTime() - b.viewedAt.getTime());
  }

  // Call operations
  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async createCall(call: InsertCall): Promise<Call> {
    const id = this.callIdCounter++;
    const newCall: Call = { 
      id,
      type: call.type,
      status: call.status,
      callerId: call.callerId,
      receiverId: call.receiverId,
      chatId: call.chatId || null,
      startTime: call.startTime || new Date(),
      endTime: null
    };
    this.calls.set(id, newCall);
    return newCall;
  }

  async updateCallEndTime(id: number, endTime: Date): Promise<Call | undefined> {
    const call = await this.getCall(id);
    if (!call) return undefined;
    
    const updatedCall = { ...call, endTime };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }

  async updateCallStatus(id: number, status: string): Promise<Call | undefined> {
    const call = await this.getCall(id);
    if (!call) return undefined;
    
    const updatedCall = { ...call, status };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }

  async getUserCalls(userId: number): Promise<Call[]> {
    return Array.from(this.calls.values())
      .filter(call => call.callerId === userId || call.receiverId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
}

export const storage = new MemStorage();
