import { NextRequest, NextResponse } from "next/server";
import { updateNoteSchema } from "@/app/validators/note.validator";

import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id : string;
  }>;
};

export async function GET(req : NextRequest, { params } : Params) {

  const { id } = await params;

  const userId = req.headers.get("X-User-Id");

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId : userId!,
    },
  });

  if(!note){
    return NextResponse.json({
      message: "Note not found"
    }, {
      status: 404
    });
  }

  return NextResponse.json(note, {
    status: 200
  });
}


export async function PUT(req : NextRequest, { params } : Params) {

  const { id } = await params;
  const userId = req.headers.get("X-User-Id");

  try{
    const body = await req.json();

    const validatedData = updateNoteSchema.parse(body);

    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: userId!,
      },
    });

    if(!existingNote){
      return NextResponse.json({
        message: "Note not found"
      }, {
        status: 404
      });
    }

    const updatedNote = await prisma.note.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedNote, {
      status: 200
    });
  } 
  catch (error : any) {

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

    return NextResponse.json({
      message: "Internal Server Error",
    }, {
      status: 500
    });
  }

}

export async function DELETE(req : NextRequest, { params } : Params) {

  const { id } = await params;

  const userId = req.headers.get("X-User-Id");

  const existingNote = await prisma.note.findFirst({
    where: {
      id,
      userId: userId!,
    },
  });

  if(!existingNote){  
    return NextResponse.json({
      message: "Note not found",
    },
    {
      status: 404,
    });

  }

  await prisma.note.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Note deleted successfully",
  }, {
    status: 200,
  });

}

    
