import React from 'react';
import { Button, ButtonProps, styled } from '@mui/material';
import { motion } from 'framer-motion';

const StyledButton = styled(Button)<ButtonProps & { variant?: 'contained' | 'outlined' | 'text' }>(({ theme, variant }) => ({
    borderRadius: '8px',
    fontWeight: 600,
    textTransform: 'none',
    padding: '10px 24px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',

    ...(variant === 'contained' && {
        background: 'linear-gradient(135deg, #00f3ff 0%, #00b8ff 100%)',
        color: '#000',
        boxShadow: '0 0 15px rgba(0, 243, 255, 0.4)',
        border: 'none',
        '&:hover': {
            boxShadow: '0 0 25px rgba(0, 243, 255, 0.6)',
            transform: 'scale(1.05)',
        },
    }),

    ...(variant === 'outlined' && {
        background: 'transparent',
        border: '1px solid rgba(0, 243, 255, 0.5)',
        color: '#00f3ff',
        '&:hover': {
            background: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid #00f3ff',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)',
        },
    }),
}));

const MotionButton = motion.create(StyledButton);

interface NeonButtonProps extends ButtonProps {
    children: React.ReactNode;
}

const NeonButton: React.FC<NeonButtonProps> = ({ children, ...props }) => {
    return (
        <MotionButton
            {...props}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </MotionButton>
    );
};

export default NeonButton;
