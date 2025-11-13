// src/services/dbService.ts

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'archived';
  tools: string[];
  dataSources: string[];
  progress?: number;
  totalDataPoints?: number;
  lastSynced?: string;
}

// Define the database structure
const DB_NAME = 'EnvScienceDB';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const DATA_SOURCES_STORE = 'dataSources';
const TOOLS_STORE = 'tools';

// Define the database schema
interface DatabaseSchema {
  [PROJECTS_STORE]: Project;
  [DATA_SOURCES_STORE]: { id: string; name: string; type: string };
  [TOOLS_STORE]: { id: string; name: string; category: string };
}

let db: IDBDatabase | null = null;
let dbReady: Promise<IDBDatabase>;

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  dbReady = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database failed to open');
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Database opened successfully');
      initializeDefaultData();
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create projects store
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('status', 'status', { unique: false });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create data sources store
      if (!db.objectStoreNames.contains(DATA_SOURCES_STORE)) {
        const dataSourceStore = db.createObjectStore(DATA_SOURCES_STORE, { keyPath: 'id' });
        dataSourceStore.createIndex('name', 'name', { unique: true });
      }

      // Create tools store
      if (!db.objectStoreNames.contains(TOOLS_STORE)) {
        const toolStore = db.createObjectStore(TOOLS_STORE, { keyPath: 'id' });
        toolStore.createIndex('name', 'name', { unique: true });
        toolStore.createIndex('category', 'category', { unique: false });
      }
    };
  });
  return dbReady;
};

// Initialize default tools, data sources, and a default project
const initializeDefaultData = async () => {
  if (!db) return;

  try {
    // Add default tools if none exist
    const tools = await getAllTools();
    if (tools.length === 0) {
      const defaultTools = [
        { id: 'tool_1', name: 'Plot Visualizer', category: 'Visualization' },
        { id: 'tool_2', name: 'Species Analysis', category: 'Analysis' },
        { id: 'tool_3', name: 'Canopy Analysis', category: 'Analysis' },
        { id: 'tool_4', name: 'Data Visualization', category: 'Visualization' },
        { id: 'tool_5', name: 'Species-Area Curve', category: 'Analysis' },
        { id: 'tool_6', name: 'Botanical Survey', category: 'Field Work' },
        { id: 'tool_7', name: 'Bird Monitoring', category: 'Fauna' },
        { id: 'tool_8', name: 'Bat Survey', category: 'Fauna' },
        { id: 'tool_9', name: 'Habitat Analysis', category: 'Analysis' },
        { id: 'tool_10', name: 'Statistical Modeling', category: 'Analysis' },
      ];

      const transaction = db.transaction([TOOLS_STORE], 'readwrite');
      const objectStore = transaction.objectStore(TOOLS_STORE);

      for (const tool of defaultTools) {
        objectStore.add(tool);
      }
    }

    // Add default data sources if none exist
    const dataSources = await getAllDataSources();
    if (dataSources.length === 0) {
      const defaultDataSources = [
        { id: 'ds_1', name: 'Field Data', type: 'CSV' },
        { id: 'ds_2', name: 'Satellite Imagery', type: 'GeoTIFF' },
        { id: 'ds_3', name: 'Canopy Images', type: 'JPEG' },
        { id: 'ds_4', name: 'Soil Samples', type: 'JSON' },
        { id: 'ds_5', name: 'Water Quality', type: 'CSV' },
        { id: 'ds_6', name: 'Weather Data', type: 'JSON' },
        { id: 'ds_7', name: 'Herb Floor Data', type: 'CSV' },
        { id: 'ds_8', name: 'Woody Vegetation', type: 'CSV' },
        { id: 'ds_9', name: 'Biodiversity Records', type: 'JSON' },
      ];

      const transaction = db.transaction([DATA_SOURCES_STORE], 'readwrite');
      const objectStore = transaction.objectStore(DATA_SOURCES_STORE);

      for (const dataSource of defaultDataSources) {
        objectStore.add(dataSource);
      }
    }

    // Add a default project if none exist
    await initializeDefaultProject();
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Initialize a default project if no projects exist
const initializeDefaultProject = async () => {
  const projects = await getAllProjects();
  if (projects.length === 0) {
    const defaultProject: Project = {
      id: 'proj_1',
      name: 'Default Vegetation Analysis',
      description: 'Initial project for analyzing vegetation data from field surveys.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      tools: ['Plot Visualizer', 'Species Analysis', 'Canopy Analysis'],
      dataSources: [],
      progress: 10,
      totalDataPoints: 0,
      lastSynced: new Date().toISOString(),
    };
    await addProject(defaultProject);
  }
};


// Project operations
export const getAllProjects = async (): Promise<Project[]> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([PROJECTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result as Project[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([PROJECTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.get(id);

    request.onsuccess = () => {
      resolve(request.result as Project | undefined);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addProject = async (project: Project): Promise<Project> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    // Set default values if not provided
    const newProject: Project = {
      ...project,
      progress: project.progress || 0,
      totalDataPoints: project.totalDataPoints || 0,
      lastSynced: project.lastSynced || new Date().toISOString()
    };

    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.add(newProject);

    request.onsuccess = () => {
      resolve(newProject);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const updateProject = async (project: Project): Promise<Project> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.put(project);

    request.onsuccess = () => {
      resolve(project);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Data source operations
export const getAllDataSources = async (): Promise<{ id: string; name: string; type: string }[]> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([DATA_SOURCES_STORE], 'readonly');
    const objectStore = transaction.objectStore(DATA_SOURCES_STORE);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Tool operations
export const getAllTools = async (): Promise<{ id: string; name: string; category: string }[]> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([TOOLS_STORE], 'readonly');
    const objectStore = transaction.objectStore(TOOLS_STORE);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Initialize the database when the module loads
initDB()
  .then(() => console.log('Database initialized successfully'))
  .catch(error => console.error('Failed to initialize database:', error));