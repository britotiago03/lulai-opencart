// "/api/users/[userId]/data"
import { NextRequest, NextResponse } from "next/server";
import { executeTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";

export async function GET(_: NextRequest) {
    try {
        const session = await getServerSession(userAuthOptions);

        return await executeTransaction(async (client) => {
            const userResult = await client.query(
                `SELECT * FROM users where id = $1`, 
                [session?.user.id]
            );

            if(userResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const userData = userResult.rows[0];

            return NextResponse.json(userData);
        });

    } catch(error) {
        console.error('Error fetching user', error);
        return NextResponse.json(
            { error: 'Failed to fetch user data'},
            { status: 500 }
        );
    }
}