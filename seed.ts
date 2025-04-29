import { storage } from "./storage";
import { UserRole, UserStatus } from "@shared/schema";

// بيانات المستخدمين الافتراضية
const users = [
  {
    username: "أحمد",
    password: "123456",
    fullName: "أحمد محمد",
    bio: "مهندس برمجيات",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    role: UserRole.USER,
    isGuest: false
  },
  {
    username: "سارة",
    password: "123456",
    fullName: "سارة أحمد",
    bio: "مصممة جرافيك",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    role: UserRole.USER,
    isGuest: false
  },
  {
    username: "محمد",
    password: "123456",
    fullName: "محمد علي",
    bio: "مطور تطبيقات",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    role: UserRole.USER,
    isGuest: false
  },
  {
    username: "فاطمة",
    password: "123456",
    fullName: "فاطمة حسن",
    bio: "مديرة مشاريع",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    role: UserRole.USER,
    isGuest: false
  }
];

// بيانات المحادثات الثنائية الافتراضية
async function createDirectChats(userIds: number[]) {
  console.log("إنشاء المحادثات الخاصة...");
  // إنشاء محادثة بين كل مستخدم والمستخدمين الآخرين
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const user1 = await storage.getUser(userIds[i]);
      const user2 = await storage.getUser(userIds[j]);
      
      if (!user1 || !user2) continue;
      
      // إنشاء محادثة
      const chat = await storage.createChat({
        type: "private",
        name: `محادثة بين ${user1.fullName} و ${user2.fullName}`,
        createdBy: user1.id
      });
      
      // إضافة المشاركين
      await storage.addChatParticipant({
        chatId: chat.id,
        userId: user1.id,
        role: UserRole.USER
      });
      
      await storage.addChatParticipant({
        chatId: chat.id,
        userId: user2.id,
        role: UserRole.USER
      });
      
      // إضافة بعض الرسائل
      await storage.createMessage({
        chatId: chat.id,
        senderId: user1.id,
        content: `مرحباً ${user2.fullName}! كيف حالك؟`
      });
      
      await storage.createMessage({
        chatId: chat.id,
        senderId: user2.id,
        content: `أهلاً ${user1.fullName}! أنا بخير الحمد لله، وأنت؟`
      });
      
      await storage.createMessage({
        chatId: chat.id,
        senderId: user1.id,
        content: "الحمد لله، هل لديك أي جديد؟"
      });
    }
  }
}

// إنشاء مجموعة
async function createGroupChat(userIds: number[]) {
  console.log("إنشاء المجموعات...");
  if (userIds.length < 2) return;
  
  const admin = await storage.getUser(userIds[0]);
  if (!admin) return;
  
  // إنشاء المجموعة
  const chat = await storage.createChat({
    type: "group",
    name: "مجموعة الأصدقاء",
    avatarUrl: "https://i.pravatar.cc/150?img=7",
    createdBy: admin.id
  });
  
  // إضافة المشاركين
  for (const userId of userIds) {
    const role = userId === admin.id ? UserRole.OWNER : UserRole.USER;
    await storage.addChatParticipant({
      chatId: chat.id,
      userId,
      role
    });
  }
  
  // إضافة بعض الرسائل
  await storage.createMessage({
    chatId: chat.id,
    senderId: admin.id,
    content: "مرحباً بالجميع في المجموعة! 👋"
  });
  
  for (let i = 1; i < userIds.length; i++) {
    const user = await storage.getUser(userIds[i]);
    if (!user) continue;
    
    await storage.createMessage({
      chatId: chat.id,
      senderId: user.id,
      content: `مرحباً ${admin.fullName}! شكراً على إضافتي.`
    });
  }
}

// إنشاء قصص
async function createStories(userIds: number[]) {
  console.log("إنشاء القصص...");
  for (const userId of userIds) {
    const user = await storage.getUser(userId);
    if (!user) continue;
    
    // تعيين تاريخ انتهاء القصة بعد 24 ساعة من الآن
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    await storage.createStory({
      userId,
      content: `قصة من ${user.fullName}`,
      mediaUrl: `https://picsum.photos/500/800?random=${userId}`,
      expiresAt
    });
  }
}

// دالة رئيسية لإنشاء البيانات الافتراضية
export async function seedDatabase() {
  console.log("بدء إنشاء البيانات الافتراضية...");
  
  // إنشاء حساب المطور
  try {
    const adminUser = await storage.getUserByUsername("جلال");
    const adminUserWithSpace = await storage.getUserByUsername("جلال ");
    
    // إذا كان هناك حساب "جلال " (مع مسافة في النهاية)، فقم بحذفه
    if (adminUserWithSpace) {
      console.log("حذف حساب المطور القديم مع المسافة");
      // (ملاحظة: لا يوجد دالة لحذف المستخدم حالياً، لذا سنستخدم حساب جديد)
    }
    
    if (!adminUser) {
      await storage.createUser({
        username: "جلال",
        password: "vbnm085690vbnm",
        fullName: "جلال",
        role: "admin",
        status: "online",
        bio: "مطور تطبيق تيليجرام عربي",
        isGuest: false,
        avatarUrl: null,
      });
      console.log("تم إنشاء حساب المطور: جلال");
    }
  } catch (error) {
    console.error("خطأ في إنشاء حساب المطور:", error);
  }
  
  // التحقق إذا كان هناك مستخدمين بالفعل
  const existingUsers = await storage.getAllUsers();
  
  // إذا كان هناك أكثر من مستخدمين فعلاً، لا تقم بإعادة إنشاء البيانات
  if (existingUsers.length > 2) {
    console.log("البيانات الافتراضية موجودة بالفعل، تخطي الإنشاء");
    return;
  }
  
  // إنشاء المستخدمين
  const userIds: number[] = [];
  
  for (const userData of users) {
    // التحقق إذا كان المستخدم موجوداً بالفعل
    const existingUser = await storage.getUserByUsername(userData.username);
    
    if (existingUser) {
      userIds.push(existingUser.id);
      continue;
    }
    
    try {
      const user = await storage.createUser({
        ...userData,
        status: UserStatus.OFFLINE,
        coverUrl: ""
      });
      
      userIds.push(user.id);
      console.log(`تم إنشاء المستخدم: ${user.fullName}`);
    } catch (error) {
      console.error(`فشل إنشاء المستخدم ${userData.username}:`, error);
    }
  }
  
  // إنشاء المحادثات
  await createDirectChats(userIds);
  
  // إنشاء المجموعات
  await createGroupChat(userIds);
  
  // إنشاء القصص
  await createStories(userIds);
  
  console.log("تم إنشاء البيانات الافتراضية بنجاح!");
}