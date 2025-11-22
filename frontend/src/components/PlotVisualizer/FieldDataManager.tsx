import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Divider,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    useTheme,
    alpha,
    CircularProgress,
    Tooltip,
    Menu,
    MenuItem,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    ArrowBack as BackIcon,
    Map as MapIcon,
    Forest as ForestIcon,
    FilterList as FilterIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UncheckedIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Edit as EditIcon,
    GridView as GridIcon,
    Nature as TreeIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import PlotVisualizer from './PlotVisualizer';
import FieldEntryModal from './FieldEntryModal';
import { PlotConfiguration } from '../../types/plot';
import { processPlotData, PlotVisualizationData } from './PlotVisualizerService';
import { readCSVFile, parseCSVData } from '../../services/dataImportService';
import { WoodyData, HerbData } from './types';
import { db } from '../../services/db';

// --- Types ---
interface Project {
    id: string;
    name: string;
    description: string;
    date: string;
    plots: PlotRecord[];
}

interface PlotRecord {
    id: string;
    name: string;
    config: PlotConfiguration;
    data: PlotVisualizationData | null;
    status: 'completed' | 'in-progress' | 'pending';
}

interface FieldDataManagerProps {
    embedded?: boolean;
    projectId?: string;
    projectDetails?: {
        name: string;
        description: string;
    };
}

const FieldDataManager: React.FC<FieldDataManagerProps> = (props) => {
    const { embedded = false } = props;
    const theme = useTheme();

    // --- State ---
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
    const [expandedPlotId, setExpandedPlotId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // UI State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(null); // For "Add" button menu

    // Dialog States
    const [isCreatePlotOpen, setIsCreatePlotOpen] = useState(false);
    const [newPlotName, setNewPlotName] = useState('');
    const [isLinkPlotOpen, setIsLinkPlotOpen] = useState(false);
    const [availablePlots, setAvailablePlots] = useState<any[]>([]); // Plots available to link

    // --- Load Data & Sync to DB ---
    const loadData = async () => {
        console.log("FieldDataManager: Loading data...", { props });
        setLoading(true);
        try {
            const LEGACY_PROJECT_UUID = 'LEGACY-PROJECT-UUID';

            // If projectId is provided (Embedded Mode), focus ONLY on that project
            if (props.projectId) {
                console.log(`FieldDataManager: Loading specific project ${props.projectId}`);
                let project = await db.projects.where('uuid').equals(props.projectId).first();

                // If project doesn't exist in local DB but details are provided, create it
                if (!project && props.projectDetails) {
                    console.log(`FieldDataManager: Project ${props.projectId} missing locally, creating...`);
                    await db.projects.add({
                        uuid: props.projectId,
                        name: props.projectDetails.name,
                        description: props.projectDetails.description,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    project = await db.projects.where('uuid').equals(props.projectId).first();
                }

                if (project) {
                    console.log("FieldDataManager: Project found, loading plots...");
                    // Load plots for this project
                    const dbPlots = await db.plots.where('projectId').equals(project.uuid).toArray();
                    const plotsWithData = await Promise.all(dbPlots.map(async (p) => {
                        const trees = await db.trees.where('plotId').equals(p.uuid).toArray();
                        const subplots = await db.subplots.where('plotId').equals(p.uuid).toArray();

                        const visualTrees = trees.map(t => ({
                            id: t.uuid,
                            x: t.x,
                            y: t.y,
                            radius: Math.max(0.15, Math.log(t.gbh || 10) * 0.05),
                            species: t.species,
                            color: '#2e7d32',
                            height: t.height,
                            quadrant: t.quadrant
                        }));

                        return {
                            id: p.uuid,
                            name: p.name,
                            config: {
                                type: 'standard',
                                dimensions: p.dimensions,
                                grid: { rows: 10, cols: 10, labeling: 'sequential' },
                                subdivisions: [
                                    { id: 'SP1', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 0, position_y: 0, relative_to: 'plot_origin', required_data: [] },
                                    { id: 'SP2', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 9, position_y: 0, relative_to: 'plot_origin', required_data: [] },
                                    { id: 'SP3', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 0, position_y: 9, relative_to: 'plot_origin', required_data: [] },
                                    { id: 'SP4', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 9, position_y: 9, relative_to: 'plot_origin', required_data: [] }
                                ]
                            },
                            data: { trees: visualTrees, subplots: subplots },
                            status: 'completed'
                        };
                    }));

                    const uiProject = {
                        id: project.uuid,
                        name: project.name,
                        description: project.description,
                        date: project.updatedAt.toISOString(),
                        plots: plotsWithData as any
                    };

                    setProjects([uiProject]);
                    setActiveProject(uiProject);

                    // Select first plot if available and none selected
                    if (uiProject.plots.length > 0 && !selectedPlotId) {
                        setSelectedPlotId(uiProject.plots[0].id);
                        setExpandedPlotId(uiProject.plots[0].id);
                    }
                }
            } else {
                // Standalone Mode: Load Legacy Data & All Projects
                console.log("FieldDataManager: Standalone mode, checking legacy data...");

                // 1. Check if Legacy Project exists
                const legacyProject = await db.projects.where('uuid').equals(LEGACY_PROJECT_UUID).first();

                if (!legacyProject) {
                    console.log("FieldDataManager: Legacy project missing, seeding from CSVs...");

                    // Create Legacy Project
                    await db.projects.add({
                        uuid: LEGACY_PROJECT_UUID,
                        name: 'Vegetation Survey 2024 (Legacy)',
                        description: 'Imported Field Data',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });

                    const woodyCsv = await readCSVFile('/vegetation-plotting/field-data/woody_vegetation.csv');
                    const herbCsv = await readCSVFile('/vegetation-plotting/field-data/herb_floor_vegetation.csv');
                    const woodyRaw = parseCSVData(woodyCsv) as any[];
                    const herbRaw = parseCSVData(herbCsv) as any[];

                    // Normalize & Sync Trees
                    const normWoody: WoodyData[] = woodyRaw.map(r => ({
                        Plot_ID: r.Plot_ID,
                        Location_Name: r.Location_Name,
                        Quad_ID: r.Quad_ID,
                        Species_Scientific: r.Species_Scientific,
                        Growth_Form: r.Growth_Form,
                        Tree_ID: r.Tree_ID,
                        Total_GBH_cm: parseFloat(r.Total_GBH_cm) || 0,
                        Height_m: parseFloat(r.Height_m) || undefined
                    }));

                    const uniquePlotIds = Array.from(new Set(normWoody.map(d => d.Plot_ID)));

                    // Create Plots in DB
                    for (const pid of uniquePlotIds) {
                        const plotUUID = crypto.randomUUID();
                        await db.plots.add({
                            uuid: plotUUID,
                            projectId: LEGACY_PROJECT_UUID,
                            name: `Plot ${pid}`,
                            dimensions: { width: 10, height: 10, unit: 'm' },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });

                        // Add Trees for this plot
                        const plotTrees = normWoody.filter(d => d.Plot_ID === pid);
                        const treeRecords = plotTrees.map(t => ({
                            uuid: crypto.randomUUID(),
                            plotId: plotUUID, // Link to the new Plot UUID
                            quadrant: t.Quad_ID,
                            tagId: t.Tree_ID,
                            species: t.Species_Scientific,
                            gbh: t.Total_GBH_cm,
                            height: t.Height_m || 0,
                            condition: 'Healthy', // Default
                            phenology: 'Leafing', // Default
                            x: Math.random() * 10, // Placeholder X (Random for now, user will adjust)
                            y: Math.random() * 10, // Placeholder Y
                            updatedAt: new Date()
                        }));
                        await db.trees.bulkAdd(treeRecords as any);

                        // Add Subplots (Herbs) for this plot
                        const plotHerbs = herbRaw.filter(h => h.Plot_ID === pid);
                        const subplotMap: Record<string, string> = { 'SP1': 'Q1', 'SP2': 'Q2', 'SP3': 'Q3', 'SP4': 'Q4' };

                        const subplotRecords = ['Q1', 'Q2', 'Q3', 'Q4'].map(quad => {
                            const spId = Object.keys(subplotMap).find(key => subplotMap[key] === quad);
                            const spRows = plotHerbs.filter(h => h.Subplot_ID === spId);

                            const herbRow = spRows.find(r => r.Layer_Type === 'Herb');
                            const shrubRow = spRows.find(r => r.Layer_Type === 'Shrub');
                            const species = Array.from(new Set(spRows.map(r => r.Species_or_Category).filter(s => s && s !== 'Bare Ground' && s !== 'Litter')));

                            return {
                                uuid: crypto.randomUUID(),
                                plotId: plotUUID,
                                type: '1x1',
                                corner: quad,
                                herbCount: herbRow ? parseFloat(herbRow['Count_or_Cover%'] || '0') : 0,
                                shrubCount: shrubRow ? parseFloat(shrubRow['Count_or_Cover%'] || '0') : 0,
                                dominantSpecies: species,
                                groundCover: 0,
                                updatedAt: new Date()
                            };
                        });
                        await db.subplots.bulkAdd(subplotRecords as any);
                    }
                }

                // 2. Load Projects and Plots from DB
                const allProjects = await db.projects.toArray();

                // Transform to UI format
                const uiProjects = await Promise.all(allProjects.map(async (proj) => {
                    const dbPlots = await db.plots.where('projectId').equals(proj.uuid).toArray();

                    const plotsWithData = await Promise.all(dbPlots.map(async (p) => {
                        const trees = await db.trees.where('plotId').equals(p.uuid).toArray();
                        const subplots = await db.subplots.where('plotId').equals(p.uuid).toArray();

                        const visualTrees = trees.map(t => ({
                            id: t.uuid,
                            x: t.x,
                            y: t.y,
                            radius: Math.max(0.15, Math.log(t.gbh || 10) * 0.05),
                            species: t.species,
                            color: '#2e7d32',
                            height: t.height,
                            quadrant: t.quadrant
                        }));

                        return {
                            id: p.uuid,
                            name: p.name,
                            config: {
                                type: 'standard',
                                dimensions: p.dimensions,
                                grid: { rows: 10, cols: 10, labeling: 'sequential' },
                                subdivisions: [
                                    { id: 'SP1', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 0, position_y: 0, relative_to: 'plot_origin', required_data: [] },
                                    { id: 'SP2', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 9, position_y: 0, relative_to: 'plot_origin', required_data: [] },
                                    { id: 'SP3', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 0, position_y: 9, relative_to: 'plot_origin', required_data: [] },
                                    { id: 'SP4', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 9, position_y: 9, relative_to: 'plot_origin', required_data: [] }
                                ]
                            },
                            data: { trees: visualTrees, subplots: subplots },
                            status: 'completed'
                        };
                    }));

                    return {
                        id: proj.uuid,
                        name: proj.name,
                        description: proj.description,
                        date: proj.updatedAt.toISOString(),
                        plots: plotsWithData as any
                    };
                }));

                setProjects(uiProjects);

                // Set active project (default to Legacy if exists, or first available)
                if (uiProjects.length > 0 && !activeProject) {
                    const legacy = uiProjects.find(p => p.id === LEGACY_PROJECT_UUID);
                    const target = legacy || uiProjects[0];
                    setActiveProject(target);

                    if (target.plots.length > 0 && !selectedPlotId) {
                        setSelectedPlotId(target.plots[0].id);
                        setExpandedPlotId(target.plots[0].id);
                    }
                }
            }

        } catch (err) {
            console.error("FieldDataManager: Failed to load data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [props.projectId]);

    // --- Actions ---

    const handleCreatePlot = async () => {
        if (!newPlotName || !activeProject) return;
        console.log(`FieldDataManager: Creating new plot '${newPlotName}' for project ${activeProject.id}`);

        try {
            const plotUUID = crypto.randomUUID();
            await db.plots.add({
                uuid: plotUUID,
                projectId: activeProject.id,
                name: newPlotName,
                dimensions: { width: 10, height: 10, unit: 'm' },
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Refresh
            await loadData();
            setIsCreatePlotOpen(false);
            setNewPlotName('');
            setSelectedPlotId(plotUUID); // Select the new plot
        } catch (err) {
            console.error("FieldDataManager: Failed to create plot", err);
        }
    };

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !activeProject) return;
        console.log(`FieldDataManager: Importing CSV '${file.name}' into project ${activeProject.id}`);

        try {
            const text = await file.text();
            const rawData = parseCSVData(text) as any[];
            console.log(`FieldDataManager: Parsed ${rawData.length} rows`);

            // Heuristic to detect if it's woody or herb data
            // Assuming woody data has 'Tree_ID' or 'GBH'
            const isWoody = rawData.some(r => r.Tree_ID || r.Total_GBH_cm);

            if (isWoody) {
                // Normalize
                const normWoody: WoodyData[] = rawData.map(r => ({
                    Plot_ID: r.Plot_ID,
                    Location_Name: r.Location_Name,
                    Quad_ID: r.Quad_ID,
                    Species_Scientific: r.Species_Scientific,
                    Growth_Form: r.Growth_Form,
                    Tree_ID: r.Tree_ID,
                    Total_GBH_cm: parseFloat(r.Total_GBH_cm) || 0,
                    Height_m: parseFloat(r.Height_m) || undefined
                }));

                const uniquePlotIds = Array.from(new Set(normWoody.map(d => d.Plot_ID)));

                for (const pid of uniquePlotIds) {
                    // Check if plot exists in THIS project, else create
                    let plot = await db.plots.where({ projectId: activeProject.id, name: `Plot ${pid}` }).first();
                    let plotUUID = plot?.uuid;

                    if (!plot) {
                        plotUUID = crypto.randomUUID();
                        await db.plots.add({
                            uuid: plotUUID,
                            projectId: activeProject.id,
                            name: `Plot ${pid}`,
                            dimensions: { width: 10, height: 10, unit: 'm' },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }

                    // Add Trees
                    const plotTrees = normWoody.filter(d => d.Plot_ID === pid);
                    const treeRecords = plotTrees.map(t => ({
                        uuid: crypto.randomUUID(),
                        plotId: plotUUID,
                        quadrant: t.Quad_ID,
                        tagId: t.Tree_ID,
                        species: t.Species_Scientific,
                        gbh: t.Total_GBH_cm,
                        height: t.Height_m || 0,
                        condition: 'Healthy',
                        phenology: 'Leafing',
                        x: Math.random() * 10,
                        y: Math.random() * 10,
                        updatedAt: new Date()
                    }));
                    await db.trees.bulkAdd(treeRecords as any);
                }
            } else {
                // Handle Herb/Other data... (Simplified for now)
                console.log("FieldDataManager: Imported data seems to be non-woody. Implementation pending for generic CSV.");
            }

            await loadData();
            alert("Import successful!");
        } catch (err) {
            console.error("FieldDataManager: Import failed", err);
            alert("Import failed. Check console for details.");
        }
    };

    const handleOpenLinkPlot = async () => {
        if (!activeProject) return;
        console.log("FieldDataManager: Fetching available plots for linking...");

        // Get all plots NOT in current project
        const allPlots = await db.plots.toArray();
        const currentPlotIds = activeProject.plots.map(p => p.id);
        const available = allPlots.filter(p => !currentPlotIds.includes(p.uuid));

        setAvailablePlots(available);
        setIsLinkPlotOpen(true);
        setAddMenuAnchorEl(null);
    };

    const handleLinkPlot = async (plot: any) => {
        if (!activeProject) return;
        console.log(`FieldDataManager: Linking plot ${plot.uuid} to project ${activeProject.id}`);

        try {
            // We can either COPY the plot or MOVE it. 
            // For now, let's COPY it (Deep Copy) to avoid shared state issues between projects.

            const newPlotUUID = crypto.randomUUID();

            // 1. Copy Plot
            await db.plots.add({
                ...plot,
                id: undefined, // Let DB auto-increment
                uuid: newPlotUUID,
                projectId: activeProject.id,
                updatedAt: new Date()
            });

            // 2. Copy Trees
            const trees = await db.trees.where('plotId').equals(plot.uuid).toArray();
            const newTrees = trees.map(t => ({ ...t, id: undefined, uuid: crypto.randomUUID(), plotId: newPlotUUID }));
            await db.trees.bulkAdd(newTrees as any);

            // 3. Copy Subplots
            const subplots = await db.subplots.where('plotId').equals(plot.uuid).toArray();
            const newSubplots = subplots.map(s => ({ ...s, id: undefined, uuid: crypto.randomUUID(), plotId: newPlotUUID }));
            await db.subplots.bulkAdd(newSubplots as any);

            await loadData();
            setIsLinkPlotOpen(false);
        } catch (err) {
            console.error("FieldDataManager: Failed to link plot", err);
        }
    };

    // --- Edit State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState(0);
    const [initialQuadrant, setInitialQuadrant] = useState<string | undefined>(undefined);

    // --- Helpers ---
    const activePlot = activeProject?.plots.find(p => p.id === selectedPlotId);
    const filteredPlots = activeProject?.plots.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handlePlotClick = (plotId: string) => {
        setSelectedPlotId(plotId);
        setExpandedPlotId(prev => prev === plotId ? null : plotId);
    };

    const handleEdit = (e: React.MouseEvent, type: 'plot' | 'quadrant' | 'tree', id: string) => {
        e.stopPropagation();
        // Map type to tab index: plot -> 0 (General), quadrant -> 1 (Quadrants), tree -> 2 (Trees)
        const tabMap = { plot: 0, quadrant: 1, tree: 2 };
        setModalTab(tabMap[type]);

        // Handle Sub-item IDs (e.g., "PLOT_UUID-Q1")
        if (id.includes('-Q')) {
            // Extract Quadrant if present
            const quadMatch = id.match(/(Q[1-4])/);
            if (quadMatch) {
                setInitialQuadrant(quadMatch[1]);
            } else {
                setInitialQuadrant(undefined);
            }

            // Ensure parent plot is selected
            const plotId = id.split('-')[0];
            setSelectedPlotId(plotId);
        } else {
            setInitialQuadrant(undefined);
            if (id.includes('-')) {
                const plotId = id.split('-')[0];
                setSelectedPlotId(plotId);
            } else {
                setSelectedPlotId(id);
            }
        }

        setIsModalOpen(true);
    };

    // --- Render ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>
            {/* Create Plot Dialog */}
            <Dialog open={isCreatePlotOpen} onClose={() => setIsCreatePlotOpen(false)}>
                <DialogTitle>Create New Plot</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Plot Name"
                        fullWidth
                        variant="outlined"
                        value={newPlotName}
                        onChange={(e) => setNewPlotName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsCreatePlotOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreatePlot} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Link Plot Dialog */}
            <Dialog open={isLinkPlotOpen} onClose={() => setIsLinkPlotOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Link Existing Plot</DialogTitle>
                <DialogContent>
                    {availablePlots.length === 0 ? (
                        <Typography color="text.secondary">No other plots available to link.</Typography>
                    ) : (
                        <List>
                            {availablePlots.map((plot) => (
                                <ListItemButton key={plot.uuid} onClick={() => handleLinkPlot(plot)}>
                                    <ListItemText
                                        primary={plot.name}
                                        secondary={`ID: ${plot.uuid.substring(0, 8)}...`}
                                    />
                                    <AddIcon color="primary" />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsLinkPlotOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Field Entry Modal */}
            {selectedPlotId && (
                <FieldEntryModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    plotId={selectedPlotId}
                    initialTab={modalTab}
                    initialQuadrant={initialQuadrant}
                />
            )}

            {/* LEFT PANEL: Plot List */}
            <Paper
                elevation={0}
                sx={{
                    width: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    zIndex: 2
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        PROJECT
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: 200 }}>
                            {activeProject?.name || 'Select Project'}
                        </Typography>
                        <IconButton size="small" onClick={async () => {
                            const name = prompt("Enter new project name:");
                            if (name) {
                                const newProjId = crypto.randomUUID();
                                await db.projects.add({
                                    uuid: newProjId,
                                    name: name,
                                    description: 'New Project',
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                });
                                window.location.reload(); // Simple reload to refresh state
                            }
                        }}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search plots..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </Box>

                {/* List */}
                <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                    {filteredPlots.map((plot) => (
                        <React.Fragment key={plot.id}>
                            <ListItemButton
                                selected={selectedPlotId === plot.id}
                                onClick={() => handlePlotClick(plot.id)}
                                sx={{
                                    py: 1.5,
                                    borderLeft: '4px solid',
                                    borderColor: selectedPlotId === plot.id ? 'primary.main' : 'transparent',
                                    '&.Mui-selected': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    {plot.status === 'completed' ?
                                        <CheckCircleIcon fontSize="small" color="success" /> :
                                        <UncheckedIcon fontSize="small" color="disabled" />
                                    }
                                </ListItemIcon>
                                <ListItemText
                                    primary={plot.name}
                                    secondary={`${plot.data?.trees.length || 0} Trees`}
                                    primaryTypographyProps={{ fontWeight: selectedPlotId === plot.id ? 600 : 400 }}
                                />
                                <IconButton size="small" onClick={(e) => handleEdit(e, 'plot', plot.id)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                {expandedPlotId === plot.id ? <ExpandLessIcon color="action" /> : <ExpandMoreIcon color="action" />}
                            </ListItemButton>

                            {/* Nested Hierarchy */}
                            <Collapse in={expandedPlotId === plot.id} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {['Q1', 'Q2', 'Q3', 'Q4'].map((quad) => {
                                        const treeCount = plot.data?.trees.filter(t => t.quadrant === quad).length || 0;
                                        return (
                                            <React.Fragment key={quad}>
                                                <ListItemButton sx={{ pl: 4, py: 0.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                                        <GridIcon fontSize="small" sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={`Quadrant ${quad}`}
                                                        secondary={`${treeCount} Trees`}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                        secondaryTypographyProps={{ variant: 'caption' }}
                                                    />
                                                    <IconButton size="small" onClick={(e) => handleEdit(e, 'quadrant', `${plot.id}-${quad}`)}>
                                                        <EditIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </ListItemButton>
                                                {/* Deepest Level: Trees (Summary) */}
                                                <ListItemButton sx={{ pl: 8, py: 0.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                                        <TreeIcon fontSize="small" sx={{ fontSize: 16, color: 'success.main' }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Trees Data"
                                                        secondary="View List"
                                                        primaryTypographyProps={{ variant: 'caption', fontWeight: 500 }}
                                                    />
                                                    <IconButton size="small" onClick={(e) => handleEdit(e, 'tree', `${plot.id}-${quad}-trees`)}>
                                                        <EditIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </ListItemButton>
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            </Collapse>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>

                {/* Footer Actions */}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={(e) => setAddMenuAnchorEl(e.currentTarget)}
                    >
                        Add
                    </Button>
                    <Menu
                        anchorEl={addMenuAnchorEl}
                        open={Boolean(addMenuAnchorEl)}
                        onClose={() => setAddMenuAnchorEl(null)}
                    >
                        <MenuItem onClick={() => {
                            setAddMenuAnchorEl(null);
                            setIsCreatePlotOpen(true);
                        }}>
                            <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                            Create New Plot
                        </MenuItem>
                        <MenuItem onClick={() => {
                            // Trigger hidden file input
                            document.getElementById('csv-upload-input')?.click();
                            setAddMenuAnchorEl(null);
                        }}>
                            <ListItemIcon><GridIcon fontSize="small" /></ListItemIcon>
                            Import CSV Data
                        </MenuItem>
                        <MenuItem onClick={handleOpenLinkPlot}>
                            <ListItemIcon><MapIcon fontSize="small" /></ListItemIcon>
                            Import Existing Plot
                        </MenuItem>
                    </Menu>
                    {/* Hidden File Input for CSV Import */}
                    <input
                        type="file"
                        id="csv-upload-input"
                        style={{ display: 'none' }}
                        accept=".csv"
                        onChange={handleImportCSV}
                    />
                </Box>
            </Paper>

            {/* RIGHT PANEL: Visualizer */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                {/* Toolbar */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {activePlot?.name || 'No Plot Selected'}
                        </Typography>
                        {activePlot && (
                            <Chip
                                label={activePlot.status === 'completed' ? 'Completed' : 'In Progress'}
                                color={activePlot.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                            />
                        )}
                        {activePlot && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<SaveIcon />}
                                onClick={() => {
                                    // In a real app, this might trigger a sync to backend
                                    // For now, since we use live IndexedDB, data is auto-saved.
                                    // We can just show a success message or trigger a specific 'commit' action.
                                    alert('All changes saved to local database!');
                                }}
                            >
                                Save Plot
                            </Button>
                        )}
                    </Box>
                    <Box>
                        <Tooltip title="Filter Layers">
                            <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}><FilterIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="More Options">
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVertIcon /></IconButton>
                        </Tooltip>

                        {/* Menus */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                        >
                            <MenuItem onClick={() => setAnchorEl(null)}>Export Plot Data</MenuItem>
                            <MenuItem onClick={() => setAnchorEl(null)}>Plot Settings</MenuItem>
                            <Divider />
                            <MenuItem onClick={async () => {
                                if (window.confirm("Are you sure? This will delete all local changes and reload from CSVs.")) {
                                    await db.delete();
                                    await db.open();
                                    window.location.reload();
                                }
                            }} sx={{ color: 'error.main' }}>Reset Data (Reload CSVs)</MenuItem>
                        </Menu>

                        <Menu
                            anchorEl={filterAnchorEl}
                            open={Boolean(filterAnchorEl)}
                            onClose={() => setFilterAnchorEl(null)}
                        >
                            <MenuItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                                Show Trees
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                                Show Subplots
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="primary" /></ListItemIcon>
                                Show Grid
                            </MenuItem>
                        </Menu>
                    </Box>
                </Paper>

                {/* Canvas Area */}
                <Box sx={{
                    flexGrow: 1,
                    bgcolor: '#f5f5f7', // Neutral background for map
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    overflow: 'auto'
                }}>
                    {activePlot && activePlot.data ? (
                        <Paper
                            elevation={3}
                            sx={{
                                width: '100%',
                                maxWidth: 800, // Limit max width for better readability
                                aspectRatio: '1/1',
                                borderRadius: 4,
                                overflow: 'hidden',
                                bgcolor: 'white'
                            }}
                        >
                            <PlotVisualizer
                                config={activePlot.config}
                                trees={activePlot.data.trees}
                                subplots={activePlot.data.subplots || []}
                                interactionMode="view"
                                highlightedSpecies={null}
                                selectedTreeIds={[]}
                                onTreeSelect={() => { }}
                                onTreeMove={() => { }}
                            />
                        </Paper>
                    ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            <ForestIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6">Select a plot to view details</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

        </Box>
    );
};

export default FieldDataManager;
