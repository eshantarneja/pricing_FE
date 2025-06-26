'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function FirebaseTest() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionName, setCollectionName] = useState('evals');

  useEffect(() => {
    async function testFirestore() {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Attempting to fetch from collection: ${collectionName}`);
        
        const q = query(collection(db, collectionName), limit(10));
        const querySnapshot = await getDocs(q);
        
        console.log(`Query executed, got ${querySnapshot.size} documents`);
        
        const documents: any[] = [];
        querySnapshot.forEach((doc) => {
          console.log(`Document ID: ${doc.id}`);
          console.log('Document data:', doc.data());
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setData(documents);
      } catch (err: any) {
        console.error('Error testing Firestore:', err);
        setError(err.message || 'Error fetching data');
      } finally {
        setIsLoading(false);
      }
    }
    
    testFirestore();
  }, [collectionName]);

  const tryCollection = (name: string) => {
    setCollectionName(name);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className="mb-4">
        <p>Current collection: <strong>{collectionName}</strong></p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => tryCollection('evals')} 
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Try "evals"
          </button>
          <button 
            onClick={() => tryCollection('Evals')} 
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Try "Evals"
          </button>
          <button 
            onClick={() => tryCollection('EVALS')} 
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Try "EVALS"
          </button>
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          <h2 className="text-xl font-semibold mb-2">Results ({data.length} documents):</h2>
          {data.length === 0 ? (
            <p className="text-gray-500">No documents found in collection "{collectionName}"</p>
          ) : (
            <pre className="bg-gray-100 p-4 overflow-auto max-h-96 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </>
      )}

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <ul className="list-disc pl-5">
          <li>Check Firebase project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</li>
          <li>Firebase initialized: {db ? 'Yes' : 'No'}</li>
          <li>Location: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</li>
        </ul>
      </div>
    </div>
  );
}
