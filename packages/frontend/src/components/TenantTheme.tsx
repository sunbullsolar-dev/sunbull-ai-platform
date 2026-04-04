/**
 * Tenant Theme Component
 * Dynamically applies tenant branding as CSS custom properties
 */

import React, { useEffect, useMemo } from 'react';
import { useTenant, buildCSSVariables } from '../lib/tenant';

interface TenantThemeProps {
  children: React.ReactNode;
}

/**
 * TenantTheme Component
 * Reads tenant branding from context and applies CSS custom properties dynamically
 * Updates document title, favicon, and renders children with tenant theme
 */
export const TenantTheme: React.FC<TenantThemeProps> = ({ children }) => {
  const { tenant, branding, loading } = useTenant();

  // Build CSS variables from branding
  const cssVariables = useMemo(() => {
    return buildCSSVariables(branding);
  }, [branding]);

  // Apply CSS custom properties and update document metadata
  useEffect(() => {
    if (loading) {
      return;
    }

    // Apply CSS custom properties to root element
    const root = document.documentElement;

    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Update document title
    document.title = `${branding.companyName || 'Sunbull AI'} - Solar Intelligence`;

    // Update favicon if provided
    if (branding.faviconUrl) {
      updateFavicon(branding.faviconUrl);
    }

    // Add custom CSS if provided
    if (branding.customCss) {
      applyCustomCSS(branding.customCss);
    }

    // Update meta theme-color
    updateThemeColor(branding.primaryColor);

    // Cleanup function to reset CSS on unmount
    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVariables, branding, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Update favicon dynamically
 */
function updateFavicon(url: string): void {
  try {
    // Remove existing favicon link if present
    const existingLink = document.querySelector('link[rel="icon"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Create and append new favicon link
    const faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.href = url;
    faviconLink.type = 'image/x-icon';

    document.head.appendChild(faviconLink);
  } catch (error) {
    console.warn('Failed to update favicon:', error);
  }
}

/**
 * Apply custom CSS to document
 */
function applyCustomCSS(css: string): void {
  try {
    // Remove existing custom style tag if present
    const existingStyle = document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and append new style tag
    const styleTag = document.createElement('style');
    styleTag.id = 'tenant-custom-css';
    styleTag.textContent = css;

    document.head.appendChild(styleTag);
  } catch (error) {
    console.warn('Failed to apply custom CSS:', error);
  }
}

/**
 * Update browser theme color
 */
function updateThemeColor(color: string): void {
  try {
    // Remove existing meta theme-color if present
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }

    themeColorMeta.setAttribute('content', color);
  } catch (error) {
    console.warn('Failed to update theme color:', error);
  }
}

/**
 * Higher-order component to wrap app with TenantTheme
 */
export const withTenantTheme = <P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> => {
  return (props: P) => (
    <TenantTheme>
      <Component {...props} />
    </TenantTheme>
  );
};

/**
 * Tenant Theme CSS Styles Hook
 * Returns CSS object for MUI components or inline styles
 */
export const useTenantThemeStyles = () => {
  const { branding } = useTenant();

  return useMemo(
    () => ({
      root: {
        '--primary-color': branding.primaryColor,
        '--secondary-color': branding.secondaryColor,
        '--accent-color': branding.accentColor,
        '--font-family': branding.fontFamily,
      } as React.CSSProperties,
      logo: {
        backgroundImage: `url('${branding.logoUrl}')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      } as React.CSSProperties,
      primaryButton: {
        backgroundColor: branding.primaryColor,
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: darkenColor(branding.primaryColor, 10),
        },
      },
      secondaryButton: {
        backgroundColor: branding.secondaryColor,
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: darkenColor(branding.secondaryColor, 10),
        },
      },
      accentButton: {
        backgroundColor: branding.accentColor,
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: darkenColor(branding.accentColor, 10),
        },
      },
    }),
    [branding],
  );
};

/**
 * Utility: Darken hex color by percentage
 */
function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);

  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1).toUpperCase();
}

/**
 * Utility: Lighten hex color by percentage
 */
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);

  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1).toUpperCase();
}

/**
 * Export color utilities
 */
export const colorUtils = {
  darken: darkenColor,
  lighten: lightenColor,
};

/**
 * CSS variables for use in styled components or CSS modules
 * Usage:
 * const styles = css`
 *   background-color: var(--primary-color);
 * `;
 */
export const TENANT_CSS_VARS = {
  primary: 'var(--primary-color)',
  secondary: 'var(--secondary-color)',
  accent: 'var(--accent-color)',
  logoUrl: 'var(--logo-url)',
  fontFamily: 'var(--font-family)',
  companyName: 'var(--company-name)',
};
