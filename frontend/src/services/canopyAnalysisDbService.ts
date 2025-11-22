import { CanopyPhotoAnalysis } from '../database/models/Plot';

// Interface for canopy analysis data - extend from CanopyPhotoAnalysis
export interface CanopyAnalysisRecord {
  id: string;
  plotId: string;
  quadrantId: string;
  canopyCoverPercentage: number;
  estimatedLAI: number;
  gapFraction: number;
  maskUrl: string;
  segmentedUrl: string;
  analysisImagePath?: string;
  analysisDate: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// Initialize IndexedDB
const DB_NAME = 'CanopyAnalysisDB';
const DB_VERSION = 1;
const STORE_NAME = 'canopyAnalysisResults';

// Initialize DB once
let dbInstance: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('plotId', 'plotId', { unique: false });
        store.createIndex('quadrantId', 'quadrantId', { unique: false });
        store.createIndex('analysisDate', 'analysisDate', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

const getDB = async (): Promise<IDBDatabase> => {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
};

// Save a single analysis record
export const saveCanopyAnalysis = async (analysis: CanopyAnalysisRecord): Promise<string> => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  // Ensure updatedAt timestamp is current
  const recordToSave: CanopyAnalysisRecord = {
    ...analysis,
    updatedAt: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(recordToSave);
    
    request.onsuccess = () => {
      const id = request.result as string;
      console.log(`Canopy analysis saved with ID: ${id}`);
      resolve(id);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Save multiple analysis records
export const saveCanopyAnalyses = async (analyses: CanopyAnalysisRecord[]): Promise<string[]> => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const promises = analyses.map(analysis => {
    const recordToSave: CanopyAnalysisRecord = {
      ...analysis,
      updatedAt: new Date().toISOString()
    };
    
    return new Promise<string>((resolve, reject) => {
      const request = store.put(recordToSave);
      
      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);
    });
  });
  
  return Promise.all(promises);
};

// Get all analyses for a specific plot
export const getCanopyAnalysesByPlotId = async (plotId: string): Promise<CanopyAnalysisRecord[]> => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('plotId');
  
  return new Promise((resolve, reject) => {
    const results: CanopyAnalysisRecord[] = [];
    const request = index.openCursor(IDBKeyRange.only(plotId));
    
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
};


// Get a single analysis by ID
export const getCanopyAnalysisById = async (id: string): Promise<CanopyAnalysisRecord | undefined> => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    
    request.onsuccess = () => {
      const result = request.result as CanopyAnalysisRecord;
      resolve(result || undefined);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Get all canopy analyses
export const getAllCanopyAnalyses = async (): Promise<CanopyAnalysisRecord[]> => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result;
      console.log(`Retrieved ${results.length} analyses from DB`);
      resolve(results as CanopyAnalysisRecord[] || []);
    };

    request.onerror = () => {
      console.error('Error retrieving analyses from DB:', request.error);
      reject(request.error);
    };
  });
};

// Delete a single analysis by ID
export const deleteCanopyAnalysis = async (id: string): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Clear all canopy analysis data
export const clearAllCanopyAnalyses = async (): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};