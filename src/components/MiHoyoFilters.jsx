import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

const MiHoyoFilters = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    // Pagination
    page: 1,

    // Price filters
    pmin: '',
    pmax: '',

    // General filters
    title: '',
    order_by: 'price_to_up',

    // General account settings
    email: '', // With Mail: '', 'yes', 'no'
    origin: [], // Account origin
    not_origin: [], // Exclude Account origin
    region: [], // Asia, North America, Europe, Taiwan
    not_region: [], // Exclude Region
    daybreak: '', // Days Inactive
    ea: '', // Social Accounts: '', 'yes', 'no'

    // Genshin Impact filters
    genshin_character: [], // Character IDs
    genshin_char_min: '',
    genshin_char_max: '',
    genshin_legendary_min: '',
    genshin_legendary_max: '',
    genshin_level_min: '', // Adventure Rank
    genshin_level_max: '',
    genshin_legendary_weapon_min: '',
    genshin_legendary_weapon_max: '',
    constellations_min: '',
    constellations_max: '',
    genshin_achievement_min: '',
    genshin_achievement_max: '',
    genshin_currency_min: '', // Primogems
    genshin_currency_max: '',

    // Honkai: Star Rail filters
    honkai_character: [], // Character IDs
    honkai_char_min: '',
    honkai_char_max: '',
    honkai_legendary_min: '',
    honkai_legendary_max: '',
    honkai_level_min: '', // Trailblazer Level
    honkai_level_max: '',
    honkai_legendary_weapon_min: '', // Light Cones
    honkai_legendary_weapon_max: '',
    eidolons_min: '',
    eidolons_max: '',
    honkai_achievement_min: '',
    honkai_achievement_max: '',
    honkai_currency_min: '', // Stellar Jade
    honkai_currency_max: '',

    // Zenless Zone Zero filters
    zenless_character: [], // Character IDs
    zenless_char_min: '',
    zenless_char_max: '',
    zenless_legendary_min: '',
    zenless_legendary_max: '',
    zenless_level_min: '', // Inter-Knot Level
    zenless_level_max: '',
    zenless_legendary_weapon_min: '', // W-Engines
    zenless_legendary_weapon_max: '',
    cinemas_min: '', // Mindscape Cinemas
    cinemas_max: '',
    zenless_currency_min: '', // Polychrome
    zenless_currency_max: ''
  })

  const [expandedSections, setExpandedSections] = useState({
    genshin: false,
    honkai: false,
    zenless: false
  })

  // Genshin Impact characters data
  const genshinCharacters = [
    { value: '10000038', label: 'Albedo' },
    { value: '10000078', label: 'Alhaitham' },
    { value: '10000062', label: 'Aloy' },
    { value: '10000021', label: 'Amber' },
    { value: '10000096', label: 'Arlecchino' },
    { value: '10000082', label: 'Baizhu' },
    { value: '10000014', label: 'Barbara' },
    { value: '10000024', label: 'Beidou' },
    { value: '10000032', label: 'Bennett' },
    { value: '10000072', label: 'Candace' },
    { value: '10000088', label: 'Charlotte' },
    { value: '10000090', label: 'Chevreuse' },
    { value: '10000094', label: 'Chiori' },
    { value: '10000036', label: 'Chongyun' },
    { value: '10000098', label: 'Clorinde' },
    { value: '10000067', label: 'Collei' },
    { value: '10000071', label: 'Cyno' },
    { value: '10000079', label: 'Dehya' },
    { value: '10000016', label: 'Diluc' },
    { value: '10000039', label: 'Diona' },
    { value: '10000068', label: 'Dori' },
    { value: '10000099', label: 'Emilie' },
    { value: '10000051', label: 'Eula' },
    { value: '10000076', label: 'Faruzan' },
    { value: '10000031', label: 'Fischl' },
    { value: '10000085', label: 'Freminet' },
    { value: '10000089', label: 'Furina' },
    { value: '10000092', label: 'Gaming' },
    { value: '10000037', label: 'Ganyu' },
    { value: '10000055', label: 'Gorou' },
    { value: '10000046', label: 'Hu Tao' },
    { value: '10000003', label: 'Jean' },
    { value: '10000100', label: 'Kachina' },
    { value: '10000047', label: 'Kaedehara Kazuha' },
    { value: '10000015', label: 'Kaeya' },
    { value: '10000002', label: 'Kamisato Ayaka' },
    { value: '10000066', label: 'Kamisato Ayato' },
    { value: '10000081', label: 'Kaveh' },
    { value: '10000042', label: 'Keqing' },
    { value: '10000101', label: 'Kinich' },
    { value: '10000061', label: 'Kirara' },
    { value: '10000029', label: 'Klee' },
    { value: '10000056', label: 'Kujou Sara' },
    { value: '10000065', label: 'Kuki Shinobu' },
    { value: '10000074', label: 'Layla' },
    { value: '10000006', label: 'Lisa' },
    { value: '10000083', label: 'Lynette' },
    { value: '10000084', label: 'Lyney' },
    { value: '10000080', label: 'Mika' },
    { value: '10000041', label: 'Mona' },
    { value: '10000102', label: 'Mualani' },
    { value: '10000073', label: 'Nahida' },
    { value: '10000091', label: 'Navia' },
    { value: '10000087', label: 'Neuvillette' },
    { value: '10000070', label: 'Nilou' },
    { value: '10000027', label: 'Ningguang' },
    { value: '10000034', label: 'Noelle' },
    { value: '10000035', label: 'Qiqi' },
    { value: '10000052', label: 'Raiden Shogun' },
    { value: '10000020', label: 'Razor' },
    { value: '10000045', label: 'Rosaria' },
    { value: '10000054', label: 'Sangonomiya Kokomi' },
    { value: '10000053', label: 'Sayu' },
    { value: '10000097', label: 'Sethos' },
    { value: '10000063', label: 'Shenhe' },
    { value: '10000059', label: 'Shikanoin Heizou' },
    { value: '10000095', label: 'Sigewinne' },
    { value: '10000043', label: 'Sucrose' },
    { value: '10000033', label: 'Tartaglia' },
    { value: '10000050', label: 'Thoma' },
    { value: '10000069', label: 'Tighnari' },
    { value: '10000005', label: 'Traveler' },
    { value: '10000022', label: 'Venti' },
    { value: '10000075', label: 'Wanderer' },
    { value: '10000086', label: 'Wriothesley' },
    { value: '10000023', label: 'Xiangling' },
    { value: '10000093', label: 'Xianyun' },
    { value: '10000026', label: 'Xiao' },
    { value: '10000025', label: 'Xingqiu' },
    { value: '10000044', label: 'Xinyan' },
    { value: '10000058', label: 'Yae Miko' },
    { value: '10000048', label: 'Yanfei' },
    { value: '10000077', label: 'Yaoyao' },
    { value: '10000060', label: 'Yelan' },
    { value: '10000049', label: 'Yoimiya' },
    { value: '10000064', label: 'Yun Jin' },
    { value: '10000030', label: 'Zhongli' }
  ]

  // Honkai: Star Rail characters data
  const honkaiCharacters = [
    { value: '1308', label: 'Acheron' },
    { value: '1302', label: 'Argenti' },
    { value: '1008', label: 'Arlan' },
    { value: '1009', label: 'Asta' },
    { value: '1304', label: 'Aventurine' },
    { value: '1211', label: 'Bailu' },
    { value: '1307', label: 'Black Swan' },
    { value: '1205', label: 'Blade' },
    { value: '1315', label: 'Boothill' },
    { value: '1101', label: 'Bronya' },
    { value: '1107', label: 'Clara' },
    { value: '1002', label: 'Dan Heng' },
    { value: '1213', label: 'Dan Heng • Imbibitor Lunae' },
    { value: '1305', label: 'Dr. Ratio' },
    { value: '1220', label: 'Feixiao' },
    { value: '1310', label: 'Firefly' },
    { value: '1208', label: 'Fu Xuan' },
    { value: '1301', label: 'Gallagher' },
    { value: '1104', label: 'Gepard' },
    { value: '1210', label: 'Guinaifen' },
    { value: '1215', label: 'Hanya' },
    { value: '1013', label: 'Herta' },
    { value: '1013', label: 'Himeko' },
    { value: '1109', label: 'Hook' },
    { value: '1217', label: 'Huohuo' },
    { value: '1314', label: 'Jade' },
    { value: '1218', label: 'Jiaoqiu' },
    { value: '1204', label: 'Jing Yuan' },
    { value: '1212', label: 'Jingliu' },
    { value: '1005', label: 'Kafka' },
    { value: '1111', label: 'Luka' },
    { value: '1203', label: 'Luocha' },
    { value: '1110', label: 'Lynx' },
    { value: '1001', label: 'March 7th' },
    { value: '1224', label: 'March 7th (The Hunt)' },
    { value: '1312', label: 'Misha' },
    { value: '1223', label: 'Moze' },
    { value: '1105', label: 'Natasha' },
    { value: '1106', label: 'Pela' },
    { value: '1201', label: 'Qingque' },
    { value: '1309', label: 'Robin' },
    { value: '1303', label: 'Ruan Mei' },
    { value: '1108', label: 'Sampo' },
    { value: '1102', label: 'Seele' },
    { value: '1103', label: 'Serval' },
    { value: '1006', label: 'Silver Wolf' },
    { value: '1306', label: 'Sparkle' },
    { value: '1206', label: 'Sushang' },
    { value: '1202', label: 'Tingyun' },
    { value: '1112', label: 'Topaz & Numby' },
    { value: '8001', label: 'Trailblazer' },
    { value: '1004', label: 'Welt' },
    { value: '1214', label: 'Xueyi' },
    { value: '1209', label: 'Yanqing' },
    { value: '1207', label: 'Yukong' },
    { value: '1221', label: 'Yunli' }
  ]

  // Zenless Zone Zero characters data
  const zenlessCharacters = [
    { value: '1211', label: 'Alexandrina Sebastiane' },
    { value: '1011', label: 'Anby Demara' },
    { value: '1111', label: 'Anton Ivanov' },
    { value: '1121', label: 'Ben Bigger' },
    { value: '1081', label: 'Billy Kid' },
    { value: '1061', label: 'Corin Wickes' },
    { value: '1191', label: 'Ellen Joe' },
    { value: '1181', label: 'Grace Howard' },
    { value: '1261', label: 'Jane Doe' },
    { value: '1101', label: 'Koleda Belobog' },
    { value: '1151', label: 'Luciana de Montefio' },
    { value: '1021', label: 'Nekomiya Mana' },
    { value: '1031', label: 'Nicole Demara' },
    { value: '1281', label: 'Piper Wheel' },
    { value: '1251', label: 'Qingyi' },
    { value: '1271', label: 'Seth Lowell' },
    { value: '1041', label: 'Soldier 11' },
    { value: '1131', label: 'Soukaku' },
    { value: '1141', label: 'Von Lycaon' },
    { value: '1241', label: 'Zhu Yuan' }
  ]

  // Origin options
  const originOptions = [
    { value: 'brute', label: 'Brute' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'stealer', label: 'Stealer' },
    { value: 'personal', label: 'Personal' },
    { value: 'resale', label: 'Resale' },
    { value: 'autoreg', label: 'Autoreg' },
    { value: 'dummy', label: 'Dummy' }
  ]

  // Region options
  const regionOptions = [
    { value: 'asia', label: 'Asia' },
    { value: 'usa', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'cht', label: 'Taiwan' }
  ]

  // Sort options
  const sortOptions = [
    { value: 'price_to_up', label: 'Cheapest' },
    { value: 'price_to_down', label: 'Expensive' },
    { value: 'pdate_to_down_upload', label: 'Newest' },
    { value: 'pdate_to_up_upload', label: 'Oldest' }
  ]

  // Popular MiHoYo searches
  const popularSearches = [
    { game: 'genshin', character: '10000089', label: 'Furina' },
    { game: 'genshin', character: '10000073', label: 'Nahida' },
    { game: 'genshin', character: '10000052', label: 'Raiden Shogun' },
    { game: 'genshin', character: '10000030', label: 'Zhongli' },
    { game: 'honkai', character: '1308', label: 'Acheron' },
    { game: 'honkai', character: '1310', label: 'Firefly' },
    { game: 'honkai', character: '1204', label: 'Jing Yuan' },
    { game: 'zenless', character: '1191', label: 'Ellen Joe' },
    { game: 'zenless', character: '1241', label: 'Zhu Yuan', icon: '👮' }
  ]

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Handle array filter changes (for multi-select)
  const handleArrayFilterChange = (key, values) => {
    const newFilters = { ...filters, [key]: values }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Handle popular search clicks
  const handlePopularSearchClick = search => {
    const characterKey = `${search.game}_character`
    const currentCharacters = filters[characterKey] || []

    let newCharacters
    if (currentCharacters.includes(search.character)) {
      // Remove if already selected
      newCharacters = currentCharacters.filter(c => c !== search.character)
    } else {
      // Add if not selected
      newCharacters = [...currentCharacters, search.character]
    }

    handleArrayFilterChange(characterKey, newCharacters)
  }

  // Toggle section expansion
  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {
      page: 1,
      pmin: '',
      pmax: '',
      title: '',
      order_by: 'price_to_up',
      email: '',
      origin: [],
      not_origin: [],
      region: [],
      not_region: [],
      daybreak: '',
      ea: '',
      genshin_character: [],
      genshin_char_min: '',
      genshin_char_max: '',
      genshin_legendary_min: '',
      genshin_legendary_max: '',
      genshin_level_min: '',
      genshin_level_max: '',
      genshin_legendary_weapon_min: '',
      genshin_legendary_weapon_max: '',
      constellations_min: '',
      constellations_max: '',
      genshin_achievement_min: '',
      genshin_achievement_max: '',
      genshin_currency_min: '',
      genshin_currency_max: '',
      honkai_character: [],
      honkai_char_min: '',
      honkai_char_max: '',
      honkai_legendary_min: '',
      honkai_legendary_max: '',
      honkai_level_min: '',
      honkai_level_max: '',
      honkai_legendary_weapon_min: '',
      honkai_legendary_weapon_max: '',
      eidolons_min: '',
      eidolons_max: '',
      honkai_achievement_min: '',
      honkai_achievement_max: '',
      honkai_currency_min: '',
      honkai_currency_max: '',
      zenless_character: [],
      zenless_char_min: '',
      zenless_char_max: '',
      zenless_legendary_min: '',
      zenless_legendary_max: '',
      zenless_level_min: '',
      zenless_level_max: '',
      zenless_legendary_weapon_min: '',
      zenless_legendary_weapon_max: '',
      cinemas_min: '',
      cinemas_max: '',
      zenless_currency_min: '',
      zenless_currency_max: ''
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Popular Character Searches */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-purple-400 mb-4'>
          <Icon icon='game-icons:crowned-heart' className='inline w-5 h-5 mr-2' />
          🔥 Popular MiHoYo Characters
        </h3>
        <div className='grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2'>
          {popularSearches.map((search, index) => {
            const isSelected = filters[`${search.game}_character`]?.includes(search.character)
            return (
              <button
                key={index}
                onClick={() => handlePopularSearchClick(search)}
                className={`flex items-center justify-center p-3 rounded-lg text-sm transition-all duration-200 border ${
                  isSelected
                    ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                    : 'bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white border-gray-600 hover:border-purple-500'
                }`}
                title={`Filter ${search.game} accounts with ${search.label}`}
              >
                <span className='font-medium text-xs truncate'>{search.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Filter Controls */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Column 1: General & Genshin Impact */}
        <div className='space-y-4'>
          {/* Price Range */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <h4 className='text-white font-medium mb-3'>
              <Icon icon='mdi:currency-usd' className='inline w-4 h-4 mr-1' />
              Price Range
            </h4>
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                placeholder='Min price'
                value={filters.pmin}
                onChange={e => handleFilterChange('pmin', e.target.value)}
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
              />
              <input
                type='number'
                placeholder='Max price'
                value={filters.pmax}
                onChange={e => handleFilterChange('pmax', e.target.value)}
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Email Access */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <h4 className='text-white font-medium mb-3'>
              <Icon icon='mdi:email-check' className='inline w-4 h-4 mr-1' />
              With Mail
            </h4>
            <div className='flex space-x-2'>
              {[
                { value: '', label: 'Any' },
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('email', option.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.email === option.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days Inactive */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <h4 className='text-white font-medium mb-3'>
              <Icon icon='mdi:clock-outline' className='inline w-4 h-4 mr-1' />
              Days Inactive
            </h4>
            <input
              type='number'
              placeholder='Days inactive'
              value={filters.daybreak}
              onChange={e => handleFilterChange('daybreak', e.target.value)}
              className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
            />
          </div>

          {/* Account Origin */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <h4 className='text-white font-medium mb-3'>
              <Icon icon='mdi:source-branch' className='inline w-4 h-4 mr-1' />
              Account Origin
            </h4>
            <div className='space-y-2'>
              <select
                multiple
                value={filters.origin}
                onChange={e =>
                  handleArrayFilterChange(
                    'origin',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )
                }
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none'
                size='3'
              >
                {originOptions.map(option => (
                  <option
                    key={option.value}
                    value={option.value}
                    className='bg-gray-700 text-white'
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div className='text-xs text-gray-400'>Hold Ctrl/Cmd to select multiple</div>
            </div>
          </div>

          {/* Genshin Impact Section */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <button
              onClick={() => toggleSection('genshin')}
              className='w-full flex items-center justify-between text-white font-medium mb-3 hover:text-purple-400 transition-colors'
            >
              <span>
                <Icon icon='game-icons:sword-brandish' className='inline w-4 h-4 mr-1' />
                Genshin Impact
              </span>
              <Icon
                icon={expandedSections.genshin ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                className='w-5 h-5'
              />
            </button>

            {expandedSections.genshin && (
              <div className='space-y-4'>
                {/* Genshin Characters */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Characters</label>
                  <select
                    multiple
                    value={filters.genshin_character}
                    onChange={e =>
                      handleArrayFilterChange(
                        'genshin_character',
                        Array.from(e.target.selectedOptions, option => option.value)
                      )
                    }
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none max-h-32 overflow-y-auto'
                    size='4'
                  >
                    {genshinCharacters.map(char => (
                      <option
                        key={char.value}
                        value={char.value}
                        className='bg-gray-700 text-white'
                      >
                        {char.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Character Count Range */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Characters Count</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.genshin_char_min}
                      onChange={e => handleFilterChange('genshin_char_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.genshin_char_max}
                      onChange={e => handleFilterChange('genshin_char_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>

                {/* Adventure Rank */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Adventure Rank</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.genshin_level_min}
                      onChange={e => handleFilterChange('genshin_level_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.genshin_level_max}
                      onChange={e => handleFilterChange('genshin_level_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>

                {/* Primogems */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Primogems</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.genshin_currency_min}
                      onChange={e => handleFilterChange('genshin_currency_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.genshin_currency_max}
                      onChange={e => handleFilterChange('genshin_currency_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Honkai Star Rail */}
        <div className='space-y-4'>
          {/* Social Accounts */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <h4 className='text-white font-medium mb-3'>
              <Icon icon='mdi:account-group' className='inline w-4 h-4 mr-1' />
              Social Accounts
            </h4>
            <div className='flex space-x-2'>
              {[
                { value: '', label: 'Any' },
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('ea', option.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.ea === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Honkai Star Rail Section */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <button
              onClick={() => toggleSection('honkai')}
              className='w-full flex items-center justify-between text-white font-medium mb-3 hover:text-purple-400 transition-colors'
            >
              <span>
                <Icon icon='game-icons:spaceship' className='inline w-4 h-4 mr-1' />
                Honkai: Star Rail
              </span>
              <Icon
                icon={expandedSections.honkai ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                className='w-5 h-5'
              />
            </button>

            {expandedSections.honkai && (
              <div className='space-y-4'>
                {/* Honkai Characters */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Characters</label>
                  <select
                    multiple
                    value={filters.honkai_character}
                    onChange={e =>
                      handleArrayFilterChange(
                        'honkai_character',
                        Array.from(e.target.selectedOptions, option => option.value)
                      )
                    }
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none max-h-32 overflow-y-auto'
                    size='4'
                  >
                    {honkaiCharacters.map(char => (
                      <option
                        key={char.value}
                        value={char.value}
                        className='bg-gray-700 text-white'
                      >
                        {char.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Character Count Range */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Characters Count</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.honkai_char_min}
                      onChange={e => handleFilterChange('honkai_char_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.honkai_char_max}
                      onChange={e => handleFilterChange('honkai_char_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>

                {/* Trailblazer Level */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Trailblazer Level</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.honkai_level_min}
                      onChange={e => handleFilterChange('honkai_level_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.honkai_level_max}
                      onChange={e => handleFilterChange('honkai_level_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>

                {/* Stellar Jade */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Stellar Jade</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.honkai_currency_min}
                      onChange={e => handleFilterChange('honkai_currency_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.honkai_currency_max}
                      onChange={e => handleFilterChange('honkai_currency_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Zenless Zone Zero & Regions */}
        <div className='space-y-4'>
          {/* Region */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <h4 className='text-white font-medium mb-3'>
              <Icon icon='mdi:earth' className='inline w-4 h-4 mr-1' />
              Region
            </h4>
            <div className='space-y-2'>
              <select
                multiple
                value={filters.region}
                onChange={e =>
                  handleArrayFilterChange(
                    'region',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )
                }
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none'
                size='3'
              >
                {regionOptions.map(option => (
                  <option
                    key={option.value}
                    value={option.value}
                    className='bg-gray-700 text-white'
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div className='text-xs text-gray-400'>Hold Ctrl/Cmd to select multiple</div>
            </div>
          </div>

          {/* Zenless Zone Zero Section */}
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-600'>
            <button
              onClick={() => toggleSection('zenless')}
              className='w-full flex items-center justify-between text-white font-medium mb-3 hover:text-purple-400 transition-colors'
            >
              <span>
                <Icon icon='game-icons:urban-city' className='inline w-4 h-4 mr-1' />
                Zenless Zone Zero
              </span>
              <Icon
                icon={expandedSections.zenless ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                className='w-5 h-5'
              />
            </button>

            {expandedSections.zenless && (
              <div className='space-y-4'>
                {/* Zenless Characters */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Characters</label>
                  <select
                    multiple
                    value={filters.zenless_character}
                    onChange={e =>
                      handleArrayFilterChange(
                        'zenless_character',
                        Array.from(e.target.selectedOptions, option => option.value)
                      )
                    }
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none max-h-32 overflow-y-auto'
                    size='4'
                  >
                    {zenlessCharacters.map(char => (
                      <option
                        key={char.value}
                        value={char.value}
                        className='bg-gray-700 text-white'
                      >
                        {char.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Character Count Range */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Characters Count</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.zenless_char_min}
                      onChange={e => handleFilterChange('zenless_char_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.zenless_char_max}
                      onChange={e => handleFilterChange('zenless_char_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>

                {/* Inter-Knot Level */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Inter-Knot Level</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.zenless_level_min}
                      onChange={e => handleFilterChange('zenless_level_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.zenless_level_max}
                      onChange={e => handleFilterChange('zenless_level_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>

                {/* Polychrome */}
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>Polychrome</label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      placeholder='From'
                      value={filters.zenless_currency_min}
                      onChange={e => handleFilterChange('zenless_currency_min', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                    <input
                      type='number'
                      placeholder='To'
                      value={filters.zenless_currency_max}
                      onChange={e => handleFilterChange('zenless_currency_max', e.target.value)}
                      className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sort and Action Buttons */}
      <div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-600'>
        {/* Sort Options */}
        <div className='flex items-center space-x-2'>
          <span className='text-gray-300 text-sm'>Sort by:</span>
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleFilterChange('order_by', option.value)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.order_by === option.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className='flex items-center space-x-3'>
          <button
            onClick={clearAllFilters}
            className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-red-600 hover:border-red-500'
            disabled={loading}
          >
            <Icon icon='mdi:filter-off' className='inline w-4 h-4 mr-1' />
            Clear All
          </button>

          <button
            onClick={() => onFilterChange(filters)}
            className='bg-purple-700 hover:bg-purple-600 text-purple-100 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-purple-600 hover:border-purple-500'
            disabled={loading}
          >
            <Icon icon='mdi:filter-check' className='inline w-4 h-4 mr-1' />
            {loading ? 'Updating...' : 'Update Results'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiHoyoFilters
