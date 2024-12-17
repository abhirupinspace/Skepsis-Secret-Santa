'use client';
import { useState } from 'react';
import { Gift, Snowflake } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [cryptoName, setCryptoName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setCryptoName(data.cryptoName);
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.error || 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 transform transition-all duration-500 ease-in-out hover:scale-105">
        <h1 className="text-4xl font-bold mb-8 text-center text-red-600">Secret Santa Name Generator</h1>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <p className="text-red-500 text-sm bg-red-100 p-3 rounded">{errorMessage}</p>
            )}
            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="santa@northpole.com"
              />
            </div>

            <div>
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Kris Kringle"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-red-600 text-white p-3 rounded-md font-medium flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Snowflake className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Gift />
                  <span>Generate Secret Santa Name</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Your Secret Santa Name:</h2>
            <p className="text-3xl font-bold bg-green-100 p-6 rounded-lg border-4 border-green-500 inline-block text-green-600">
              {cryptoName}
            </p>
            <p className="text-sm text-green-600">Happy gifting, {name}!</p>
          </div>
        )}
      </div>
    </main>
  );
}