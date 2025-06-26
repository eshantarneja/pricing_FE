'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestSkuPage() {
  const [skuData, setSkuData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skuId, setSkuId] = useState('10043794-1'); // Default to a SKU ID we know exists

  const fetchSku = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching SKU with ID: ${id}`);
      const docRef = doc(db, 'evals', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        setSkuData({
          id: docSnap.id,
          ...docSnap.data()
        });
      } else {
        console.log('No such document!');
        setError(`Document ${id} not found`);
        setSkuData(null);
      }
    } catch (err: any) {
      console.error('Error fetching document:', err);
      setError(err.message || 'Error fetching SKU');
      setSkuData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSku(skuId);
  }, [skuId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Firestore SKU Test</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Enter SKU ID to test:</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={skuId} 
            onChange={(e) => setSkuId(e.target.value)}
            className="border p-2 flex-1 rounded"
          />
          <button 
            onClick={() => fetchSku(skuId)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Fetch SKU
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Try IDs like: 10043794-1, 11121012-1, 11121201-1
        </p>
      </div>

      {loading ? (
        <div className="p-4 border rounded bg-gray-50">Loading...</div>
      ) : error ? (
        <div className="p-4 border rounded bg-red-50 text-red-700">{error}</div>
      ) : skuData ? (
        <div>
          <h2 className="text-lg font-semibold mb-2">SKU Data Retrieved:</h2>
          <div className="overflow-auto max-h-[70vh]">
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(skuData, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded bg-yellow-50">No data found</div>
      )}
    </div>
  );
}
