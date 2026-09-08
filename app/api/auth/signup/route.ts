import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import prisma from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
