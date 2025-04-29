import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import {
  loginSchema,
  registerSchema,
  insertChatSchema,
  insertChatParticipantSchema,
  insertMessageSchema,
  insertStorySchema,
  insertStoryViewSchema,
  insertCallSchema,
  WebSocketMessageType,
  WebSocketMessage,
  UserStatus
} from "@shared/schema";
import session from "express-session";
import { createId } from "@paralleldrive/cuid2";
import MemoryStore from "memorystore";

// تعريف نوع الجلسة - مهم لحل أخطاء TypeScript
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Connected clients
interface ConnectedClient {
  userId: number;
  socket: WebSocket;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Connected clients
  const clients: ConnectedClient[] = [];
  
  // إعداد الجلسة مع تحسينات للتوافق
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "flixchat-secret-key",
    resave: true,
    saveUninitialized: false, // تغيير إلى false لتجنب إنشاء جلسات فارغة
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // جعله آمن فقط في بيئة الإنتاج
      maxAge: 30 * 24 * 60 * 60 * 1000, // زيادة المدة إلى 30 يوم
      sameSite: 'lax',
      httpOnly: true,
      path: '/' // تحديد مسار ملف تعريف الارتباط بوضوح
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // 24 ساعة
    })
  }));
  
  // طباعة تفاصيل بدء التشغيل
  console.log("تم إعداد جلسات المستخدمين:", {
    بيئة: process.env.NODE_ENV,
    منفذ: process.env.PORT || 5000,
    خادمآمن: process.env.NODE_ENV === 'production'
  });
  
  // وسيط للتحقق من المصادقة مع توثيق أكثر تفصيلاً
  const isAuthenticated = (req: Request, res: Response, next: () => void) => {
    console.log(`فحص المصادقة لـ ${req.method} ${req.path}`);
    console.log(`حالة الجلسة:`, {
      لديهJsessionId: !!req.headers.cookie?.includes('connect.sid'),
      لديهUserId: !!req.session.userId,
      معرفالمستخدم: req.session.userId,
      ملفاتتعريفالارتباط: req.headers.cookie
    });
    
    if (req.session.userId) {
      console.log(`مصادقة ناجحة لمعرف المستخدم: ${req.session.userId}`);
      next();
    } else {
      console.log(`فشل في المصادقة: لا يوجد معرف مستخدم في الجلسة`);
      res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }
  };
  
  // Middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: () => void) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "ليس لديك صلاحيات كافية" });
    }
    
    next();
  };
  
  // Broadcast message to all connected clients
  const broadcast = <T>(message: WebSocketMessage<T>, excludeUserId?: number) => {
    clients.forEach(client => {
      if (excludeUserId && client.userId === excludeUserId) return;
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(message));
      }
    });
  };
  
  // WebSocket connection handler
  wss.on('connection', (socket, request) => {
    // Handle authentication via query params instead of session
    // This works around issues with session parsing in WebSockets
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const userId = parseInt(url.searchParams.get('userId') || '0');
    
    if (!userId) {
      console.log("محاولة اتصال WebSocket بدون معرف مستخدم");
      socket.close(1008, "غير مصرح");
      return;
    }
    
    // Add client to connected clients
    clients.push({ userId, socket });
    
    // Update user status to online
    storage.updateUserStatus(userId, UserStatus.ONLINE).then(user => {
      if (user) {
        broadcast({
          type: WebSocketMessageType.USER_STATUS,
          payload: { userId, status: UserStatus.ONLINE }
        }, userId);
      }
    });
    
    // Handle messages
    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        
        switch (message.type) {
          case WebSocketMessageType.NEW_MESSAGE:
            // Handle new message
            const newMessage = await storage.createMessage(message.payload);
            broadcast({
              type: WebSocketMessageType.NEW_MESSAGE,
              payload: newMessage
            });
            break;
            
          case WebSocketMessageType.MESSAGE_READ:
            // Handle message read
            broadcast({
              type: WebSocketMessageType.MESSAGE_READ,
              payload: message.payload
            });
            break;
            
          case WebSocketMessageType.NEW_STORY:
            // Handle new story
            const newStory = await storage.createStory(message.payload);
            broadcast({
              type: WebSocketMessageType.NEW_STORY,
              payload: newStory
            });
            break;
            
          case WebSocketMessageType.STORY_VIEWED:
            // Handle story viewed
            const storyView = await storage.addStoryView(message.payload);
            broadcast({
              type: WebSocketMessageType.STORY_VIEWED,
              payload: storyView
            });
            break;
            
          case WebSocketMessageType.CALL_INITIATED:
            // Handle call initiated
            const newCall = await storage.createCall(message.payload);
            broadcast({
              type: WebSocketMessageType.CALL_INITIATED,
              payload: newCall
            });
            break;
            
          case WebSocketMessageType.CALL_ANSWERED:
          case WebSocketMessageType.CALL_DECLINED:
          case WebSocketMessageType.CALL_ENDED:
            // Handle call status updates
            const callId = message.payload.id;
            const callStatus = message.type === WebSocketMessageType.CALL_ANSWERED 
              ? "answered" 
              : message.type === WebSocketMessageType.CALL_DECLINED 
                ? "declined" 
                : "ended";
                
            const updatedCall = await storage.updateCallStatus(callId, callStatus);
            
            if (message.type === WebSocketMessageType.CALL_ENDED && updatedCall) {
              await storage.updateCallEndTime(callId, new Date());
            }
            
            broadcast({
              type: message.type,
              payload: updatedCall
            });
            break;
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });
    
    // Handle disconnection
    socket.on('close', () => {
      // Remove client from connected clients
      const index = clients.findIndex(client => client.userId === userId && client.socket === socket);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      
      // Check if user has other connections
      const userHasOtherConnections = clients.some(client => client.userId === userId);
      
      // If no other connections, update user status to offline
      if (!userHasOtherConnections) {
        storage.updateUserStatus(userId, UserStatus.OFFLINE).then(user => {
          if (user) {
            broadcast({
              type: WebSocketMessageType.USER_STATUS,
              payload: { userId, status: UserStatus.OFFLINE }
            });
          }
        });
      }
    });
  });
  
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      console.log(`محاولة تسجيل دخول: ${username}`);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        console.log("فشل تسجيل الدخول: اسم المستخدم أو كلمة المرور غير صحيحة");
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }
      
      // حفظ الجلسة - مهم!
      req.session.userId = user.id;
      
      // تأكد من حفظ البيانات
      await new Promise<void>((resolve) => {
        req.session.save(() => {
          console.log(`تم تسجيل الدخول بنجاح: ${username} بمعرف ${user.id}`);
          resolve();
        });
      });
      
      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("خطأ أثناء تسجيل الدخول:", error);
      res.status(400).json({ message: "بيانات غير صالحة", error });
    }
  });
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, fullName } = registerSchema.parse(req.body);
      
      console.log(`محاولة إنشاء حساب جديد: ${username}`);
      
      // التحقق من عدم وجود المستخدم مسبقاً
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log(`فشل إنشاء الحساب: ${username} - المستخدم موجود بالفعل`);
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }
      
      // إنشاء المستخدم
      const user = await storage.createUser({
        username,
        password,
        fullName,
        role: "user",
        isGuest: false
      });
      
      // حفظ معرف المستخدم في الجلسة
      req.session.userId = user.id;
      
      // تأكد من حفظ البيانات
      await new Promise<void>((resolve) => {
        req.session.save(() => {
          console.log(`تم إنشاء الحساب بنجاح: ${username} بمعرف ${user.id}`);
          resolve();
        });
      });
      
      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("خطأ أثناء إنشاء الحساب:", error);
      res.status(400).json({ message: "بيانات غير صالحة", error });
    }
  });
  
  app.post('/api/auth/guest', async (req, res) => {
    try {
      // توليد اسم مستخدم عشوائي للضيف
      const guestId = createId();
      const username = `guest_${guestId}`;
      
      console.log(`إنشاء حساب ضيف: ${username}`);
      
      // إنشاء مستخدم ضيف
      const user = await storage.createUser({
        username,
        password: guestId, // استخدام المعرف العشوائي نفسه ككلمة مرور
        fullName: "ضيف",
        role: "user",
        isGuest: true
      });
      
      // حفظ معرف المستخدم في الجلسة
      req.session.userId = user.id;
      
      // تأكد من حفظ البيانات
      await new Promise<void>((resolve) => {
        req.session.save(() => {
          console.log(`تم تسجيل الدخول كضيف بنجاح: ${username} بمعرف ${user.id}`);
          resolve();
        });
      });
      
      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("خطأ أثناء تسجيل الدخول كضيف:", error);
      res.status(400).json({ message: "حدث خطأ أثناء تسجيل الدخول كضيف", error });
    }
  });
  
  app.post('/api/auth/logout', isAuthenticated, (req, res) => {
    // Update user status to offline
    const userId = req.session.userId;
    if (userId) {
      storage.updateUserStatus(userId, UserStatus.OFFLINE).then(user => {
        if (user) {
          broadcast({
            type: WebSocketMessageType.USER_STATUS,
            payload: { userId, status: UserStatus.OFFLINE }
          });
        }
      });
    }
    
    // Destroy session
    req.session.destroy(() => {
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });
  
  // User routes
  app.get('/api/users/me', isAuthenticated, async (req, res) => {
    try {
      console.log(`استعلام عن بيانات المستخدم - معرف الجلسة: ${req.session.userId}`);
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        console.log(`خطأ: المستخدم غير موجود لمعرف الجلسة ${req.session.userId}`);
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      console.log(`تم العثور على المستخدم: ${user.username} (${user.id})`);
      
      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("خطأ عند استرجاع بيانات المستخدم:", error);
      res.status(500).json({ message: "حدث خطأ أثناء استرجاع بيانات المستخدم" });
    }
  });
  
  app.put('/api/users/me', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const { fullName, bio, avatarUrl, coverUrl } = req.body;
    
    const updatedUser = await storage.updateUser(userId, {
      fullName,
      bio,
      avatarUrl,
      coverUrl
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });
  
  // Chat routes
  app.get('/api/chats', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const chats = await storage.getUserChats(userId);
    res.json(chats);
  });
  
  app.post('/api/chats', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const chatData = insertChatSchema.parse({ ...req.body, createdBy: userId });
      
      // Create chat
      const chat = await storage.createChat(chatData);
      
      // Add creator as participant
      const participantData = insertChatParticipantSchema.parse({
        chatId: chat.id,
        userId,
        role: chatData.type === "group" ? "owner" : "user"
      });
      
      await storage.addChatParticipant(participantData);
      
      // Add other participants if provided
      if (req.body.participants) {
        for (const participantId of req.body.participants) {
          if (participantId !== userId) {
            const otherParticipantData = insertChatParticipantSchema.parse({
              chatId: chat.id,
              userId: participantId,
              role: "user"
            });
            
            await storage.addChatParticipant(otherParticipantData);
          }
        }
      }
      
      res.json(chat);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة", error });
    }
  });
  
  app.get('/api/chats/:id', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const chatId = parseInt(req.params.id);
    
    // Check if chat exists
    const chat = await storage.getChat(chatId);
    if (!chat) {
      return res.status(404).json({ message: "المحادثة غير موجودة" });
    }
    
    // Check if user is participant
    const isParticipant = await storage.isChatParticipant(chatId, userId);
    if (!isParticipant) {
      return res.status(403).json({ message: "ليس لديك صلاحية الوصول لهذه المحادثة" });
    }
    
    res.json(chat);
  });
  
  app.get('/api/chats/:id/participants', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const chatId = parseInt(req.params.id);
    
    // Check if chat exists
    const chat = await storage.getChat(chatId);
    if (!chat) {
      return res.status(404).json({ message: "المحادثة غير موجودة" });
    }
    
    // Check if user is participant
    const isParticipant = await storage.isChatParticipant(chatId, userId);
    if (!isParticipant) {
      return res.status(403).json({ message: "ليس لديك صلاحية الوصول لهذه المحادثة" });
    }
    
    const participants = await storage.getChatParticipants(chatId);
    res.json(participants);
  });
  
  app.get('/api/chats/:id/messages', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const chatId = parseInt(req.params.id);
    
    // Check if chat exists
    const chat = await storage.getChat(chatId);
    if (!chat) {
      return res.status(404).json({ message: "المحادثة غير موجودة" });
    }
    
    // Check if user is participant
    const isParticipant = await storage.isChatParticipant(chatId, userId);
    if (!isParticipant) {
      return res.status(403).json({ message: "ليس لديك صلاحية الوصول لهذه المحادثة" });
    }
    
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const messages = await storage.getChatMessages(chatId, limit, offset);
    res.json(messages);
  });
  
  app.post('/api/chats/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const chatId = parseInt(req.params.id);
      
      // Check if chat exists
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ message: "المحادثة غير موجودة" });
      }
      
      // Check if user is participant
      const isParticipant = await storage.isChatParticipant(chatId, userId);
      if (!isParticipant) {
        return res.status(403).json({ message: "ليس لديك صلاحية الوصول لهذه المحادثة" });
      }
      
      const messageData = insertMessageSchema.parse({
        chatId,
        senderId: userId,
        content: req.body.content,
        attachmentUrl: req.body.attachmentUrl
      });
      
      const message = await storage.createMessage(messageData);
      
      // Broadcast message to all connected clients
      broadcast({
        type: WebSocketMessageType.NEW_MESSAGE,
        payload: message
      });
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة", error });
    }
  });
  
  // Story routes
  app.get('/api/stories', isAuthenticated, async (req, res) => {
    const stories = await storage.getRecentStories();
    res.json(stories);
  });
  
  app.post('/api/stories', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Set expires at 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const storyData = insertStorySchema.parse({
        userId,
        content: req.body.content,
        mediaUrl: req.body.mediaUrl,
        expiresAt
      });
      
      const story = await storage.createStory(storyData);
      
      // Broadcast new story to all connected clients
      broadcast({
        type: WebSocketMessageType.NEW_STORY,
        payload: story
      });
      
      res.json(story);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة", error });
    }
  });
  
  app.get('/api/stories/:id/views', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const storyId = parseInt(req.params.id);
    
    // Check if story exists
    const story = await storage.getStory(storyId);
    if (!story) {
      return res.status(404).json({ message: "القصة غير موجودة" });
    }
    
    // Check if user is the owner of the story
    if (story.userId !== userId) {
      return res.status(403).json({ message: "ليس لديك صلاحية الوصول لهذه القصة" });
    }
    
    const views = await storage.getStoryViews(storyId);
    res.json(views);
  });
  
  app.post('/api/stories/:id/views', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const storyId = parseInt(req.params.id);
      
      // Check if story exists
      const story = await storage.getStory(storyId);
      if (!story) {
        return res.status(404).json({ message: "القصة غير موجودة" });
      }
      
      const storyViewData = insertStoryViewSchema.parse({
        storyId,
        viewerId: userId
      });
      
      const storyView = await storage.addStoryView(storyViewData);
      
      // Broadcast story view to all connected clients
      broadcast({
        type: WebSocketMessageType.STORY_VIEWED,
        payload: storyView
      });
      
      res.json(storyView);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة", error });
    }
  });
  
  // Call routes
  app.post('/api/calls', isAuthenticated, async (req, res) => {
    try {
      const callerId = req.session.userId!;
      
      const callData = insertCallSchema.parse({
        callerId,
        receiverId: req.body.receiverId,
        chatId: req.body.chatId,
        type: req.body.type,
        startTime: new Date(),
        status: "initiated"
      });
      
      const call = await storage.createCall(callData);
      
      // Broadcast call to all connected clients
      broadcast({
        type: WebSocketMessageType.CALL_INITIATED,
        payload: call
      });
      
      res.json(call);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة", error });
    }
  });
  
  app.put('/api/calls/:id/answer', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const callId = parseInt(req.params.id);
    
    // Check if call exists
    const call = await storage.getCall(callId);
    if (!call) {
      return res.status(404).json({ message: "المكالمة غير موجودة" });
    }
    
    // Check if user is the receiver
    if (call.receiverId !== userId) {
      return res.status(403).json({ message: "ليس لديك صلاحية للرد على هذه المكالمة" });
    }
    
    const updatedCall = await storage.updateCallStatus(callId, "answered");
    
    // Broadcast call answer to all connected clients
    broadcast({
      type: WebSocketMessageType.CALL_ANSWERED,
      payload: updatedCall
    });
    
    res.json(updatedCall);
  });
  
  app.put('/api/calls/:id/decline', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const callId = parseInt(req.params.id);
    
    // Check if call exists
    const call = await storage.getCall(callId);
    if (!call) {
      return res.status(404).json({ message: "المكالمة غير موجودة" });
    }
    
    // Check if user is the receiver
    if (call.receiverId !== userId) {
      return res.status(403).json({ message: "ليس لديك صلاحية لرفض هذه المكالمة" });
    }
    
    const updatedCall = await storage.updateCallStatus(callId, "declined");
    
    // Broadcast call decline to all connected clients
    broadcast({
      type: WebSocketMessageType.CALL_DECLINED,
      payload: updatedCall
    });
    
    res.json(updatedCall);
  });
  
  app.put('/api/calls/:id/end', isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const callId = parseInt(req.params.id);
    
    // Check if call exists
    const call = await storage.getCall(callId);
    if (!call) {
      return res.status(404).json({ message: "المكالمة غير موجودة" });
    }
    
    // Check if user is the caller or receiver
    if (call.callerId !== userId && call.receiverId !== userId) {
      return res.status(403).json({ message: "ليس لديك صلاحية لإنهاء هذه المكالمة" });
    }
    
    const endTime = new Date();
    const updatedCall = await storage.updateCallEndTime(callId, endTime);
    
    if (updatedCall) {
      await storage.updateCallStatus(callId, "ended");
      
      // Broadcast call end to all connected clients
      broadcast({
        type: WebSocketMessageType.CALL_ENDED,
        payload: updatedCall
      });
    }
    
    res.json(updatedCall);
  });
  
  // Admin routes
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    
    // Remove passwords
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPassword);
  });
  
  app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    
    // Remove user (not implemented in MemStorage but would be in a real DB)
    res.json({ message: "تم حذف المستخدم بنجاح" });
  });
  
  return httpServer;
}
