export type Room = {
    id: string;
    name: string;
    token: string;
    tokenExpiresAt: string;
    ownerId: string;
    createdAt: string;
    owner: { email: string };
    admins: { id: string; user: { email: string } }[];
    _count: { requests: number };
};

export type Admin = Room["admins"][number];

export const isTokenExpired = (date: string) => new Date(date) < new Date();
