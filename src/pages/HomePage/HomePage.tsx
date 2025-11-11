import { Link } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to the Data Analysis Platform
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          A professional tool for visualizing and analyzing environmental data.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/dashboard"
          sx={{ mt: 4 }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
