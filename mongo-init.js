// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('portfolio');

// Create a default admin user if it doesn't exist
print('Creating default admin user...');

// Create admin user
db.users.insertOne({
  username: 'admin',
  email: 'admin@portfolio.com',
  password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdGhG/S7.aDlW.q', // admin123
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create default portfolio data
print('Creating default portfolio data...');

db.portfolios.insertOne({
  intro: {
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Your City, Country',
    avatar: '',
    title: 'Full Stack Developer',
    description: 'Passionate developer with experience in modern web technologies. I love creating efficient, scalable, and user-friendly applications.',
    quickFacts: {
      yearOfExperience: 3,
      hobbies: ['Coding', 'Photography', 'Travel', 'Gaming'],
      favoriteStack: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      workingOn: 'Building awesome portfolio websites'
    }
  },
  summary: 'I am a dedicated full-stack developer with a passion for creating innovative web solutions. With expertise in modern JavaScript frameworks, database design, and cloud technologies, I bring ideas to life through clean, efficient code. I enjoy collaborating with teams to solve complex problems and deliver exceptional user experiences.',
  workExperiences: [
    {
      company: 'Tech Solutions Inc.',
      role: 'Senior Full Stack Developer',
      duration: '2022 - Present',
      location: 'Remote',
      description: 'Lead development of web applications using React, Node.js, and cloud services. Mentor junior developers and collaborate with cross-functional teams.',
      technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
      achievements: [
        'Led development of 3 major client projects',
        'Improved application performance by 40%',
        'Mentored 5 junior developers'
      ]
    },
    {
      company: 'StartupCo',
      role: 'Frontend Developer',
      duration: '2020 - 2022',
      location: 'San Francisco, CA',
      description: 'Developed responsive web applications and collaborated with UI/UX designers to create engaging user interfaces.',
      technologies: ['React', 'Vue.js', 'JavaScript', 'CSS3', 'REST APIs'],
      achievements: [
        'Built responsive designs for 10+ projects',
        'Reduced load times by 30%',
        'Implemented modern UI/UX best practices'
      ]
    }
  ],
  educations: [
    {
      institution: 'University of Technology',
      degree: "Bachelor's",
      field: 'Computer Science',
      duration: '2016 - 2020',
      description: 'Focused on software development, algorithms, and system design. Active in coding competitions and tech clubs.',
      achievements: [
        'Graduated Magna Cum Laude',
        'Dean\'s List for 3 semesters',
        'Led university coding club'
      ]
    }
  ],
  technologies: [
    { name: 'JavaScript', category: 'Frontend', level: 5 },
    { name: 'TypeScript', category: 'Frontend', level: 4 },
    { name: 'React', category: 'Frontend', level: 5 },
    { name: 'Next.js', category: 'Frontend', level: 4 },
    { name: 'Vue.js', category: 'Frontend', level: 3 },
    { name: 'Node.js', category: 'Backend', level: 4 },
    { name: 'Express.js', category: 'Backend', level: 4 },
    { name: 'Python', category: 'Backend', level: 3 },
    { name: 'MongoDB', category: 'Database', level: 4 },
    { name: 'PostgreSQL', category: 'Database', level: 3 },
    { name: 'Docker', category: 'DevOps', level: 3 },
    { name: 'AWS', category: 'DevOps', level: 3 },
    { name: 'Git', category: 'Tools', level: 5 },
    { name: 'VS Code', category: 'Tools', level: 5 }
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React frontend, Node.js backend, and MongoDB database. Features include user authentication, product catalog, shopping cart, and payment integration.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT'],
      image: 'https://via.placeholder.com/400x300?text=E-commerce+Platform',
      liveUrl: 'https://demo-ecommerce.example.com',
      githubUrl: 'https://github.com/username/ecommerce-platform',
      featured: true,
      completionDate: '2023-12-01'
    },
    {
      name: 'Task Management App',
      description: 'Collaborative task management application with real-time updates, team collaboration features, and advanced filtering options.',
      technologies: ['Vue.js', 'Express.js', 'Socket.io', 'PostgreSQL'],
      image: 'https://via.placeholder.com/400x300?text=Task+Management',
      liveUrl: 'https://demo-tasks.example.com',
      githubUrl: 'https://github.com/username/task-manager',
      featured: true,
      completionDate: '2023-10-15'
    },
    {
      name: 'Weather Dashboard',
      description: 'Real-time weather dashboard with location-based forecasts, interactive maps, and weather alerts.',
      technologies: ['React', 'Weather API', 'Chart.js', 'Tailwind CSS'],
      image: 'https://via.placeholder.com/400x300?text=Weather+Dashboard',
      liveUrl: 'https://demo-weather.example.com',
      githubUrl: 'https://github.com/username/weather-dashboard',
      featured: false,
      completionDate: '2023-08-20'
    }
  ],
  displayProjects: [], // Will be populated by featured projects
  createdAt: new Date(),
  updatedAt: new Date()
});

// Update displayProjects with featured projects
db.portfolios.updateOne(
  {},
  {
    $set: {
      displayProjects: db.portfolios.findOne().projects.filter(p => p.featured)
    }
  }
);

print('Default data created successfully!');