'use client';

import { useState, useRef, useEffect } from 'react';
import { TechnologySelectorProps, SelectedTechnology, TechnologyDatabase } from '@/types/technology';
import TechLogo, { createTechnology } from './TechLogo';
import technologiesData from '@/data/technologies.json';

export default function TechnologySelector({ 
  value, 
  onChange, 
  placeholder = "Search or add technology...", 
  category,
  className = "" 
}: TechnologySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTechs, setFilteredTechs] = useState<SelectedTechnology[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'All');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const database = technologiesData as TechnologyDatabase;
  const categories = ['All', ...Object.keys(database.categories)];

  // Filter technologies based on search and category
  useEffect(() => {
    let allTechs: SelectedTechnology[] = [];
    
    // Get technologies from selected category or all categories
    if (selectedCategory === 'All') {
      Object.values(database.categories).forEach(categoryTechs => {
        categoryTechs.forEach(tech => {
          allTechs.push({
            name: tech.name,
            icon: tech.icon,
            color: tech.color,
            library: tech.library,
            isCustom: false
          });
        });
      });
    } else if (database.categories[selectedCategory]) {
      allTechs = database.categories[selectedCategory].map(tech => ({
        name: tech.name,
        icon: tech.icon,
        color: tech.color,
        library: tech.library,
        isCustom: false
      }));
    }

    // Filter by search query
    if (searchQuery) {
      allTechs = allTechs.filter(tech => 
        tech.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Add custom technology option if query doesn't match any existing tech
      const exactMatch = allTechs.find(tech => 
        tech.name.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (!exactMatch && searchQuery.trim()) {
        allTechs.unshift({
          name: searchQuery.trim(),
          isCustom: true
        });
      }
    }

    setFilteredTechs(allTechs.slice(0, 20)); // Limit to 20 results
  }, [searchQuery, selectedCategory, database.categories]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (tech: SelectedTechnology) => {
    onChange(tech);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!searchQuery && filteredTechs.length === 0) {
      // Show popular technologies when focused without search
      const popularTechs = Object.values(database.categories)
        .flat()
        .slice(0, 10)
        .map(tech => ({
          name: tech.name,
          icon: tech.icon,
          color: tech.color,
          library: tech.library,
          isCustom: false
        }));
      setFilteredTechs(popularTechs);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={value ? value.name : placeholder}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
        
        {/* Selected Technology Display */}
        {value && !isOpen && !searchQuery && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <TechLogo technology={value} size="sm" showName={true} />
          </div>
        )}
        
        {/* Dropdown Arrow */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-sm`}></i>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Category Filter */}
          <div className="p-3 border-b border-gray-600">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Technology Options */}
          <div className="max-h-72 overflow-y-auto">
            {filteredTechs.length > 0 ? (
              filteredTechs.map((tech, index) => (
                <button
                  key={`${tech.name}-${index}`}
                  onClick={() => handleSelect(tech)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-b-0"
                >
                  <TechLogo technology={tech} size="sm" showName={true} />
                  {tech.isCustom && (
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full ml-auto">
                      Custom
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                {searchQuery ? (
                  <div>
                    <p>No technologies found for &quot;{searchQuery}&quot;</p>
                    <button
                      onClick={() => handleSelect(createTechnology(searchQuery))}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Add &quot;{searchQuery}&quot; as custom technology
                    </button>
                  </div>
                ) : (
                  <p>Start typing to search technologies...</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-600 text-xs text-gray-400 text-center">
            {filteredTechs.length > 0 && (
              <span>{filteredTechs.length} {filteredTechs.length === 1 ? 'technology' : 'technologies'} found</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Multi-select version for selecting multiple technologies
export function MultiTechnologySelector({
  values = [],
  onChange,
  placeholder = "Add technologies...",
  category,
  className = ""
}: {
  values?: SelectedTechnology[];
  onChange: (technologies: SelectedTechnology[]) => void;
  placeholder?: string;
  category?: string;
  className?: string;
}) {
  const [selectedTech, setSelectedTech] = useState<SelectedTechnology | undefined>();

  const handleTechSelect = (tech: SelectedTechnology) => {
    // Check if technology already exists
    const exists = values.find(v => v.name.toLowerCase() === tech.name.toLowerCase());
    if (!exists) {
      onChange([...values, tech]);
    }
    setSelectedTech(undefined);
  };

  const handleRemoveTech = (indexToRemove: number) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={className}>
      {/* Selected Technologies */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {values.map((tech, index) => (
            <div
              key={`${tech.name}-${index}`}
              className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg border border-gray-600"
            >
              <TechLogo technology={tech} size="sm" showName={true} />
              <button
                onClick={() => handleRemoveTech(index)}
                className="text-gray-400 hover:text-red-400 ml-2"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Technology Selector */}
      <TechnologySelector
        value={selectedTech}
        onChange={handleTechSelect}
        placeholder={placeholder}
        category={category}
        className="w-full"
      />
    </div>
  );
}