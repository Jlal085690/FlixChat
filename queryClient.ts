import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`طلب API: ${method} ${url}`, data ? { بيانات: data } : "بدون بيانات");

  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`استجابة من ${url}:`, {
      حالة: res.status,
      نوع: res.headers.get('content-type')
    });

    if (res.status === 401) {
      window.location.href = '/auth';
      throw new Error('انتهت صلاحية الجلسة');
    }
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`خطأ في طلب API: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`استعلام API: ${queryKey[0]}`, {
      معالجة401: unauthorizedBehavior
    });
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    console.log(`استجابة من ${queryKey[0]}:`, {
      حالة: res.status,
      نوع: res.headers.get('content-type')
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log("حالة 401: المستخدم غير مسجل دخوله - إرجاع null");
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log(`بيانات من ${queryKey[0]}:`, data);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 30, // 30 دقيقة
      retry: false,
      refetchOnWindowFocus: false,
      refetchInterval: false
    },
    mutations: {
      retry: false,
    },
  },
});