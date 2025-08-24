import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'

function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options...',
  loading = false,
  error = null,
  className = '',
  searchable = true,
  maxHeight = '200px'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle option selection
  const handleOptionClick = option => {
    const isSelected = value.includes(option.value)
    let newValue

    if (isSelected) {
      newValue = value.filter(v => v !== option.value)
    } else {
      newValue = [...value, option.value]
    }

    onChange(newValue)
  }

  // Handle select all / deselect all
  const handleSelectAll = () => {
    if (value.length === filteredOptions.length) {
      onChange([])
    } else {
      onChange(filteredOptions.map(option => option.value))
    }
  }

  // Get display text
  const getDisplayText = () => {
    if (value.length === 0) return placeholder
    if (value.length === 1) {
      const option = options.find(opt => opt.value === value[0])
      return option ? option.label : value[0]
    }
    return `${value.length} selected`
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Main button */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between disabled:opacity-50'
      >
        <span className='text-left truncate'>{getDisplayText()}</span>
        <div className='flex items-center space-x-2'>
          {loading && <Icon icon='eos-icons:loading' className='w-4 h-4 text-purple-400' />}
          <Icon
            icon='mdi:chevron-down'
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Error message */}
      {error && (
        <div className='text-red-400 text-xs mt-1 flex items-center space-x-1'>
          <Icon icon='mdi:alert-circle' className='w-3 h-3' />
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg'>
          {/* Search input */}
          {searchable && (
            <div className='p-2 border-b border-gray-600'>
              <input
                type='text'
                placeholder='Search...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          )}

          {/* Select all button */}
          {filteredOptions.length > 1 && (
            <div className='p-2 border-b border-gray-600'>
              <button
                type='button'
                onClick={handleSelectAll}
                className='text-purple-400 hover:text-purple-300 text-sm font-medium'
              >
                {value.length === filteredOptions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}

          {/* Options list */}
          <div className='max-h-48 overflow-y-auto' style={{ maxHeight }}>
            {loading ? (
              <div className='p-4 text-center text-gray-400'>
                <Icon icon='eos-icons:loading' className='w-6 h-6 mx-auto mb-2' />
                <div>Loading options...</div>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className='p-4 text-center text-gray-400'>
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-700 flex items-center space-x-2 ${
                    value.includes(option.value) ? 'bg-purple-600 hover:bg-purple-700' : ''
                  }`}
                >
                  <Icon
                    icon={
                      value.includes(option.value) ? 'mdi:checkbox-marked' : 'mdi:checkbox-blank'
                    }
                    className='w-4 h-4 text-purple-400'
                  />
                  <span className='truncate'>{option.label}</span>
                  {option.count && (
                    <span className='text-gray-400 text-xs ml-auto'>({option.count})</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown
