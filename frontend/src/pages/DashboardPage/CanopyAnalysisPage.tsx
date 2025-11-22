// src/pages/DashboardPage/CanopyAnalysisPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  alpha,
  useTheme,
  Fade,
  Skeleton,
  Dialog,
  DialogContent,
  Slider,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Analytics,
  Assessment,
  FileDownload,
  Delete,
  Refresh,
  CompareArrows,
  Close,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  ArrowBack,
  Layers,
  BarChart,
  PieChart,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { getProjectById } from '../../services/dbService';
import { analyzeCanopyPhoto, CanopyAnalysisResult, loadExistingCanopyImages } from '../../services/canopyAnalysisService';
import { initializeImageMetadataWithCSVData } from '../../services/imageMetadataService';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  plotId: string;
  quadrantId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: CanopyAnalysisResult;
  error?: string;
}

const WORKFLOW_STEPS = ['Upload Images', 'Process & Analyze', 'Review Results', 'Export Data'];

const CanopyAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  // State
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);

  // Load project
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const dbProject = await getProjectById(id!);
        if (dbProject) {
          setProject(dbProject);
        }
      } catch (err) {
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  // Initialize image metadata and load existing canopy images when component mounts
  useEffect(() => {
    const initializeAndLoadImages = async () => {
      try {
        setLoading(true);

        // Initialize the image metadata system with CSV data
        await initializeImageMetadataWithCSVData();

        const existingImages = await loadExistingCanopyImages();

        if (existingImages.length > 0) {
          setUploadedImages(existingImages);
          setActiveStep(0); // Set active step to Upload Images (0) to allow user to analyze the auto-loaded images
          console.log(`Loaded ${existingImages.length} existing canopy images`);
        } else {
          console.log('No existing canopy images found in the project directory');
        }
      } catch (err) {
        console.error('Error initializing image metadata or loading existing canopy images:', err);
        // Continue without loading existing images if there's an error
      } finally {
        setLoading(false);
      }
    };

    // Only attempt to load existing images if no images have been uploaded yet
    if (uploadedImages.length === 0) {
      initializeAndLoadImages();
    }
  }, [id, uploadedImages.length]); // Include uploadedImages.length in dependency array

  // Parse filename to extract plot and quadrant info
  const parseFilename = (filename: string): { plotId: string; quadrantId: string } => {
    // Support formats: Plot-1_Q1.jpg, P01_Q2.png, Plot1-Q3.jpg, etc.
    const patterns = [
      /Plot[-_]?(\d+)[-_]Q(\d)/i,
      /P(\d+)[-_]Q(\d)/i,
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        const plotNum = match[1].padStart(2, '0');
        return {
          plotId: `P${plotNum}`,
          quadrantId: `Q${match[2]}`,
        };
      }
    }

    // Default fallback
    return { plotId: 'P01', quadrantId: 'Q1' };
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: UploadedImage[] = acceptedFiles.map((file) => {
      const { plotId, quadrantId } = parseFilename(file.name);
      return {
        id: `${Date.now()}_${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        plotId,
        quadrantId,
        status: 'pending',
        progress: 0,
      };
    });

    setUploadedImages((prev) => [...prev, ...newImages]);
    if (activeStep === 0) setActiveStep(1);
  }, [activeStep]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    multiple: true,
  });

  // Analyze all images
  const handleAnalyzeAll = async () => {
    setActiveStep(1);

    const pendingImages = uploadedImages.filter((img) => img.status === 'pending');

    for (const image of pendingImages) {
      // Update status to processing
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: 'processing', progress: 0 } : img
        )
      );

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === image.id && img.progress < 90
                ? { ...img, progress: img.progress + 10 }
                : img
            )
          );
        }, 200);

        // Analyze the image
        const result = await analyzeCanopyPhoto(image.preview, image.plotId, image.quadrantId);

        clearInterval(progressInterval);

        // Update with results
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, status: 'completed', progress: 100, result }
              : img
          )
        );
      } catch (error) {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, status: 'error', error: 'Analysis failed' }
              : img
          )
        );
      }
    }

    setActiveStep(2);
  };

  // Delete image
  const handleDeleteImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Statistics
  const statistics = useMemo(() => {
    const completed = uploadedImages.filter((img) => img.status === 'completed');
    if (completed.length === 0) return null;

    const canopyCovers = completed.map((img) => img.result!.canopyCoverPercentage);
    const laiValues = completed.map((img) => img.result!.estimatedLAI);

    return {
      totalImages: uploadedImages.length,
      analyzed: completed.length,
      avgCanopyCover: (canopyCovers.reduce((a, b) => a + b, 0) / canopyCovers.length).toFixed(1),
      avgLAI: (laiValues.reduce((a, b) => a + b, 0) / laiValues.length).toFixed(2),
      minCanopy: Math.min(...canopyCovers).toFixed(1),
      maxCanopy: Math.max(...canopyCovers).toFixed(1),
    };
  }, [uploadedImages]);

  // Export to CSV
  const handleExportCSV = () => {
    const completed = uploadedImages.filter((img) => img.status === 'completed');
    if (completed.length === 0) return;

    const headers = ['Plot ID', 'Quadrant', 'Canopy Cover (%)', 'LAI', 'Gap Fraction'];
    const rows = completed.map((img) => [
      img.plotId,
      img.quadrantId,
      img.result!.canopyCoverPercentage,
      img.result!.estimatedLAI,
      img.result!.gapFraction,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'canopy'}_analysis.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <Typography variant="h6">Loading Canopy Analysis...</Typography>
          <LinearProgress sx={{ width: 200 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <IconButton onClick={() => navigate(`/dashboard/projects/${id}/view`)}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Canopy Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project?.name || 'Project'}
              </Typography>
            </Box>
          </Stack>

          {/* Workflow Stepper */}
          <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
            {WORKFLOW_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Statistics Cards */}
        {statistics && (
          <Fade in>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h3" fontWeight="800" color="success.main">
                        {statistics.analyzed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Images Analyzed
                      </Typography>
                    </Box>
                    <Analytics sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h3" fontWeight="800" color="primary.main">
                    {statistics.avgCanopyCover}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Avg Canopy Cover
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Range: {statistics.minCanopy}% - {statistics.maxCanopy}%
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h3" fontWeight="800" color="info.main">
                    {statistics.avgLAI}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Average LAI
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<FileDownload />}
                    onClick={handleExportCSV}
                    disabled={!statistics}
                    sx={{ mb: 1 }}
                  >
                    Export CSV
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<Assessment />} disabled>
                    Generate Report
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Upload Zone */}
        {uploadedImages.length === 0 && (
          <Fade in>
            <Paper
              {...getRootProps()}
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 4,
                bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {isDragActive ? 'Drop images here' : 'Drag & drop canopy images'}
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                or click to browse files
              </Typography>
              <Chip label="Supports: JPG, PNG" size="small" sx={{ mr: 1 }} />
              <Chip label="Auto-detects plot/quadrant from filename" size="small" color="primary" />
            </Paper>
          </Fade>
        )}

        {/* Images Grid */}
        {uploadedImages.length > 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Uploaded Images ({uploadedImages.length})
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                >
                  Add More
                </Button>
                <input {...getInputProps()} style={{ display: 'none' }} />
                <Button
                  variant="contained"
                  startIcon={<Analytics />}
                  onClick={handleAnalyzeAll}
                  disabled={uploadedImages.every((img) => img.status !== 'pending')}
                >
                  Analyze All
                </Button>
              </Stack>
            </Stack>

            <Grid container spacing={3}>
              {uploadedImages.map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={image.preview}
                        alt={image.file ? image.file.name : image.filename || 'Canopy Image'}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => image.status === 'completed' && setSelectedImage(image)}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                          '&:hover': { bgcolor: 'background.paper' },
                        }}
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      {image.status === 'completed' && (
                        <CheckCircle
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            color: 'success.main',
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                      {image.status === 'error' && (
                        <ErrorIcon
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            color: 'error.main',
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Box>
                    <CardContent>
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip label={image.plotId} size="small" color="primary" />
                        <Chip label={image.quadrantId} size="small" color="secondary" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {image.file ? image.file.name : image.filename || 'Canopy Image'}
                      </Typography>

                      {image.status === 'processing' && (
                        <Box sx={{ mt: 2 }}>
                          <LinearProgress variant="determinate" value={image.progress} />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Processing... {image.progress}%
                          </Typography>
                        </Box>
                      )}

                      {image.status === 'completed' && image.result && (
                        <Box sx={{ mt: 2 }}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Canopy Cover
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" color="success.main">
                              {image.result.canopyCoverPercentage.toFixed(1)}%
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              LAI
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {image.result.estimatedLAI.toFixed(2)}
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      {image.status === 'error' && (
                        <Typography variant="caption" color="error.main" sx={{ mt: 1 }}>
                          {image.error}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Image Comparison Dialog */}
      <Dialog
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
          {selectedImage && selectedImage.result && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {selectedImage.plotId} - {selectedImage.quadrantId}
                </Typography>
                <IconButton onClick={() => setSelectedImage(null)}>
                  <Close />
                </IconButton>
              </Stack>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Original Image
                      </Typography>
                      <img
                        src={selectedImage.preview}
                        alt="Original"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Binary Mask
                      </Typography>
                      <img
                        src={selectedImage.result.maskUrl}
                        alt="Mask"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Analysis Result
                      </Typography>
                      <img
                        src={selectedImage.result.segmentedUrl}
                        alt="Analyzed"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h3" fontWeight="800" color="success.main">
                        {selectedImage.result.canopyCoverPercentage.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Canopy Cover
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h3" fontWeight="800" color="primary.main">
                        {selectedImage.result.estimatedLAI.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Leaf Area Index
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h3" fontWeight="800" color="info.main">
                        {selectedImage.result.gapFraction.toFixed(3)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Gap Fraction
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CanopyAnalysisPage;