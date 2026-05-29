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

const SESSION_KEY = "blogAppSession";

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const apiFetch = async (path: string, options?: RequestInit) => {
  const res = await fetch(path, {
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
  return await apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({ username, displayName, password, authorImageUrl }),
  });
};

export const getUsers = async (): Promise<User[]> => {
  return await apiFetch("/api/users");
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

export const getAllBlogs = async (): Promise<Blog[]> => {
  return await apiFetch("/api/blogs");
};

export const getTopics = async (): Promise<Topic[]> => {
  return await apiFetch("/api/topics");
};

export const getUserBlogs = async (userId: string): Promise<Blog[]> => {
  return await apiFetch(`/api/blogs?userId=${encodeURIComponent(userId)}`);
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
  return await apiFetch("/api/blogs", {
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
};

export const deleteBlog = async (id: string): Promise<void> => {
  await apiFetch(`/api/blogs?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiFetch("/api/users", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
};

export const updateUser = async (
  id: string,
  displayName: string,
  password?: string,
  avatarUrl?: string | null
): Promise<User> => {
  return await apiFetch("/api/users", {
    method: "PATCH",
    body: JSON.stringify({ id, displayName, password, avatarUrl }),
  });
};
