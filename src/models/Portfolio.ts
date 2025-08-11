import mongoose, { Document, Schema } from 'mongoose';

// Type definitions
export interface IIntro {
  name: string;
  nickname?: string;
  phone?: string;
  email: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  location?: string;
  website?: string;
  avatar?: string;
  avatarPositioning?: {
    x: number;
    y: number;
    scale: number;
  };
  title?: string;
  description?: string;
  quickFacts?: {
    yearOfExperience?: number;
    hobbies?: string[];
    favoriteStack?: string[];
    workingOn?: string;
    projectsCount?: number;
    technologiesCount?: number;
  };
}

export interface ITechnology {
  _id?: string;
  name: string;
  category: string;
  order?: number;
}

export interface IWorkExperience {
  position: string;
  company: string;
  url?: string;
  start: string;
  end: string;
  details: string[];
  order: number;
}

export interface IEducation {
  degree: string;
  university: string;
  start_year: string;
  end_year: string;
  GPAX?: string;
  details: string[];
  order: number;
}

export interface IProject {
  name: string;
  description: string;
  github?: string;
  demo?: string;
  technologies: string[];
  screenshotUrl?: string;
  image?: string; // Added for compatibility
  featured: boolean;
  order: number;
  hide?: boolean;
}

export interface IPortfolio extends Document {
  intro: IIntro;
  summary: string;
  technologies: ITechnology[];
  workExperiences: IWorkExperience[];
  educations: IEducation[];
  displayProjects: IProject[];
  lastUpdated: Date;
  version: number;
}

// Schemas
const IntroSchema = new Schema<IIntro>({
  name: { type: String, required: true, trim: true },
  nickname: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  github: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  instagram: { type: String, trim: true },
  twitter: { type: String, trim: true },
  location: { type: String, trim: true },
  website: { type: String, trim: true },
  avatar: { type: String, trim: true },
  avatarPositioning: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    scale: { type: Number, default: 1 }
  },
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  quickFacts: {
    yearOfExperience: { type: Number },
    hobbies: [{ type: String, trim: true }],
    favoriteStack: [{ type: String, trim: true }],
    workingOn: { type: String, trim: true },
    projectsCount: { type: Number },
    technologiesCount: { type: Number }
  }
}, { _id: false });

const TechnologySchema = new Schema<ITechnology>({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 }
}, { _id: false });

const WorkExperienceSchema = new Schema<IWorkExperience>({
  position: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  url: { type: String, trim: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  details: [{ type: String, required: true, trim: true }],
  order: { type: Number, default: 0 }
}, { _id: false });

const EducationSchema = new Schema<IEducation>({
  degree: { type: String, required: true, trim: true },
  university: { type: String, required: true, trim: true },
  start_year: { type: String, required: true },
  end_year: { type: String, required: true },
  GPAX: { type: String, trim: true },
  details: [{ type: String, trim: true }],
  order: { type: Number, default: 0 }
}, { _id: false });

const ProjectSchema = new Schema<IProject>({
  name: { 
    type: String, 
    required: [true, 'Project name is required'], 
    trim: true,
    minlength: [1, 'Project name cannot be empty']
  },
  description: { 
    type: String, 
    required: [true, 'Project description is required'], 
    trim: true,
    minlength: [1, 'Project description cannot be empty']
  },
  github: { type: String, trim: true },
  demo: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  screenshotUrl: { type: String, trim: true },
  image: { type: String, trim: true }, // Added for compatibility
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0, min: 0 },
  hide: { type: Boolean, default: false }
}, { _id: false });

// Main Portfolio Schema
const PortfolioSchema = new Schema<IPortfolio>({
  intro: { type: IntroSchema, required: true },
  summary: { type: String, required: true, trim: true },
  technologies: [TechnologySchema],
  workExperiences: [WorkExperienceSchema],
  educations: [EducationSchema],
  displayProjects: [ProjectSchema],
  lastUpdated: { type: Date, default: Date.now },
  version: { type: Number, default: 1 }
}, {
  timestamps: true,
  collection: 'portfolio'
});

// Indexes
PortfolioSchema.index({ lastUpdated: -1 });
PortfolioSchema.index({ 'displayProjects.featured': 1 });

// Pre-save middleware
PortfolioSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get portfolio (singleton)
PortfolioSchema.statics.getPortfolio = async function() {
  let portfolio = await this.findOne();
  
  if (!portfolio) {
    // Create default portfolio
    portfolio = new this({
      intro: {
        name: 'Your Name',
        email: 'your.email@example.com'
      },
      summary: 'Add your professional summary here.',
      technologies: [],
      workExperiences: [],
      educations: [],
      displayProjects: []
    });
    await portfolio.save();
  }
  
  return portfolio;
};

// Method to get public data (filtered and sorted)
PortfolioSchema.methods.getPublicData = function() {
  const portfolio = this.toObject();
  
  // Filter and sort projects
  portfolio.displayProjects = portfolio.displayProjects
    .filter((project: { hide?: boolean }) => !project.hide)
    .sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0));
  
  // Sort other arrays
  portfolio.workExperiences.sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0));
  portfolio.educations.sort((a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0));
  
  return portfolio;
};

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);