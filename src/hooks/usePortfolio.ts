'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ITechnology {
  _id?: string;
  name: string;
  category: string;
  order?: number;
}

export interface ISkillCategory {
  _id?: string;
  name: string;
  technologies: ITechnology[];
  order?: number;
}

export interface IIntro {
  name: string;
  nickname?: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  avatarPositioning?: {
    x: number;
    y: number;
    scale: number;
  };
  title?: string;
  description?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  quickFacts?: {
    yearOfExperience?: number;
    hobbies?: string[];
    favoriteStack?: string[];
    workingOn?: string;
    projectsCount?: number;
    technologiesCount?: number;
  };
}

export interface IWorkExperience {
  _id?: string;
  position: string;
  company: string;
  url?: string;
  start: string;
  end: string;
  details: string[];
  order?: number;
}

export interface IEducation {
  _id?: string;
  degree: string;
  university: string;
  start_year: string;
  end_year: string;
  GPAX?: string;
  details: string[];
  order?: number;
}

export interface IProject {
  _id?: string;
  name: string;
  description: string;
  github?: string;
  demo?: string;
  technologies: string[];
  featured: boolean;
  order?: number;
  hide?: boolean;
  image?: string;
  screenshotUrl?: string; // Added for compatibility with database model
  images?: string[];
}

export interface IPortfolio {
  _id?: string;
  intro: IIntro;
  summary: string;
  workExperiences: IWorkExperience[];
  educations: IEducation[];
  technologies: ITechnology[]; // Keep for backward compatibility
  skillCategories?: ISkillCategory[]; // New structure
  displayProjects: IProject[];
  achievements?: unknown[];
  certificates?: unknown[];
  resumeUrl?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      console.log('Fetching portfolio data...');
      const response = await fetch('/api/portfolio');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Portfolio data received:', data);
      
      if (!data.success || !data.data) {
        throw new Error('Invalid portfolio data structure');
      }
      
      return data.data as IPortfolio;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<IPortfolio>) => {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (response.status === 401) {
        // Token expired, clear it and ask user to login
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        throw new Error('Session expired. Please login again.');
      }
      
      if (response.status === 403) {
        throw new Error('Insufficient permissions. Admin access required.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update portfolio (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (error) => {
      console.error('Portfolio update failed:', error);
      // If authentication error, redirect to login or show login modal
      if (error.message.includes('login again') || error.message.includes('Session expired')) {
        // You could trigger a login modal or redirect here
        window.location.reload(); // Simple solution - reload to show login
      }
    },
  });
}