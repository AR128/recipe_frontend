import { useState, useEffect } from 'react';

/**
 * Returns the current window inner width, updated on resize.
 * Provides convenient breakpoint helpers:
 *   isMobile  — width <= 640px
 *   isTablet  — width <= 900px
 */
function useWindowWidth() {
    const [width, setWidth] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );

    useEffect(() => {
        let rafId;
        const handleResize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => setWidth(window.innerWidth));
        };
        window.addEventListener('resize', handleResize, { passive: true });
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return {
        width,
        isMobile: width <= 640,
        isTablet: width <= 900,
    };
}

export default useWindowWidth;
