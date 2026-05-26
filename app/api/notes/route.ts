import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/app/validators/note.validator";

import { verifyToken } from "@/lib/auth";

export async function GET(req : NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if(!authHeader){
    return NextResponse.json({
      message: "Unauthorized"
    }, {
      status: 401
    });
  }

  const token = authHeader.split(" ")[1];
  
    const decoded = verifyToken(token) as { userId: string; } ;

    if(!decoded){
      return NextResponse.json({
        message: "Invalid token"
      }, {
        status: 401
      });
    }


    const notes = await prisma.note.findMany({
      where: {
        userId : decoded.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notes, {
      status: 200
    }); 
}


export async function POST(req: Request) {

  const authHeader =
    req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const token =
    authHeader.split(" ")[1];

  const decoded =
    verifyToken(token) as {
      userId: string;
    };

  if (!decoded) {
    return NextResponse.json(
      {
        message: "Invalid token",
      },
      {
        status: 401,
      }
    );
  }

  try {

    const body = await req.json();

    const validatedData =
      createNoteSchema.parse(body);

    const note =
      await prisma.note.create({
        data: {
          title: validatedData.title,
          content: validatedData.content,
          userId: decoded.userId,
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