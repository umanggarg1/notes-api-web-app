import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/app/validators/note.validator";


export async function GET(req : NextRequest) {
  
    const userId = req.headers.get("X-User-Id");


    const notes = await prisma.note.findMany({
      where: {
        userId : userId!,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notes, {
      status: 200
    }); 
}


export async function POST(req: NextRequest) {

  try {

    const userId = req.headers.get("X-User-Id");
    const body = await req.json();

    const validatedData =
      createNoteSchema.parse(body);

    const note =
      await prisma.note.create({
        data: {
          title: validatedData.title,
          content: validatedData.content,
          userId: userId!,
        },
      });

    return NextResponse.json(
      note,
      {
        status: 201,
      }
    );

  } catch (error: any) {

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.issues,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}