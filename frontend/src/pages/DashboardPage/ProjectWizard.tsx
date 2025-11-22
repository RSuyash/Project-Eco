import React, { useState, useEffect } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Paper,
    Container,
    TextField,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Chip,
    Stack,
    useTheme,
    alpha,
    Fade,
    CircularProgress
} from '@mui/material';
import {
    Forest,
    Park,
    Science,
    Landscape,
    WaterDrop,
    CheckCircle,
    ArrowForward,
    ArrowBack,
    Save
} from '@mui/icons-material';
import { Project, Tool, DataSource } from '../../types';

// --- Types ---
export interface WizardData {
    name: string;
    description: string;
    type: string;
    tools: string[];
    dataSources: string[];
}

interface ProjectWizardProps {
    initialData?: Partial<WizardData>;
    availableTools: Tool[];
    availableDataSources: DataSource[];
    onComplete: (data: WizardData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

// --- Constants ---
const STEPS = ['Project Identity', 'Project Type', 'Configuration', 'Review'];

const PROJECT_TYPES = [
    { id: 'ecological', label: 'Ecological Analysis', icon: Forest, desc: 'Vegetation patterns, biodiversity indices, and species dominance.' },
    { id: 'conservation', label: 'Conservation Study', icon: Park, desc: 'Protected area monitoring, threat assessment, and habitat quality.' },
    { id: 'monitoring', label: 'Env. Monitoring', icon: WaterDrop, desc: 'Long-term changes in soil, water, and air quality parameters.' },
    { id: 'research', label: 'Research Project', icon: Science, desc: 'Custom experimental designs and hypothesis testing.' },
    { id: 'restoration', label: 'Restoration', icon: Landscape, desc: 'Tracking recovery of degraded ecosystems over time.' },
];

// --- Sub-Components ---

const StepIdentity = ({ data, onChange }: { data: WizardData, onChange: (d: Partial<WizardData>) => void }) => (
    <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Let's start with the basics.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Give your project a name and a brief description to help your team identify it.
        </Typography>

        <Grid container spacing={3}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Project Name"
                    value={data.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    variant="outlined"
                    placeholder="e.g., Nanded City Vegetation Survey 2024"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Description"
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Describe the goals and scope of this project..."
                />
            </Grid>
        </Grid>
    </Box>
);

const StepType = ({ data, onChange }: { data: WizardData, onChange: (d: Partial<WizardData>) => void }) => {
    const theme = useTheme();

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>What kind of project is this?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Select the template that best fits your needs. This will configure default tools and views.
            </Typography>

            <Grid container spacing={2}>
                {PROJECT_TYPES.map((type) => {
                    const isSelected = data.type === type.id;
                    const Icon = type.icon;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={type.id}>
                            <Card
                                elevation={isSelected ? 4 : 1}
                                sx={{
                                    height: '100%',
                                    border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <CardActionArea
                                    onClick={() => onChange({ type: type.id })}
                                    sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                                >
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: isSelected ? 'primary.main' : 'action.hover',
                                        color: isSelected ? 'white' : 'text.secondary',
                                        mb: 2
                                    }}>
                                        <Icon fontSize="medium" />
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {type.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {type.desc}
                                    </Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

const StepConfig = ({
    data,
    onChange,
    tools,
    dataSources
}: {
    data: WizardData,
    onChange: (d: Partial<WizardData>) => void,
    tools: Tool[],
    dataSources: DataSource[]
}) => {
    const theme = useTheme();

    const toggleItem = (list: string[], item: string) => {
        return list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Configure your workspace.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Select the tools and data sources you'll be using. You can always change this later.
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                        ANALYSIS TOOLS
                    </Typography>
                    <Stack spacing={1}>
                        {tools.map(tool => {
                            const isSelected = data.tools.includes(tool.name);
                            return (
                                <Paper
                                    key={tool.id}
                                    variant="outlined"
                                    onClick={() => onChange({ tools: toggleItem(data.tools, tool.name) })}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{tool.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{tool.category}</Typography>
                                    </Box>
                                    {isSelected && <CheckCircle color="primary" fontSize="small" />}
                                </Paper>
                            );
                        })}
                    </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: 'secondary.main' }}>
                        DATA SOURCES
                    </Typography>
                    <Stack spacing={1}>
                        {dataSources.map(ds => {
                            const isSelected = data.dataSources.includes(ds.name);
                            return (
                                <Paper
                                    key={ds.id}
                                    variant="outlined"
                                    onClick={() => onChange({ dataSources: toggleItem(data.dataSources, ds.name) })}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        borderColor: isSelected ? 'secondary.main' : 'divider',
                                        bgcolor: isSelected ? alpha(theme.palette.secondary.main, 0.04) : 'background.paper',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{ds.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{ds.type}</Typography>
                                    </Box>
                                    {isSelected && <CheckCircle color="secondary" fontSize="small" />}
                                </Paper>
                            );
                        })}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

const StepReview = ({ data }: { data: WizardData }) => {
    const typeLabel = PROJECT_TYPES.find(t => t.id === data.type)?.label || data.type;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Ready to launch?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Review your project details below.
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">PROJECT NAME</Typography>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>{data.name}</Typography>
                        <Typography variant="body1" color="text.secondary">{data.description || 'No description provided.'}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">TYPE</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Chip label={typeLabel} color="primary" variant="outlined" />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        {/* Spacer */}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">SELECTED TOOLS ({data.tools.length})</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {data.tools.map(t => <Chip key={t} label={t} size="small" />)}
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">DATA SOURCES ({data.dataSources.length})</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {data.dataSources.map(ds => <Chip key={ds} label={ds} size="small" />)}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

// --- Main Component ---

const ProjectWizard: React.FC<ProjectWizardProps> = ({
    initialData,
    availableTools,
    availableDataSources,
    onComplete,
    onCancel,
    isSubmitting
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [data, setData] = useState<WizardData>({
        name: '',
        description: '',
        type: 'ecological',
        tools: [],
        dataSources: [],
        ...initialData
    });

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const isStepValid = () => {
        switch (activeStep) {
            case 0: return data.name.trim().length > 0;
            case 1: return !!data.type;
            default: return true;
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    minHeight: 600,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ flexGrow: 1 }}>
                    <Fade in={true} key={activeStep}>
                        <Box>
                            {activeStep === 0 && <StepIdentity data={data} onChange={(d) => setData({ ...data, ...d })} />}
                            {activeStep === 1 && <StepType data={data} onChange={(d) => setData({ ...data, ...d })} />}
                            {activeStep === 2 && <StepConfig data={data} onChange={(d) => setData({ ...data, ...d })} tools={availableTools} dataSources={availableDataSources} />}
                            {activeStep === 3 && <StepReview data={data} />}
                        </Box>
                    </Fade>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        color="inherit"
                        disabled={activeStep === 0 || isSubmitting}
                        onClick={handleBack}
                        startIcon={<ArrowBack />}
                    >
                        Back
                    </Button>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button color="inherit" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>

                        {activeStep === STEPS.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={() => onComplete(data)}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Project'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                endIcon={<ArrowForward />}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProjectWizard;
