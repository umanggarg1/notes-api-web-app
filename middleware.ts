import {NextRequest , NextResponse} from "next/server";
// import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

export async function middleware(req : NextRequest) {

  
  if(req.nextUrl.pathname.startsWith("/api/notes")){
    
    const authHeader = req.headers.get("Authorization");

    if(!authHeader || !authHeader.startsWith("Bearer ")){
      return NextResponse.json({
        message: "Unauthorized"
      }, {
        status: 401
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
    return NextResponse.json(
      {
        message: "Token missing",
      },
      {
        status: 401,
      }
    );
  }

    try{
      const secret = new TextEncoder().encode(
      process.env.JWT_SECRET!
    );

    const { payload } = await jwtVerify(
      token,
      secret
    );

    const requestHeaders = new Headers(
      req.headers
    );

      requestHeaders.set("X-User-Id", payload.userId as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
    } catch(error : any){
      console.log("JWT Error: ", error);

      return NextResponse.json({
        message: "Invalid token"
      }, {
        status: 401
      });
    }
  }

  return NextResponse.next();
}