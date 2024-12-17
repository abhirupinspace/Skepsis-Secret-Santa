import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { createHash } from 'crypto';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

mongoose.connect(mongoUri).catch((err) => console.error('Error connecting to MongoDB:', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  cryptoName: { type: String, required: true, unique: true },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Function to generate a unique crypto name
const generateCryptoName = (input: string) => {
  const adjectives = ['Mystic', 'Cosmic', 'Quantum', 'Stellar', 'Crypto', 'Digital', 'Neural', 'Cyber'];
  const nouns = ['Phoenix', 'Dragon', 'Nexus', 'Matrix', 'Vector', 'Pulse', 'Nova', 'Spark'];

  let cryptoName = '';
  let uniqueHash = '';

  do {
    const hash = createHash('sha256')
      .update(input + Math.random().toString()) // Add randomness for uniqueness
      .digest('hex')
      .substring(0, 8);

    const adjIndex = parseInt(hash.substring(0, 4), 16) % adjectives.length;
    const nounIndex = parseInt(hash.substring(4, 8), 16) % nouns.length;

    uniqueHash = hash;
    cryptoName = `${adjectives[adjIndex]}${nouns[nounIndex]}`;
  } while (!cryptoName);

  return { uniqueHash, cryptoName };
};

// POST Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Check if the name is already used
    const existingUserByName = await User.findOne({ name });
    if (existingUserByName) {
      return NextResponse.json(
        { error: 'NAME IS USED YOU ALREADY HAVE A SECRET NAME' },
        { status: 400 }
      );
    }

    // Generate unique crypto name
    let { cryptoName } = generateCryptoName(`${email}${name}${process.env.NEXT_PUBLIC_CRYPTO_SECRET}`);
    let existingUserByCryptoName;

    // Ensure crypto name is unique
    do {
      existingUserByCryptoName = await User.findOne({ cryptoName });
      if (existingUserByCryptoName) {
        ({ cryptoName } = generateCryptoName(`${email}${name}${process.env.NEXT_PUBLIC_CRYPTO_SECRET}`));
      }
    } while (existingUserByCryptoName);

    // Save user data in MongoDB
    const user = new User({ email, name, cryptoName });
    await user.save();

    return NextResponse.json({ cryptoName: user.cryptoName });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
