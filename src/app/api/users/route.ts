import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users except the current user
    const users = await prisma.user.findMany({
      where: {
        email: {
          not: session.user.email,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    // Get last message and unread count for each user
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: user.id },
              { senderId: user.id, receiverId: session.user.id },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
        });

        // Count unread messages from this user
        const unreadCount = await prisma.message.count({
          where: {
            senderId: user.id,
            receiverId: session.user.id,
            read: false,
          },
        });

        return {
          ...user,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isOwn: lastMessage.senderId === session.user.id,
              }
            : null,
          ...(unreadCount > 0 && { unreadCount }),
        };
      })
    );

    // Sort users by last message time (most recent first)
    const sortedUsers = usersWithLastMessage.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    return NextResponse.json(sortedUsers);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
