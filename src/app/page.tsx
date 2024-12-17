'use client'
import { useState } from 'react'
import { createHash } from 'crypto'

export default function Home() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [cryptoName, setCryptoName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const generateCryptoName = (input: string) => {
    // Create a deterministic but secure hash from the input
    const hash = createHash('sha256')
      .update(input)
      .digest('hex')
      .substring(0, 8)
    
    // List of adjectives and nouns for name generation
    const adjectives = ['Mystic', 'Cosmic', 'Quantum', 'Stellar', 'Crypto', 'Digital', 'Neural', 'Cyber']
    const nouns = ['Phoenix', 'Dragon', 'Nexus', 'Matrix', 'Vector', 'Pulse', 'Nova', 'Spark']
    
    // Use hash to deterministically select words
    const adjIndex = parseInt(hash.substring(0, 4), 16) % adjectives.length
    const nounIndex = parseInt(hash.substring(4, 8), 16) % nouns.length
    
    return `${adjectives[adjIndex]}${nouns[nounIndex]}`
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          cryptoName: generateCryptoName(`${email}${name}${process.env.NEXT_PUBLIC_CRYPTO_SECRET}`)
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setCryptoName(data.cryptoName)
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Crypto Name Generator</h1>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Generate Crypto Name
            </button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your Asigned Name:</h2>
            <p className="text-xl bg-gray-100 p-4 rounded">{cryptoName}</p>
          </div>
        )}
      </div>
    </main>
  )
}