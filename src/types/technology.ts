export interface Technology {
  name: string;
  icon: string;
  color: string;
  library: 'simple-icons' | 'react-icons';
  category?: string;
}

export interface TechnologyCategory {
  [categoryName: string]: Technology[];
}

export interface TechnologyDatabase {
  categories: TechnologyCategory;
}

export interface SelectedTechnology {
  name: string;
  icon?: string;
  color?: string;
  library?: string;
  isCustom: boolean;
  proficiency?: number; // 1-5 scale
}

export interface TechnologySection {
  section: string;
  details: SelectedTechnology[];
  order?: number;
}

export type TechnologySelectorProps = {
  value?: SelectedTechnology;
  onChange: (technology: SelectedTechnology) => void;
  placeholder?: string;
  category?: string;
  className?: string;
}

export type TechLogoProps = {
  technology: SelectedTechnology;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}