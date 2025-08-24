// utils/api/users.ts
export type User = { id: string; name: string; email?: string; avatarUrl?: string | null };

const SERVER = (process.env.NEXT_PUBLIC_URL ?? '').replace(/\/$/, '');

type UserSummary = {
  id: string;
  username: string;
  full_name?: string | null;
  email?: string | null;
  profile_image?: string | null;
};

export async function searchUsers(q: string, token: string | null, limit = 20): Promise<User[]> {
  if (!q || q.trim().length < 2) return [];
  try {
    const res = await fetch(`${SERVER}/users?query=${encodeURIComponent(q)}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const data = (await res.json()) as UserSummary[];

    return (data ?? []).map((u) => ({
      id: u.id,
      name: u.full_name?.trim() || u.username,
      email: u.email ?? undefined,
      avatarUrl: u.profile_image ?? null,
    }));
  } catch {
    return [];
  }
}

/********************************************************************************************************** */