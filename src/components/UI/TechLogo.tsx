'use client';

import { useState, useEffect } from 'react';
import { TechLogoProps, SelectedTechnology } from '@/types/technology';

// Dynamic icon loader function
const loadIcon = async (iconName: string): Promise<React.ComponentType | null> => {
  try {
    // Try Simple Icons first (most comprehensive tech logos)
    const siModule = await import('react-icons/si');
    if (siModule[iconName as keyof typeof siModule]) {
      return siModule[iconName as keyof typeof siModule] as React.ComponentType;
    }

    // Try Font Awesome brands
    const fabModule = await import('react-icons/fa');
    if (fabModule[iconName as keyof typeof fabModule]) {
      return fabModule[iconName as keyof typeof fabModule] as React.ComponentType;
    }

    // Try DevIcons
    const diModule = await import('react-icons/di');
    if (diModule[iconName as keyof typeof diModule]) {
      return diModule[iconName as keyof typeof diModule] as React.ComponentType;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
    return null;
  }
};

// Technology name to icon mapping with multiple possible icon names
const getTechIconNames = (techName: string): string[] => {
  const name = techName.toLowerCase();
  const iconNames: string[] = [];

  // Simple Icons mappings (Si prefix)
  const siMappings: Record<string, string[]> = {
    'javascript': ['SiJavascript'],
    'js': ['SiJavascript'],
    'typescript': ['SiTypescript'],
    'ts': ['SiTypescript'],
    'react': ['SiReact'],
    'angular': ['SiAngular'],
    'vue': ['SiVuedotjs'],
    'vue.js': ['SiVuedotjs'],
    'svelte': ['SiSvelte'],
    'next.js': ['SiNextdotjs'],
    'nextjs': ['SiNextdotjs'],
    'nuxt': ['SiNuxtdotjs'],
    'nuxt.js': ['SiNuxtdotjs'],
    'node.js': ['SiNodedotjs'],
    'nodejs': ['SiNodedotjs'],
    'express': ['SiExpress'],
    'express.js': ['SiExpress'],
    'nestjs': ['SiNestjs'],
    'python': ['SiPython'],
    'java': ['SiOracle'], // Java logo is owned by Oracle
    'php': ['SiPhp'],
    'go': ['SiGo'],
    'golang': ['SiGo'],
    'rust': ['SiRust'],
    'c#': ['SiCsharp', 'SiDotnet'],
    'csharp': ['SiCsharp', 'SiDotnet'],
    'ruby': ['SiRuby'],
    'swift': ['SiSwift'],
    'kotlin': ['SiKotlin'],
    'dart': ['SiDart'],
    'html': ['SiHtml5'],
    'html5': ['SiHtml5'],
    'css': ['SiCss3'],
    'css3': ['SiCss3'],
    'sass': ['SiSass'],
    'scss': ['SiSass'],
    'mongodb': ['SiMongodb'],
    'mysql': ['SiMysql'],
    'postgresql': ['SiPostgresql'],
    'redis': ['SiRedis'],
    'sqlite': ['SiSqlite'],
    'firebase': ['SiFirebase'],
    'supabase': ['SiSupabase'],
    'prisma': ['SiPrisma'],
    'graphql': ['SiGraphql'],
    'apollo': ['SiApollographql'],
    'docker': ['SiDocker'],
    'kubernetes': ['SiKubernetes'],
    'aws': ['SiAmazon', 'SiAws'],
    'amazon web services': ['SiAmazon', 'SiAws'],
    'azure': ['SiMicrosoftazure'],
    'google cloud': ['SiGooglecloud'],
    'gcp': ['SiGooglecloud'],
    'vercel': ['SiVercel'],
    'netlify': ['SiNetlify'],
    'heroku': ['SiHeroku'],
    'git': ['SiGit'],
    'github': ['SiGithub'],
    'gitlab': ['SiGitlab'],
    'bitbucket': ['SiBitbucket'],
    'tailwind css': ['SiTailwindcss'],
    'tailwindcss': ['SiTailwindcss'],
    'bootstrap': ['SiBootstrap'],
    'jquery': ['SiJquery'],
    'webpack': ['SiWebpack'],
    'vite': ['SiVite'],
    'eslint': ['SiEslint'],
    'prettier': ['SiPrettier'],
    'jest': ['SiJest'],
    'cypress': ['SiCypress'],
    'figma': ['SiFigma'],
    'django': ['SiDjango'],
    'flask': ['SiFlask'],
    'fastapi': ['SiFastapi'],
    'laravel': ['SiLaravel'],
    'spring': ['SiSpring'],
    'spring boot': ['SiSpring'],
    'redux': ['SiRedux'],
    'mobx': ['SiMobx'],
    'styled components': ['SiStyledcomponents'],
    'material-ui': ['SiMui'],
    'mui': ['SiMui'],
    'vs code': ['SiVisualstudiocode'],
    'vscode': ['SiVisualstudiocode'],
    'visual studio code': ['SiVisualstudiocode'],
    'npm': ['SiNpm'],
    'yarn': ['SiYarn'],
    'pnpm': ['SiPnpm'],
    'linux': ['SiLinux'],
    'ubuntu': ['SiUbuntu'],
    'flutter': ['SiFlutter'],
    'ionic': ['SiIonic'],
    'wordpress': ['SiWordpress'],
    'shopify': ['SiShopify'],
    'strapi': ['SiStrapi'],
    'contentful': ['SiContentful'],
    'sanity': ['SiSanity']
  };

  // Add mapped icons
  if (siMappings[name]) {
    iconNames.push(...siMappings[name]);
  }

  // Try common patterns
  const cleanName = name.replace(/[\s\-\.]/g, '').toLowerCase();
  iconNames.push(`Si${cleanName.charAt(0).toUpperCase()}${cleanName.slice(1)}`);
  
  // Try with different casing
  iconNames.push(`Si${techName.replace(/[\s\-\.]/g, '')}`);
  
  return [...new Set(iconNames)]; // Remove duplicates
};

export default function TechLogo({ technology, size = 'md', showName = true, className = '' }: TechLogoProps) {
  const [IconComponent, setIconComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  useEffect(() => {
    const loadTechIcon = async () => {
      setIsLoading(true);
      
      // If explicit icon is provided, try that first
      if (technology.icon) {
        const icon = await loadIcon(technology.icon);
        if (icon) {
          setIconComponent(() => icon);
          setIsLoading(false);
          return;
        }
      }

      // Try to find icon based on technology name
      if (technology.name) {
        const possibleIconNames = getTechIconNames(technology.name);
        
        for (const iconName of possibleIconNames) {
          const icon = await loadIcon(iconName);
          if (icon) {
            setIconComponent(() => icon);
            setIsLoading(false);
            return;
          }
        }
      }

      // No icon found
      setIconComponent(null);
      setIsLoading(false);
    };

    loadTechIcon();
  }, [technology.icon, technology.name]);

  const iconStyle = technology.color && !technology.isCustom ? { color: technology.color } : {};

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isLoading && IconComponent && (
        <div 
          className={`flex-shrink-0 ${sizeClasses[size]} ${technology.isCustom ? 'text-gray-400' : ''}`}
          style={iconStyle}
        >
          <IconComponent />
        </div>
      )}
      {showName && technology.name && (
        <span className={`${textSizeClasses[size]} ${technology.isCustom ? 'text-gray-300' : 'text-white'}`}>
          {technology.name}
        </span>
      )}
    </div>
  );
}

// Utility function to create a SelectedTechnology from a name
export function createTechnology(name: string, techData?: { icon?: string; color?: string; library?: string }): SelectedTechnology {
  return {
    name,
    icon: techData?.icon,
    color: techData?.color,
    library: techData?.library,
    isCustom: !techData
  };
}

// Hook to get technology data from our database
export function useTechnologyData() {
  const getTechnologyByName = (name: string): SelectedTechnology | null => {
    // This would normally fetch from our technologies.json
    // For now, return a custom technology
    return {
      name,
      isCustom: true
    };
  };

  const searchTechnologies = (): SelectedTechnology[] => {
    // This would normally search through our technologies.json
    // For now, return empty array
    return [];
  };

  return {
    getTechnologyByName,
    searchTechnologies
  };
}