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
    const { email, name, password } = await request.json();

    if (!email?.trim() || !name?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(NAMES_FILE_PATH, 'utf-8');
    const namesData: NameData = JSON.parse(fileContent);

    const userExists = namesData.assigned.some(entry => 
      entry.user[email.toLowerCase()] === password
    );

    if (userExists) {
      return NextResponse.json(
        { error: 'This email has already been assigned a person' },
        { status: 400 }
      );
    }

    // Filter out own name for assignment
    const availableNames = namesData.unassigned.filter(entry => {
      const personName = Object.keys(entry)[0];
      return personName.toLowerCase() !== name.toLowerCase();
    });

    if (availableNames.length === 0) {
      return NextResponse.json(
        { error: 'No suitable names available' },
        { status: 404 }
      );
    }

    // Select a random name
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    const selectedEntry = availableNames[randomIndex];
    const personName = Object.keys(selectedEntry)[0];
    const driveLink = selectedEntry[personName];

    // Get all unassigned names BEFORE removing the selected one
    const allNames = namesData.unassigned.map(entry => Object.keys(entry)[0]);

    // Now remove the selected name from unassigned
    namesData.unassigned = namesData.unassigned.filter(entry => 
      Object.keys(entry)[0] !== personName
    );

    // Add to assigned with user info
    namesData.assigned.push({
      recipient: { [personName]: driveLink },
      user: { [email.toLowerCase()]: password }
    });

    await fs.writeFile(NAMES_FILE_PATH, JSON.stringify(namesData, null, 2));

    // Return ALL names that were available, including the selected one
    return NextResponse.json({
      names: allNames,  // All names including the one that was selected
      designatedName: personName,
      driveLink: driveLink
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