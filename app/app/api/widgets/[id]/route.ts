import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { invalidateWidget } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;

    const widget = await db.widget.findUnique({
      where: { id },
      include: {
        workspace: true,
        widgetTestimonials: {
          include: {
            testimonial: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    // Get user from database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser || widget.workspace.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse JSON fields if they're strings
    const widgetWithParsedFields = {
      ...widget,
      theme: typeof widget.theme === 'string' ? JSON.parse(widget.theme) : widget.theme,
      layout: typeof widget.layout === 'string' ? JSON.parse(widget.layout) : widget.layout,
    };

    return NextResponse.json(widgetWithParsedFields);
  } catch (error) {
    console.error("Error fetching widget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const widget = await db.widget.findUnique({
      where: { id },
      include: {
        workspace: true,
      },
    });

    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    // Get user from database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser || widget.workspace.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update widget
    const updated = await db.widget.update({
      where: { id },
      data: {
        name: body.name,
        template: body.template,
        isActive: body.isActive,
        autoRotate: body.autoRotate,
        rotateInterval: body.rotateInterval,
        theme: body.theme,
        layout: body.layout,
      },
    });

    // Update testimonial assignments if provided
    if (body.testimonialIds) {
      // Delete existing assignments
      await db.widgetTestimonial.deleteMany({
        where: { widgetId: id },
      });

      // Create new assignments
      if (body.testimonialIds.length > 0) {
        await db.widgetTestimonial.createMany({
          data: body.testimonialIds.map((testimonialId: string, index: number) => ({
            widgetId: id,
            testimonialId,
            order: index,
          })),
        });
      }
    }

    // Fetch updated widget with testimonials
    const result = await db.widget.findUnique({
      where: { id },
      include: {
        widgetTestimonials: {
          include: {
            testimonial: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (widget.shareId) invalidateWidget(widget.shareId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating widget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;

    const widget = await db.widget.findUnique({
      where: { id },
      include: {
        workspace: true,
      },
    });

    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    // Get user from database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser || widget.workspace.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const shareIdSnapshot = widget.shareId;

    await db.widget.delete({
      where: { id },
    });

    if (shareIdSnapshot) invalidateWidget(shareIdSnapshot);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting widget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
