import React from 'react';
import { Box, Container, styled } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedBackground = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    background: 'radial-gradient(circle at 50% 50%, #112926 0%, #050a14 100%)',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.03) 0%, transparent 50%)',
        animation: 'rotate 60s linear infinite',
    },
    '@keyframes rotate': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
});

const ContentWrapper = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    position: 'relative',
    zIndex: 1,
}));

interface PageLayoutProps {
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, maxWidth = 'lg' }) => {
    return (
        <>
            <AnimatedBackground />
            <ContentWrapper maxWidth={maxWidth}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </ContentWrapper>
        </>
    );
};

export default PageLayout;
