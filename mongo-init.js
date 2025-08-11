// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('portfolio');

// Create a default admin user if it doesn't exist
print('Creating default admin user...');

// Create admin user
db.users.insertOne({
  username: 'admin',
  email: 'admin@portfolio.com',
  password: '$2b$12$pef.ujF2cf9sN7skcIXD3.9HiBV0HLXf3N22Nr2/rWk2rCq0Oq8TG', // admin123
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
    github: 'yourusername',
    linkedin: 'yourusername',
    instagram: 'yourusername',
    twitter: 'yourusername',
    website: 'yourwebsite.com',
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
      university: 'University of Technology',
      degree: "Bachelor's in Computer Science",
      start_year: '2016',
      end_year: '2020',
      GPAX: '3.75',
      details: [
        'Focused on software development, algorithms, and system design',
        'Active in coding competitions and tech clubs',
        'Graduated Magna Cum Laude',
        'Dean\'s List for 3 semesters',
        'Led university coding club'
      ],
      order: 0
    }
  ],
  technologies: [
    { name: 'JavaScript', category: 'Frontend', level: 5, order: 0 },
    { name: 'TypeScript', category: 'Frontend', level: 4, order: 1 },
    { name: 'React', category: 'Frontend', level: 5, order: 2 },
    { name: 'Next.js', category: 'Frontend', level: 4, order: 3 },
    { name: 'Vue.js', category: 'Frontend', level: 3, order: 4 },
    { name: 'Node.js', category: 'Backend', level: 4, order: 5 },
    { name: 'Express.js', category: 'Backend', level: 4, order: 6 },
    { name: 'Python', category: 'Backend', level: 3, order: 7 },
    { name: 'MongoDB', category: 'Database', level: 4, order: 8 },
    { name: 'PostgreSQL', category: 'Database', level: 3, order: 9 },
    { name: 'Docker', category: 'DevOps', level: 3, order: 10 },
    { name: 'AWS', category: 'DevOps', level: 3, order: 11 },
    { name: 'Git', category: 'Tools', level: 5, order: 12 },
    { name: 'VS Code', category: 'Tools', level: 5, order: 13 }
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React frontend, Node.js backend, and MongoDB database. Features include user authentication, product catalog, shopping cart, and payment integration.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT'],
      image: 'https://via.placeholder.com/400x300?text=E-commerce+Platform',
      images: ['https://via.placeholder.com/400x300?text=E-commerce+Dashboard', 'https://via.placeholder.com/400x300?text=E-commerce+Mobile'],
      demo: 'https://demo-ecommerce.example.com',
      github: 'https://github.com/username/ecommerce-platform',
      featured: true,
      order: 0
    },
    {
      name: 'Task Management App',
      description: 'Collaborative task management application with real-time updates, team collaboration features, and advanced filtering options.',
      technologies: ['Vue.js', 'Express.js', 'Socket.io', 'PostgreSQL'],
      image: 'https://via.placeholder.com/400x300?text=Task+Management',
      images: ['https://via.placeholder.com/400x300?text=Task+Board', 'https://via.placeholder.com/400x300?text=Task+Analytics'],
      demo: 'https://demo-tasks.example.com',
      github: 'https://github.com/username/task-manager',
      featured: true,
      order: 1
    },
    {
      name: 'Weather Dashboard',
      description: 'Real-time weather dashboard with location-based forecasts, interactive maps, and weather alerts.',
      technologies: ['React', 'Weather API', 'Chart.js', 'Tailwind CSS'],
      image: 'https://via.placeholder.com/400x300?text=Weather+Dashboard',
      images: ['https://via.placeholder.com/400x300?text=Weather+Map', 'https://via.placeholder.com/400x300?text=Weather+Charts'],
      demo: 'https://demo-weather.example.com',
      github: 'https://github.com/username/weather-dashboard',
      featured: false,
      order: 2
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