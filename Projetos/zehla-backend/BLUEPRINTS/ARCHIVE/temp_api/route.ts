import { NextResponse } from "next/server";


export async function GET() : void {
  try {
  return NextResponse.json({ message: "Hello, world!" });
}