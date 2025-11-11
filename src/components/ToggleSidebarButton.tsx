import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ToggleSidebarButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const StyledToggleButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
  ...(theme.direction === 'rtl' && {
    marginLeft: theme.spacing(1),
    marginRight: '0px',
  }),
}));

const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({ 
  isOpen, 
  onClick,
  className 
}) => {
  return (
    <StyledToggleButton
      color="inherit"
      aria-label={isOpen ? "collapse sidebar" : "expand sidebar"}
      onClick={onClick}
      edge="start"
      className={className}
    >
      {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </StyledToggleButton>
  );
};

export default ToggleSidebarButton;