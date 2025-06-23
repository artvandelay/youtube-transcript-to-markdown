
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors duration-200 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  );
};
