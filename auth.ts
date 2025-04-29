import { apiRequest } from "./queryClient";
import { Login, Register, User } from "@shared/schema";

// المفاتيح المستخدمة في التخزين المحلي
const AUTH_TOKEN_KEY = 'flixchat_auth_token';
const USER_DATA_KEY = 'flixchat_user_data';

export async function login(credentials: Login): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/login", credentials);
  const user = await res.json();
  
  // حفظ بيانات المستخدم في التخزين المحلي
  storeUserLocally(user);
  
  return user;
}

export async function register(data: Register): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/register", data);
  const user = await res.json();
  
  // حفظ بيانات المستخدم في التخزين المحلي
  storeUserLocally(user);
  
  return user;
}

export async function loginAsGuest(): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/guest", {});
  const user = await res.json();
  
  // حفظ بيانات المستخدم في التخزين المحلي
  storeUserLocally(user);
  
  return user;
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout", {});
  
  // حذف بيانات المستخدم من التخزين المحلي
  clearStoredUser();
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiRequest("GET", "/api/users/me");
  return await res.json();
}

export async function updateProfile(data: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
}): Promise<User> {
  const res = await apiRequest("PUT", "/api/users/me", data);
  return await res.json();
}

/**
 * حفظ بيانات المستخدم في التخزين المحلي
 */
export function storeUserLocally(user: User): void {
  try {
    // حفظ معرف المستخدم كرمز مصادقة مؤقت
    localStorage.setItem(AUTH_TOKEN_KEY, user.id.toString());
    
    // حفظ بيانات المستخدم (مع حذف كلمة المرور)
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userWithoutPassword));
    
    console.log('تم حفظ بيانات المستخدم محلياً:', userWithoutPassword.username);
  } catch (error) {
    console.error('خطأ في حفظ بيانات المستخدم:', error);
  }
}

/**
 * جلب بيانات المستخدم من التخزين المحلي
 */
export function getStoredUser(): Omit<User, 'password'> | null {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('خطأ في استرجاع بيانات المستخدم:', error);
    return null;
  }
}

/**
 * التحقق مما إذا كان المستخدم مسجل دخوله محلياً
 */
export function isLoggedInLocally(): boolean {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * الحصول على معرف المستخدم المخزن محلياً
 */
export function getStoredUserId(): number | null {
  const id = localStorage.getItem(AUTH_TOKEN_KEY);
  return id ? parseInt(id) : null;
}

/**
 * حذف بيانات المستخدم من التخزين المحلي
 */
export function clearStoredUser(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}
