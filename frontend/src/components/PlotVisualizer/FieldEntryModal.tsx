import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Tabs,
    Tab,
    Box,
    TextField,
    Grid,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Autocomplete,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
    Divider,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    CameraAlt as CameraIcon
} from '@mui/icons-material';
import { db, TreeDB, SubplotDB } from '../../services/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface FieldEntryModalProps {
    open: boolean;
    onClose: () => void;
    plotId: string; // UUID
    initialTab?: number;
    initialQuadrant?: string;
}

// --- Bulk Tree Editor Component ---
const BulkTreeEditor: React.FC<{ plotId: string, quadrant: string }> = ({ plotId, quadrant }) => {
    const [rows, setRows] = useState<Partial<TreeDB>[]>([]);
    const [speciesList, setSpeciesList] = useState<string[]>([]);

    // Load existing trees for this specific quadrant
    useLiveQuery(async () => {
        if (!plotId) return;
        const trees = await db.trees
            .where('plotId').equals(plotId)
            .filter(t => t.quadrant === quadrant)
            .toArray();

        if (trees.length > 0) {
            setRows(trees);
        } else {
            // Add one empty row if none exist
            // handleAddRow(); // Don't auto-add row, let user decide
            setRows([]);
        }

        // Load unique species for autocomplete
        const allTrees = await db.trees.toArray();
        const uniqueSpecies = Array.from(new Set(allTrees.map(t => t.species))).sort();
        setSpeciesList(uniqueSpecies);
    }, [plotId, quadrant]);

    const handleAddRow = () => {
        setRows([...rows, {
            uuid: crypto.randomUUID(),
            plotId,
            quadrant: quadrant,
            tagId: '',
            species: '',
            gbh: 0,
            height: 0,
            condition: 'Healthy',
            phenology: 'Leafing',
            x: 5,
            y: 5,
            updatedAt: new Date()
        }]);
    };

    const handleChange = (index: number, field: keyof TreeDB, value: any) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    const handleDelete = async (index: number) => {
        const row = rows[index];
        if (row.id) {
            await db.trees.delete(row.id);
        }
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleSave = async () => {
        const validRows = rows.filter(r => r.species && (r.gbh || 0) > 0);
        if (validRows.length === 0 && rows.length > 0) {
            alert("Please enter at least Species and GBH.");
            return;
        }
        await db.trees.bulkPut(validRows as TreeDB[]);
        alert('Trees saved!');
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">Trees in {quadrant}</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddRow}>Add Tree</Button>
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Tag ID</TableCell>
                            <TableCell width={200}>Species</TableCell>
                            <TableCell>GBH (cm)</TableCell>
                            <TableCell>Height (m)</TableCell>
                            <TableCell>Condition</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                                    No trees recorded in this quadrant yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            value={row.tagId || ''}
                                            onChange={(e) => handleChange(index, 'tagId', e.target.value)}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                            placeholder="Tag"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Autocomplete
                                            freeSolo
                                            options={speciesList}
                                            value={row.species || ''}
                                            onInputChange={(_, val) => handleChange(index, 'species', val)}
                                            renderInput={(params) => (
                                                <TextField {...params} variant="standard" placeholder="Species" InputProps={{ ...params.InputProps, disableUnderline: true }} />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={row.gbh || ''}
                                            onChange={(e) => handleChange(index, 'gbh', parseFloat(e.target.value))}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                            placeholder="0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={row.height || ''}
                                            onChange={(e) => handleChange(index, 'height', parseFloat(e.target.value))}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                            placeholder="0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={row.condition || 'Healthy'}
                                            onChange={(e) => handleChange(index, 'condition', e.target.value)}
                                            variant="standard"
                                            disableUnderline
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            {['Healthy', 'Degraded', 'Dead', 'Sapling', 'Coppice'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave}>Save Trees</Button>
            </Box>
        </Box>
    );
};

// --- Quadrant Editor Component ---
const QuadrantEditor: React.FC<{ plotId: string, quadrant: string }> = ({ plotId, quadrant }) => {
    const [subplot, setSubplot] = useState<Partial<SubplotDB>>({});

    // Load existing subplot data
    useLiveQuery(async () => {
        if (!plotId) return;
        const existing = await db.subplots
            .where('plotId').equals(plotId)
            .filter(s => s.corner === quadrant)
            .first();

        if (existing) {
            setSubplot(existing);
        } else {
            setSubplot({
                uuid: crypto.randomUUID(),
                plotId,
                type: '1x1',
                corner: quadrant as any,
                herbCount: 0,
                shrubCount: 0,
                dominantSpecies: [],
                groundCover: 0
            });
        }
    }, [plotId, quadrant]);

    const handleSaveSubplot = async () => {
        if (subplot.uuid) {
            await db.subplots.put({ ...subplot, updatedAt: new Date() } as SubplotDB);
            alert('Subplot data saved!');
        }
    };

    return (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">Quadrant {quadrant} Editor</Typography>

            {/* Subplot Data Section */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Subplot (Herb/Shrub) Data</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                            label="Herb Count"
                            type="number"
                            size="small"
                            fullWidth
                            value={subplot.herbCount || ''}
                            onChange={(e) => setSubplot({ ...subplot, herbCount: parseInt(e.target.value) })}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                            label="Shrub Count"
                            type="number"
                            size="small"
                            fullWidth
                            value={subplot.shrubCount || ''}
                            onChange={(e) => setSubplot({ ...subplot, shrubCount: parseInt(e.target.value) })}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                            label="Ground Cover %"
                            type="number"
                            size="small"
                            fullWidth
                            value={subplot.groundCover || ''}
                            onChange={(e) => setSubplot({ ...subplot, groundCover: parseFloat(e.target.value) })}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Button variant="outlined" fullWidth startIcon={<SaveIcon />} onClick={handleSaveSubplot} sx={{ height: '100%' }}>
                            Save Subplot
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Dominant Species (comma separated)"
                            size="small"
                            fullWidth
                            value={subplot.dominantSpecies?.join(', ') || ''}
                            onChange={(e) => setSubplot({ ...subplot, dominantSpecies: e.target.value.split(',').map(s => s.trim()) })}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* Tree Data Section */}
            <BulkTreeEditor plotId={plotId} quadrant={quadrant} />
        </Box>
    );
};

// --- Main Modal ---
const FieldEntryModal: React.FC<FieldEntryModalProps> = ({ open, onClose, plotId, initialTab = 0, initialQuadrant }) => {
    const [tabIndex, setTabIndex] = useState(initialTab);
    const [activeQuadrant, setActiveQuadrant] = useState<string>(initialQuadrant || 'Q1');
    const [plotMetadata, setPlotMetadata] = useState<any>({});

    // If initialQuadrant is provided, we are in "Granular Mode".
    // If not, we are in "Mega Form Mode".
    const isGranularMode = !!initialQuadrant;

    useLiveQuery(async () => {
        if (plotId) {
            const plot = await db.plots.where('uuid').equals(plotId).first();
            if (plot) {
                setPlotMetadata(plot);
            }
        }
    }, [plotId]);

    useEffect(() => {
        if (initialQuadrant) {
            setActiveQuadrant(initialQuadrant);
            // If granular, we might want to skip the tabs and just show the editor
        }
        setTabIndex(initialTab);
    }, [initialTab, initialQuadrant]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                {isGranularMode ? `Edit Quadrant ${activeQuadrant}` : 'Field Data Entry (Mega Form)'}
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            {!isGranularMode && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} centered>
                        <Tab label="General Info" />
                        <Tab label="Quadrants & Trees" />
                        <Tab label="Photos" />
                    </Tabs>
                </Box>
            )}

            <DialogContent sx={{ p: 3 }}>
                {/* Granular Mode: Direct Quadrant Edit */}
                {isGranularMode && (
                    <QuadrantEditor plotId={plotId} quadrant={activeQuadrant} />
                )}

                {/* Mega Form Mode */}
                {!isGranularMode && tabIndex === 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Plot Metadata</Typography>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={async () => {
                                if (plotMetadata.uuid) {
                                    await db.plots.put(plotMetadata as any);
                                    alert('Plot metadata saved!');
                                }
                            }}>
                                Save Metadata
                            </Button>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Surveyor Name"
                                    value={plotMetadata.surveyor || ''}
                                    onChange={(e) => setPlotMetadata({ ...plotMetadata, surveyor: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Survey Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={plotMetadata.date ? plotMetadata.date.split('T')[0] : ''}
                                    onChange={(e) => setPlotMetadata({ ...plotMetadata, date: new Date(e.target.value).toISOString() })}
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Slope (degrees)"
                                    value={plotMetadata.slope || ''}
                                    onChange={(e) => setPlotMetadata({ ...plotMetadata, slope: parseFloat(e.target.value) })}
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Aspect (N, NE, etc.)"
                                    value={plotMetadata.aspect || ''}
                                    onChange={(e) => setPlotMetadata({ ...plotMetadata, aspect: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Weather"
                                    value={plotMetadata.weather || ''}
                                    onChange={(e) => setPlotMetadata({ ...plotMetadata, weather: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {!isGranularMode && tabIndex === 1 && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Select a quadrant below to edit its Subplot and Tree data.
                        </Alert>
                        <Grid container spacing={2}>
                            {['Q1', 'Q2', 'Q3', 'Q4'].map((quad) => (
                                <Grid size={{ xs: 12, md: 6 }} key={quad}>
                                    <QuadrantEditor plotId={plotId} quadrant={quad} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {!isGranularMode && tabIndex === 2 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CameraIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">Photo Gallery Coming Soon</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }}>Upload Photo</Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FieldEntryModal;
