'use client';

import { useState } from 'react';

interface YearPickerProps {
  value: string;
  onChange: (year: string) => void;
  placeholder?: string;
  allowPresent?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  label?: string;
}

export default function YearPicker({
  value,
  onChange,
  placeholder = "Select year",
  allowPresent = false,
  minYear = 1990,
  maxYear = new Date().getFullYear() + 10,
  className = "",
  label
}: YearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate years array
  const years: string[] = [];
  
  if (allowPresent) {
    years.push('Ongoing');
  }
  
  for (let year = maxYear; year >= minYear; year--) {
    years.push(year.toString());
  }

  const handleSelect = (selectedYear: string) => {
    onChange(selectedYear);
    setIsOpen(false);
  };

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors ${
            isPlaceholder ? 'text-gray-400' : 'text-white'
          }`}
        >
          <span className="block truncate">{displayValue}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 text-sm`}></i>
          </span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden">
              <div className="max-h-60 overflow-y-auto py-1">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleSelect(year)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none transition-colors ${
                      value === year
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="block truncate">
                      {year}
                      {year === 'Ongoing' && (
                        <span className="text-xs text-blue-400 ml-2">(Current)</span>
                      )}
                    </span>
                    {value === year && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <i className="fas fa-check text-white text-sm"></i>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Footer with year range info */}
              <div className="px-4 py-2 border-t border-gray-600 text-xs text-gray-400 text-center">
                {allowPresent ? 'Select year or mark as ongoing' : `Years: ${minYear} - ${maxYear}`}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Month-Year picker component
export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select month and year",
  allowOngoing = false,
  minYear = 1990,
  maxYear = new Date().getFullYear(),
  className = "",
  label
}: {
  value: string;
  onChange: (monthYear: string) => void;
  placeholder?: string;
  allowOngoing?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const months = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
  ];

  // Initialize from existing value
  useState(() => {
    if (value && value !== 'Ongoing' && value !== 'Present') {
      const parts = value.split(' ');
      if (parts.length >= 2) {
        const monthName = parts[0];
        const year = parts[1];
        const monthObj = months.find(m => m.name.toLowerCase() === monthName.toLowerCase());
        if (monthObj) {
          setSelectedMonth(monthObj.value);
          setSelectedYear(year);
        }
      }
    }
  });

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (selectedYear && month) {
      const monthName = months.find(m => m.value === month)?.name || '';
      onChange(`${monthName} ${selectedYear}`);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (selectedMonth && year) {
      const monthName = months.find(m => m.value === selectedMonth)?.name || '';
      onChange(`${monthName} ${year}`);
    }
  };

  const handleOngoing = () => {
    onChange('Ongoing');
    setSelectedMonth('');
    setSelectedYear('');
    setIsOpen(false);
  };

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors ${
            isPlaceholder ? 'text-gray-400' : 'text-white'
          }`}
        >
          <span className="block truncate">{displayValue}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 text-sm`}></i>
          </span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
              {/* Month-Year Selection */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Month Selection */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
                    >
                      <option value="">Select Month</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Year Selection */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Ongoing Option */}
                {allowOngoing && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <button
                      onClick={handleOngoing}
                      className="w-full bg-blue-600/20 text-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-600/30 transition-colors"
                    >
                      <i className="fas fa-clock mr-2"></i>
                      Ongoing (Current Position)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Dual month-year range picker for start and end dates
export function MonthYearRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startLabel = "Start Date",
  endLabel = "End Date",
  allowOngoing = true,
  minYear = 1990,
  maxYear = new Date().getFullYear(),
  className = ""
}: {
  startValue: string;
  endValue: string;
  onStartChange: (monthYear: string) => void;
  onEndChange: (monthYear: string) => void;
  startLabel?: string;
  endLabel?: string;
  allowOngoing?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MonthYearPicker
          value={startValue}
          onChange={onStartChange}
          label={startLabel}
          placeholder="Select start date"
          allowOngoing={false}
          minYear={minYear}
          maxYear={maxYear}
        />
        
        <MonthYearPicker
          value={endValue}
          onChange={onEndChange}
          label={endLabel}
          placeholder="Select end date"
          allowOngoing={allowOngoing}
          minYear={minYear}
          maxYear={maxYear}
        />
      </div>
    </div>
  );
}

// Dual year picker for start and end years with validation
export function YearRangePicker({
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
  startLabel = "Start Year",
  endLabel = "End Year",
  allowPresent = true,
  minYear = 1990,
  maxYear = new Date().getFullYear() + 10,
  className = ""
}: {
  startYear: string;
  endYear: string;
  onStartYearChange: (year: string) => void;
  onEndYearChange: (year: string) => void;
  startLabel?: string;
  endLabel?: string;
  allowPresent?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
}) {
  // Validation: end year should be >= start year (unless it's Ongoing)
  const isValidRange = () => {
    if (!startYear || !endYear) return true;
    if (endYear === 'Ongoing') return true;
    
    const startYearNum = parseInt(startYear);
    const endYearNum = parseInt(endYear);
    
    if (isNaN(startYearNum) || isNaN(endYearNum)) return true;
    
    return endYearNum >= startYearNum;
  };

  const hasValidationError = startYear && endYear && !isValidRange();

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <YearPicker
          value={startYear}
          onChange={onStartYearChange}
          label={startLabel}
          placeholder="Select start year"
          allowPresent={false}
          minYear={minYear}
          maxYear={maxYear}
          className={hasValidationError ? 'border-red-500' : ''}
        />
        
        <YearPicker
          value={endYear}
          onChange={onEndYearChange}
          label={endLabel}
          placeholder="Select end year"
          allowPresent={allowPresent}
          minYear={minYear}
          maxYear={maxYear}
          className={hasValidationError ? 'border-red-500' : ''}
        />
      </div>
      
      {hasValidationError && (
        <p className="mt-2 text-sm text-red-400 flex items-center">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          End year must be greater than or equal to start year
        </p>
      )}
    </div>
  );
}