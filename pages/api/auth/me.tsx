import { getSession } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@auth0/nextjs-auth0';

interface UserResponse {
    user: Session['user'] | null;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UserResponse | ErrorResponse>
): Promise<void> {
    try {
        const session: Session | null | undefined = await getSession(req, res);
        if (!session?.user) {
            return res.status(200).json({ user: null });
        }
        return res.status(200).json({ user: session.user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
}
