import { LoginSchema } from "@/app/validators/auth.validator";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid user",
        },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Invalid password",
        },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    return NextResponse.json(
      {
        message: "Login successful",
        token,
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Invalid input data",
          errors: error.issues,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
