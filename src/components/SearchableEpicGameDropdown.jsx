import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'
import { useEpicGames } from '../hooks/useEpicGames'

const SearchableEpicGameDropdown = ({
  selectedGames = [],
  onGamesChange = () => {},
  placeholder = 'Search for Epic Games...'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const { games, loading, error } = useEpicGames()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter games based on search term
  const filteredGames = games.filter(
    game =>
      game.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.abbr?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGameToggle = gameValue => {
    const newSelectedGames = selectedGames.includes(gameValue)
      ? selectedGames.filter(g => g !== gameValue)
      : [...selectedGames, gameValue]

    onGamesChange(newSelectedGames)
  }

  const handleRemoveGame = (gameValue, event) => {
    event.stopPropagation()
    const newSelectedGames = selectedGames.filter(g => g !== gameValue)
    onGamesChange(newSelectedGames)
  }

  const getSelectedGamesDisplay = () => {
    if (selectedGames.length === 0) return placeholder
    if (selectedGames.length === 1) {
      const game = games.find(g => g.value === selectedGames[0])
      return game ? game.label : `${selectedGames.length} game selected`
    }
    return `${selectedGames.length} games selected`
  }

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Main dropdown button */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-left text-white hover:border-purple-500 focus:border-purple-500 focus:outline-none transition-colors'
      >
        <div className='flex items-center justify-between'>
          <div className='flex flex-wrap gap-1 flex-1 mr-2'>
            {selectedGames.length === 0 ? (
              <span className='text-gray-400'>{placeholder}</span>
            ) : selectedGames.length === 1 ? (
              <span className='text-white'>
                {games.find(g => g.value === selectedGames[0])?.label || 'Unknown Game'}
              </span>
            ) : (
              <div className='flex flex-wrap gap-1'>
                {selectedGames.slice(0, 2).map(gameValue => {
                  const game = games.find(g => g.value === gameValue)
                  return (
                    <span
                      key={gameValue}
                      className='bg-purple-600 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1'
                    >
                      {game?.label || 'Unknown'}
                      <button
                        onClick={e => handleRemoveGame(gameValue, e)}
                        className='hover:bg-purple-700 rounded px-0.5'
                      >
                        <Icon icon='mingcute:close-line' className='w-3 h-3' />
                      </button>
                    </span>
                  )
                })}
                {selectedGames.length > 2 && (
                  <span className='text-purple-400 text-xs self-center'>
                    +{selectedGames.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
          <Icon
            icon={isOpen ? 'mingcute:up-line' : 'mingcute:down-line'}
            className='w-4 h-4 text-gray-400'
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className='absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-hidden'>
          {/* Search input */}
          <div className='p-2 border-b border-gray-600'>
            <div className='relative'>
              <Icon
                icon='mingcute:search-line'
                className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400'
              />
              <input
                type='text'
                placeholder='Search games...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full bg-gray-700 border border-gray-600 rounded px-8 py-1.5 text-white placeholder-gray-400 text-sm focus:border-purple-500 focus:outline-none'
                autoFocus
              />
            </div>
          </div>

          {/* Games list */}
          <div className='max-h-48 overflow-y-auto'>
            {loading ? (
              <div className='p-3 text-center text-gray-400'>
                <Icon icon='mingcute:loading-line' className='w-4 h-4 animate-spin inline mr-2' />
                Loading Epic Games...
              </div>
            ) : error ? (
              <div className='p-3 text-center text-red-400'>
                <Icon icon='mingcute:warning-line' className='w-4 h-4 inline mr-2' />
                Error loading games: {error}
              </div>
            ) : filteredGames.length === 0 ? (
              <div className='p-3 text-center text-gray-400'>
                <Icon icon='mingcute:search-line' className='w-4 h-4 inline mr-2' />
                No games found
              </div>
            ) : (
              filteredGames.map(game => (
                <button
                  key={game.value}
                  onClick={() => handleGameToggle(game.value)}
                  className='w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center gap-3 transition-colors'
                >
                  <div
                    className={`w-4 h-4 border border-gray-500 rounded flex items-center justify-center ${
                      selectedGames.includes(game.value)
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    {selectedGames.includes(game.value) && (
                      <Icon icon='mingcute:check-line' className='w-3 h-3 text-white' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='text-white font-medium'>{game.label}</div>
                    {game.abbr && game.abbr !== game.label && (
                      <div className='text-gray-400 text-xs'>{game.abbr}</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Selected games summary */}
          {selectedGames.length > 0 && (
            <div className='border-t border-gray-600 p-2 bg-gray-750'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-400'>{selectedGames.length} games selected</span>
                <button
                  onClick={() => onGamesChange([])}
                  className='text-red-400 hover:text-red-300 transition-colors'
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchableEpicGameDropdown
