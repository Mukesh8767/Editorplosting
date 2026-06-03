export type UserRole = "admin" | "author";

export type User = {
  id: string;
  username: string;
  displayName: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string | null;
};

export type Blog = {
  id: string;
  slug?: string | null;
  title: string;
  content: string;
  excerpt?: string | null;
  topic_id?: string | null;
  cover_image_url?: string | null;
  status?: string | null;
  published_at?: string | null;
  authorId: string;
  authorName: string;
  author?: {
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    author_image_url?: string | null;
  } | null;
  authorImageUrl?: string | null;
  authorAvatarUrl?: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: string;
  parent_id?: string | null;
  title: string;
  slug?: string;
};

export type EventImage = {
  id?: string;
  event_id?: string;
  image_url: string;
  display_order?: number;
  created_at?: string;
};

export type Event = {
  id: string;
  title: string;
  description?: string | null;
  event_type?: string | null;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  organizer?: string | null;
  registration_url?: string | null;
  cover_image_url?: string | null;
  is_featured?: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  event_images?: EventImage[];
};

const SESSION_KEY = "blogAppSession";

let blogsCache: Blog[] | null = null;
let topicsCache: Topic[] | null = null;
let usersCache: User[] | null = null;
let userBlogsCache: { [userId: string]: Blog[] } = {};

export const clearCache = () => {
  blogsCache = null;
  topicsCache = null;
  usersCache = null;
  userBlogsCache = {};
};

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const apiFetch = async (path: string, options?: RequestInit) => {
  const url = typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || `API request failed: ${res.statusText}`);
  }

  return res.json();
};

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  try {
    return await apiFetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return null;
  }
};

export const createUser = async (
  username: string,
  displayName: string,
  password: string,
  authorImageUrl?: string | null
): Promise<User> => {
  const data = await apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      displayName,
      password,
      authorImageUrl,
      avatarUrl: authorImageUrl ?? null,
    }),
  });
  clearCache();
  return data;
};

export const getUsers = async (bypassCache = false): Promise<User[]> => {
  if (usersCache && !bypassCache) {
    apiFetch("/api/users")
      .then((data) => {
        usersCache = data;
      })
      .catch(() => {});
    return usersCache;
  }
  const data = await apiFetch("/api/users");
  usersCache = data;
  return data;
};

export const getSession = (): User | null => {
  if (typeof window === "undefined") return null;
  return safeParse<User | null>(window.sessionStorage.getItem(SESSION_KEY), null);
};

export const setSession = (user: User) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
};

export const getAllBlogs = async (bypassCache = false): Promise<Blog[]> => {
  if (blogsCache && !bypassCache) {
    apiFetch("/api/blogs")
      .then((data) => {
        blogsCache = data;
      })
      .catch(() => {});
    return blogsCache;
  }
  const data = await apiFetch("/api/blogs");
  blogsCache = data;
  return data;
};

export const getTopics = async (bypassCache = false): Promise<Topic[]> => {
  if (topicsCache && !bypassCache) {
    apiFetch("/api/topics")
      .then((data) => {
        topicsCache = data;
      })
      .catch(() => {});
    return topicsCache;
  }
  const data = await apiFetch("/api/topics");
  topicsCache = data;
  return data;
};

export const getUserBlogs = async (userId: string, bypassCache = false): Promise<Blog[]> => {
  if (userBlogsCache[userId] && !bypassCache) {
    apiFetch(`/api/blogs?userId=${encodeURIComponent(userId)}`)
      .then((data) => {
        userBlogsCache[userId] = data;
      })
      .catch(() => {});
    return userBlogsCache[userId];
  }
  const data = await apiFetch(`/api/blogs?userId=${encodeURIComponent(userId)}`);
  userBlogsCache[userId] = data;
  return data;
};

export const getBlogById = async (id: string): Promise<Blog | null> => {
  return await apiFetch(`/api/blogs?id=${encodeURIComponent(id)}`);
};

export const createBlog = async (
  title: string,
  content: string,
  author: User,
  options?: {
    id?: string;
    tags?: string[];
    excerpt?: string | null;
    slug?: string | null;
    topic_id?: string | null;
    status?: string | null;
    reading_time?: number | null;
    is_featured?: boolean;
    cover_image_url?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    canonical_url?: string | null;
    published_at?: string | null;
  }
): Promise<Blog> => {
  const data = await apiFetch("/api/blogs", {
    method: "POST",
    body: JSON.stringify({
      title,
      content,
      authorId: author.id,
      authorName: author.displayName,
      id: options?.id,
      excerpt: options?.excerpt,
      slug: options?.slug,
      topic_id: options?.topic_id,
      status: options?.status,
      reading_time: options?.reading_time,
      is_featured: options?.is_featured,
      cover_image_url: options?.cover_image_url,
      seo_title: options?.seo_title,
      seo_description: options?.seo_description,
      canonical_url: options?.canonical_url,
      published_at: options?.published_at,
      tags: options?.tags,
    }),
  });
  clearCache();
  return data;
};

export const deleteBlog = async (id: string): Promise<void> => {
  await apiFetch(`/api/blogs?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  clearCache();
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiFetch("/api/users", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
  clearCache();
};

export const updateUser = async (
  id: string,
  displayName: string,
  password?: string,
  avatarUrl?: string | null
): Promise<User> => {
  const data = await apiFetch("/api/users", {
    method: "PATCH",
    body: JSON.stringify({
      id,
      displayName,
      password,
      avatarUrl,
      authorImageUrl: avatarUrl ?? null,
    }),
  });
  clearCache();
  return data;
};

export const getEvents = async (options?: { userId?: string; featured?: boolean }): Promise<Event[]> => {
  let url = "/api/events";
  const params = new URLSearchParams();
  if (options?.userId) params.append("userId", options.userId);
  if (options?.featured) params.append("featured", "true");
  if (params.toString()) url += `?${params.toString()}`;
  return await apiFetch(url);
};

export const createEvent = async (
  payload: Omit<Event, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<Event> => {
  return await apiFetch("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  await apiFetch(`/api/events?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
