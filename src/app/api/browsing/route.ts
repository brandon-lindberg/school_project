import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

// POST /api/browsing - Record a new browsing history entry
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schoolId } = await request.json();
    if (!schoolId) {
      return NextResponse.json({ error: "School ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const history = await prisma.browsingHistory.create({
      data: {
        user_id: user.user_id,
        school_id: schoolId,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error recording browsing history:", error);
    return NextResponse.json(
      { error: "Failed to record browsing history" },
      { status: 500 }
    );
  }
}

// GET /api/browsing - Get browsing history for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const history = await prisma.browsingHistory.findMany({
      where: { user_id: user.user_id },
      include: { school: true },
      orderBy: { viewed_at: "desc" },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching browsing history:", error);
    return NextResponse.json(
      { error: "Failed to fetch browsing history" },
      { status: 500 }
    );
  }
}

// DELETE /api/browsing - Delete browsing history entries
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const historyId = url.searchParams.get("historyId");

    if (historyId) {
      // Delete specific history entry
      const history = await prisma.browsingHistory.findUnique({
        where: { history_id: parseInt(historyId) },
      });

      if (!history) {
        return NextResponse.json({ error: "History entry not found" }, { status: 404 });
      }

      if (history.user_id !== user.user_id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      await prisma.browsingHistory.delete({
        where: { history_id: parseInt(historyId) },
      });
    } else {
      // Delete all history entries for the user
      await prisma.browsingHistory.deleteMany({
        where: { user_id: user.user_id },
      });
    }

    return NextResponse.json({ message: "History deleted successfully" });
  } catch (error) {
    console.error("Error deleting browsing history:", error);
    return NextResponse.json(
      { error: "Failed to delete browsing history" },
      { status: 500 }
    );
  }
}
