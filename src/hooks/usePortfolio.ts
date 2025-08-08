'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ITechnology {
  _id?: string;
  section: string;
  details: string[];
}

export interface IIntro {
  name: string;
  nickname?: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  title?: string;
  description?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  quickFacts?: {
    yearOfExperience: number;
    hobbies: string[];
    favoriteStack: string[];
    workingOn: string;
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
}

export interface IPortfolio {
  _id?: string;
  intro: IIntro;
  summary: string;
  workExperiences: IWorkExperience[];
  educations: IEducation[];
  technologies: ITechnology[];
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
      
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update portfolio');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}