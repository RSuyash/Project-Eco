import React from 'react';
import { Card, CardProps, styled } from '@mui/material';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    color: theme.palette.text.primary,
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 40px rgba(0, 243, 255, 0.15)',
        border: '1px solid rgba(0, 243, 255, 0.3)',
    },
}));

const MotionCard = motion.create(StyledCard);

interface GlassCardProps extends CardProps {
    children: React.ReactNode;
    hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, hoverEffect = true, ...props }) => {
    return (
        <MotionCard
            {...props}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={hoverEffect ? { scale: 1.02 } : {}}
        >
            {children}
        </MotionCard>
    );
};

export default GlassCard;
