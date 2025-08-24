import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'

const SearchableCosmeticDropdown = ({
  selectedItems = [],
  onItemChange,
  itemsList = [],
  placeholder = 'Search cosmetic items...',
  label = 'Select Cosmetic Items',
  disabled = false,
  type = 'skins' // skins, pickaxes, emotes, gliders
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  // Filter items based on search term
  const filteredItems = itemsList.filter(
    item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleItemToggle = item => {
    const isSelected = selectedItems.some(selectedItem => selectedItem.value === item.value)
    let newSelectedItems

    if (isSelected) {
      newSelectedItems = selectedItems.filter(selectedItem => selectedItem.value !== item.value)
    } else {
      newSelectedItems = [...selectedItems, item]
    }

    onItemChange(newSelectedItems)
  }

  const handleRemoveItem = itemToRemove => {
    const newSelectedItems = selectedItems.filter(item => item.value !== itemToRemove.value)
    onItemChange(newSelectedItems)
  }

  const handleClearAll = () => {
    onItemChange([])
    setSearchTerm('')
  }

  // Get icon based on type
  const getTypeIcon = () => {
    switch (type) {
      case 'skins':
        return 'game-icons:leather-armor'
      case 'pickaxes':
        return 'game-icons:mining'
      case 'emotes':
        return 'game-icons:dance'
      case 'gliders':
        return 'game-icons:parachute'
      default:
        return 'game-icons:chest-armor'
    }
  }

  return (
    <div className='space-y-2' ref={dropdownRef}>
      <label className='text-gray-300 text-sm font-medium flex items-center gap-2'>
        <Icon icon={getTypeIcon()} className='w-4 h-4' />
        {label}
      </label>

      {/* Selected Items Display */}
      {selectedItems.length > 0 && (
        <div className='flex flex-wrap gap-1 p-2 bg-gray-800 rounded-lg border border-gray-600 max-h-20 overflow-y-auto'>
          {selectedItems.map(item => (
            <span
              key={item.value}
              className='inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded-md'
            >
              {item.label}
              <button
                onClick={() => handleRemoveItem(item)}
                className='hover:bg-purple-700 rounded-full p-0.5'
                type='button'
              >
                <Icon icon='material-symbols:close' className='w-3 h-3' />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            className='text-gray-400 hover:text-gray-200 text-xs px-1'
            type='button'
          >
            Clear All
          </button>
        </div>
      )}

      {/* Dropdown Button */}
      <div className='relative'>
        <button
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-left text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'
          }`}
        >
          <span className='text-gray-400'>
            {itemsList.length === 0
              ? 'Loading...'
              : selectedItems.length === 0
                ? placeholder
                : `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`}
          </span>
          <Icon
            icon={
              isOpen ? 'material-symbols:keyboard-arrow-up' : 'material-symbols:keyboard-arrow-down'
            }
            className='w-5 h-5 text-gray-400'
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className='absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-hidden'>
            {/* Search Input */}
            <div className='p-2 border-b border-gray-600'>
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={`Search ${type}...`}
                className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                autoFocus
              />
            </div>

            {/* Items List */}
            <div className='max-h-48 overflow-y-auto'>
              {filteredItems.length === 0 ? (
                <div className='p-3 text-gray-400 text-sm text-center'>
                  {itemsList.length === 0 ? 'Loading items...' : 'No items found'}
                </div>
              ) : (
                filteredItems.map(item => {
                  const isSelected = selectedItems.some(
                    selectedItem => selectedItem.value === item.value
                  )
                  return (
                    <button
                      key={item.value}
                      type='button'
                      onClick={() => handleItemToggle(item)}
                      className={`w-full px-3 py-2 text-left text-sm border-b border-gray-700 last:border-b-0 hover:bg-gray-700 flex items-center justify-between ${
                        isSelected ? 'bg-purple-900 text-purple-100' : 'text-gray-300'
                      }`}
                    >
                      <span className='truncate'>{item.label}</span>
                      {isSelected && (
                        <Icon
                          icon='material-symbols:check'
                          className='w-4 h-4 text-purple-400 flex-shrink-0 ml-2'
                        />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {filteredItems.length > 0 && (
              <div className='p-2 border-t border-gray-600 bg-gray-750'>
                <div className='text-xs text-gray-400 text-center'>
                  {filteredItems.length} of {itemsList.length} {type}
                  {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchableCosmeticDropdown
