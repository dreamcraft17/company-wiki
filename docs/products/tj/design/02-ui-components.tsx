/**
 * Trusted Jurist UI Components
 * Implemented from Design System (SRS/SDD)
 * 
 * Components: Button, Input, Textarea, Select, Checkbox, Radio, Card, Alert, Badge
 */

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown, X } from 'lucide-react';

// ============================================
// BUTTON COMPONENT
// ============================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold rounded-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-60 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-navy-700 text-white hover:bg-navy-500 active:bg-navy-700',
      secondary: 'bg-transparent border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white',
      gold: 'bg-gold-500 text-white hover:bg-gold-300',
      ghost: 'bg-transparent text-navy-700 hover:bg-gray-light',
    };

    const sizeClasses = {
      sm: 'px-4 py-2.5 text-body-sm',
      md: 'px-6 py-3.5 text-body h-11',
      lg: 'px-7 py-3 text-body-lg h-13',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ============================================
// TEXT INPUT COMPONENT
// ============================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-label text-gray-dark font-semibold mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 text-body text-navy-700 placeholder-gray-text/60 border border-gray-border rounded-sm bg-white transition-colors duration-150 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 disabled:bg-gray-light disabled:text-gray-text disabled:opacity-60 ${error ? 'border-error focus:ring-error/10 focus:border-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-error text-caption mt-1">{error}</p>}
        {helperText && !error && <p className="text-caption text-gray-text mt-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================
// TEXTAREA COMPONENT
// ============================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-label text-gray-dark font-semibold mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 text-body text-navy-700 placeholder-gray-text/60 border border-gray-border rounded-sm bg-white transition-colors duration-150 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 disabled:bg-gray-light disabled:text-gray-text disabled:opacity-60 min-h-30 resize-vertical ${error ? 'border-error focus:ring-error/10 focus:border-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-error text-caption mt-1">{error}</p>}
        {helperText && !error && <p className="text-caption text-gray-text mt-1">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ============================================
// SELECT COMPONENT
// ============================================

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-label text-gray-dark font-semibold mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-4 py-3 pr-10 text-body text-navy-700 placeholder-gray-text/60 border border-gray-border rounded-sm bg-white appearance-none transition-colors duration-150 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 disabled:bg-gray-light disabled:text-gray-text disabled:opacity-60 ${error ? 'border-error focus:ring-error/10 focus:border-error' : ''} ${className}`}
            {...props}
          >
            <option value="">Pilih {label?.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-700 pointer-events-none" />
        </div>
        {error && <p className="text-error text-caption mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ============================================
// CHECKBOX COMPONENT
// ============================================

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={`w-5 h-5 border border-gray-border rounded-sm bg-white cursor-pointer focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 checked:bg-navy-700 checked:border-navy-700 checked:focus:bg-navy-700 ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={props.id} className="text-body text-gray-dark cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ============================================
// RADIO COMPONENT
// ============================================

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="radio"
          className={`w-5 h-5 border border-gray-border rounded-full bg-white cursor-pointer focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 checked:bg-navy-700 checked:border-navy-700 checked:focus:bg-navy-700 ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={props.id} className="text-body text-gray-dark cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Radio.displayName = 'Radio';

// ============================================
// CARD COMPONENT
// ============================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false }) => {
  return (
    <div
      className={`bg-white border border-gray-border rounded-md p-6 shadow-subtle ${
        hoverable ? 'hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// ============================================
// PRACTICE AREA CARD
// ============================================

export interface PracticeAreaCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onConsult?: () => void;
}

export const PracticeAreaCard: React.FC<PracticeAreaCardProps> = ({
  icon,
  title,
  description,
  onConsult,
}) => {
  return (
    <Card hoverable className="flex flex-col">
      <div className="w-16 h-16 flex items-center justify-center text-navy-700 mb-4">
        {icon}
      </div>
      <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-2">{title}</h4>
      <p className="text-body text-gray-text mb-6 flex-grow">{description}</p>
      <Button variant="primary" size="sm" onClick={onConsult} className="w-full">
        Konsultasi
      </Button>
    </Card>
  );
};

// ============================================
// TEAM MEMBER CARD
// ============================================

export interface TeamMemberCardProps {
  name: string;
  title: string;
  bio: string;
  image?: string;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  title,
  bio,
  image,
}) => {
  return (
    <Card className="flex flex-col">
      {image && (
        <img
          src={image}
          alt={name}
          className="w-full aspect-square object-cover rounded-sm mb-4"
        />
      )}
      <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-1">{name}</h4>
      <p className="text-label text-gray-text mb-3">{title}</p>
      <p className="text-body-sm text-gray-text">{bio}</p>
    </Card>
  );
};

// ============================================
// JOB POSTING CARD
// ============================================

export interface JobPostingCardProps {
  title: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  description: string;
  onApply?: () => void;
}

export const JobPostingCard: React.FC<JobPostingCardProps> = ({
  title,
  level,
  description,
  onApply,
}) => {
  const levelColors = {
    Junior: 'text-info',
    Mid: 'text-warning',
    Senior: 'text-gold-500',
    Lead: 'text-error',
  };

  return (
    <Card hoverable className="flex flex-col">
      <span className={`text-label font-semibold ${levelColors[level]} mb-2`}>{level}</span>
      <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-2">{title}</h4>
      <p className="text-body-sm text-gray-text mb-6 line-clamp-2 flex-grow">{description}</p>
      <Button variant="primary" size="md" onClick={onApply} className="w-full mt-auto">
        Lamar Sekarang
      </Button>
    </Card>
  );
};

// ============================================
// ALERT COMPONENT
// ============================================

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const bgColors = {
    success: 'bg-success/10 border-success/30',
    error: 'bg-error/10 border-error/30',
    warning: 'bg-warning/10 border-warning/30',
    info: 'bg-info/10 border-info/30',
  };

  const textColors = {
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  };

  return (
    <div className={`border rounded-md p-4 flex items-center justify-between gap-3 ${bgColors[type]}`}>
      <p className={`${textColors[type]} text-body`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-gray-text hover:text-navy-700 transition-colors">
          <X size={18} />
        </button>
      )}
    </div>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-navy-700/10 text-navy-700',
    secondary: 'bg-gold-500/10 text-gold-500',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-label font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
};

// ============================================
// DIVIDER COMPONENT
// ============================================

export interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return <div className={`border-t border-gray-border ${className}`} />;
};
