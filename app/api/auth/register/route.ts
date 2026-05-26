import { registerSchema } from "@/app/validators/auth.validator";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export async function POST(req : NextRequest) {
  try{
    const body = await req.json();

    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if(existingUser){
      return NextResponse.json({
        error: "User with this email already exists"
      }, {
        status: 400
      });

    }

    const hashedPass = await bcrypt.hash(validatedData.password, 10);

    await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPass,
      },
    });

    return NextResponse.json({
      message: "User registered successfully"
    }, {
      status: 201
    });

  }catch(error : any){

    if(error.name === "ZodError"){
      return NextResponse.json({
        message: "Invalid input data",
        errors: error.issues,
      }, {
        status: 400
      });
    }

    return NextResponse.json({
      message: "Internal Server Error",
    }, {
      status: 500
    });
  }
}
