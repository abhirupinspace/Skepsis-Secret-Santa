import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const NAMES_FILE_PATH = path.join(process.cwd(), 'data', 'names.json');

interface NameEntry {
  [key: string]: string;
}

interface AssignedEntry {
  recipient: { [key: string]: string };
  user: { [key: string]: string };
}

interface NameData {
  assigned: AssignedEntry[];
  unassigned: NameEntry[];
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Read names data
    const fileContent = await fs.readFile(NAMES_FILE_PATH, 'utf-8');
    const namesData: NameData = JSON.parse(fileContent);

    // Find the assignment for this user
    const assignment = namesData.assigned.find(entry => {
      const userName = Object.keys(entry.user)[0];
      const userPassword = entry.user[userName];
      return userName === email.toLowerCase() && userPassword === password;
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const recipientName = Object.keys(assignment.recipient)[0];
    const driveLink = assignment.recipient[recipientName];

    // For rechecks, we don't need to send all names since we won't show the wheel
    return NextResponse.json({
      designatedName: recipientName,
      driveLink
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}