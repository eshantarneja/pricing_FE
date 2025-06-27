import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  DocumentData,
  where,
  QueryConstraint,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Interface for SKU data based on PRD field mappings
export interface SkuData {
  id: string;
  productCode: string;
  description: string;
  category: string;
  storage: string;
  aiPrice: number;
  gpPercent: number;
  inventory: number;
  lastCost: number;
  benchmarkPrice: number;
  recentGP: number;
  lifetimeGP: number;
  medianGP: number;
  weeksOnHand: string;
  warehouseCode: number;
  rationale: string[]; // Array of strings explaining the pricing rationale
  
  // USDA Market Trends data
  USDA_TodayPrice?: number;
  USDA_7d_pct_change?: number;
  USDA_30v90_pct_change?: number;
  USDA_1yr_pct_change?: number;
}

// Map Firestore data to our SKU interface
const mapSkuData = (doc: DocumentData): SkuData => {
  const data = doc.data();
  
  // Process rationale field - handle various format possibilities
  let rationaleArray: string[] = [];
  if (data.Rationale) {
    if (Array.isArray(data.Rationale)) {
      // Already an array, use directly
      rationaleArray = data.Rationale;
    } else if (typeof data.Rationale === 'string') {
      try {
        // First check if it's a JSON array string
        if (data.Rationale.startsWith('[') && data.Rationale.endsWith(']')) {
          try {
            const parsed = JSON.parse(data.Rationale);
            if (Array.isArray(parsed)) {
              rationaleArray = parsed;
              console.log('Parsed JSON array rationale:', rationaleArray);
            }
          } catch (e) {
            // Not a valid JSON array, continue with other parsing methods
            console.log('Not a valid JSON array, trying other parsing methods');
          }
        }
        
        // If array is still empty, try parsing the unicode arrow format
        if (rationaleArray.length === 0) {
          // Handle the case where it's one string with unicode arrow characters (→)
          const arrowSplit = data.Rationale
            .split('\u2192')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
            
          if (arrowSplit.length > 1) {
            rationaleArray = arrowSplit;
            console.log('Parsed arrow-delimited rationale:', rationaleArray);
          } else {
            // If no arrows found, check if it's a single-item (no splits)
            rationaleArray = [data.Rationale];
          }
        }
      } catch (error) {
        console.error('Error parsing rationale field:', error);
        rationaleArray = [data.Rationale]; // Fallback to using the raw string
      }
    }
  }
  
  return {
    id: doc.id,
    productCode: data.ProductCode?.toString() || '',
    description: data.Description1 || '',
    category: 'Beef', // Hardcoded as per PRD
    storage: data.WarehouseCode === 1 ? 'Fresh' : 'Frozen',
    aiPrice: Number(data.Computed_Price) || 0,
    gpPercent: Number(data.Recommended_Margin) || 0,
    inventory: Number(data.InventoryLbs) || 0,
    lastCost: Number(data.LastCost) || 0,
    benchmarkPrice: Number(data.EvalSalesPrice) || 0,
    recentGP: Number(data.Recent_GPPercent) || 0,
    lifetimeGP: Number(data.Historical_GPPercent) || 0,
    medianGP: Number(data.GPMedian) || 0,
    weeksOnHand: data.WeeksOnHand || '0',
    warehouseCode: Number(data.WarehouseCode) || 0,
    rationale: rationaleArray,
    
    // USDA Market Trends data (may be undefined if not available)
    // Treat null, undefined, or zero values as undefined so they display as 'Not available'
    USDA_TodayPrice: data.USDA_TodayPrice !== undefined && data.USDA_TodayPrice !== null && Number(data.USDA_TodayPrice) !== 0 ? 
      Number(data.USDA_TodayPrice) : undefined,
    USDA_7d_pct_change: data.USDA_7d_pct_change !== undefined && data.USDA_7d_pct_change !== null && Number(data.USDA_7d_pct_change) !== 0 ? 
      Number(data.USDA_7d_pct_change) : undefined,
    USDA_30v90_pct_change: data.USDA_30v90_pct_change !== undefined && data.USDA_30v90_pct_change !== null && Number(data.USDA_30v90_pct_change) !== 0 ? 
      Number(data.USDA_30v90_pct_change) : undefined,
    USDA_1yr_pct_change: data.USDA_1yr_pct_change !== undefined && data.USDA_1yr_pct_change !== null && Number(data.USDA_1yr_pct_change) !== 0 ? 
      Number(data.USDA_1yr_pct_change) : undefined
  };
};

// Hook to fetch all SKUs for the search page
export const useSkus = () => {
  const [skus, setSkus] = useState<SkuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkus = async () => {
      try {
        console.log('Fetching SKUs from Firestore...');
        setLoading(true);
        const skuCollection = collection(db, 'evals');
        const skuQuery = query(skuCollection, limit(100));
        console.log('Executing Firestore query...');
        
        const querySnapshot = await getDocs(skuQuery);
        console.log(`Retrieved ${querySnapshot.size} documents from Firestore`);
        
        const skuList: SkuData[] = [];
        querySnapshot.forEach((doc) => {
          try {
            const skuData = mapSkuData(doc);
            skuList.push(skuData);
          } catch (mapError) {
            console.error('Error mapping document:', doc.id, mapError);
          }
        });
        
        console.log(`Successfully mapped ${skuList.length} SKUs`);
        setSkus(skuList);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching SKUs:', err?.message || err);
        setError('Failed to fetch SKUs');
      } finally {
        setLoading(false);
      }
    };

    fetchSkus();
  }, []);

  return { skus, loading, error };
};

// Hook to fetch a single SKU by ID for the details page
export const useSku = (id: string) => {
  const [sku, setSku] = useState<SkuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchSku = async () => {
      try {
        console.log(`Fetching SKU with ID: ${id}`);
        setLoading(true);
        
        // Check if the ID already contains a warehouse code
        let documentId = id;
        if (!id.includes('-')) {
          // If no warehouse code in ID, default to warehouse 1
          documentId = `${id}-1`;
          console.log(`No warehouse code found in ID, using default: ${documentId}`);
        }
        
        const docRef = doc(db, 'evals', documentId);
        console.log(`Querying Firestore document: evals/${documentId}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`Document found: ${documentId}`);
          const skuData = mapSkuData(docSnap);
          setSku(skuData);
          setError(null);
        } else {
          console.log(`Document not found: ${documentId}`);
          
          // If document not found with warehouse code 1, try warehouse code 2
          if (documentId.endsWith('-1')) {
            const alternativeId = id.replace('-1', '-2');
            console.log(`Trying alternative warehouse: ${alternativeId}`);
            const altDocRef = doc(db, 'evals', alternativeId);
            const altDocSnap = await getDoc(altDocRef);
            
            if (altDocSnap.exists()) {
              console.log(`Alternative document found: ${alternativeId}`);
              const skuData = mapSkuData(altDocSnap);
              setSku(skuData);
              setError(null);
              return;
            }
          }
          
          setError('SKU not found');
          setSku(null);
        }
      } catch (err: any) {
        console.error('Error fetching SKU:', err?.message || err);
        setError('Failed to fetch SKU details');
      } finally {
        setLoading(false);
      }
    };

    fetchSku();
  }, [id]);

  return { sku, loading, error };
};

// Hook for searching SKUs
export const useSkuSearch = (searchTerm: string) => {
  const [searchResults, setSearchResults] = useState<SkuData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchSkus = async () => {
      try {
        setLoading(true);
        const skuCollection = collection(db, 'evals');
        
        // Convert to string for text search
        const searchTermStr = searchTerm.toString().toLowerCase();
        
        // Fetch all and filter on client side because Firestore doesn't have convenient 
        // contains/startsWith operations for string fields
        const querySnapshot = await getDocs(skuCollection);
        
        const results: SkuData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const productCode = data.ProductCode?.toString() || '';
          const description = data.Description1?.toLowerCase() || '';
          
          if (productCode.includes(searchTermStr) || description.includes(searchTermStr)) {
            results.push(mapSkuData(doc));
          }
        });
        
        setSearchResults(results);
        setError(null);
      } catch (err) {
        console.error('Error searching SKUs:', err);
        setError('Failed to search SKUs');
      } finally {
        setLoading(false);
      }
    };

    searchSkus();
  }, [searchTerm]);

  return { searchResults, loading, error };
};
