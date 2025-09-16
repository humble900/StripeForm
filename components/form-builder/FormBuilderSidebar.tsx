'use client'

import React, { useState } from 'react'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { FormField, FieldType } from '@/types'
import { 
  MagnifyingGlassIcon,
  SparklesIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon, 
  EnvelopeIcon, 
  HashtagIcon,
  ListBulletIcon,
  CheckCircleIcon,
  CalendarIcon,
  PaperClipIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeSlashIcon,
  TableCellsIcon,
  PencilIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function FormBuilderSidebar() {
  const { addField } = useFormBuilder()
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([
    'Choice Fields',
    'Date & Time', 
    'Rating & Scale',
    'Location & Security',
    'Special Fields'
  ])

  const fieldTypes = {
    'Basic Fields': [
      {
        type: 'short_text' as FieldType,
        label: 'Short Text',
        description: 'Single line text input',
        icon: DocumentTextIcon,
        popular: true
      },
      {
        type: 'long_text' as FieldType,
        label: 'Long Text',
        description: 'Multi-line text area',
        icon: ChatBubbleLeftRightIcon,
        popular: false
      },
      {
        type: 'email' as FieldType,
        label: 'Email',
        description: 'Email address input',
        icon: EnvelopeIcon,
        popular: true
      },
      {
        type: 'number' as FieldType,
        label: 'Number',
        description: 'Numeric input field',
        icon: HashtagIcon,
        popular: false
      },
      {
        type: 'geo_restriction' as FieldType,
        label: 'Geo-Restriction',
        description: 'Restrict by country or IP',
        icon: MapPinIcon,
        popular: false
      },
      {
        type: 'cover_slide' as FieldType,
        label: 'Cover Slide',
        description: 'Welcome screen slide',
        icon: PhotoIcon,
        popular: true
      },
      {
        type: 'end_page' as FieldType,
        label: 'End Screen',
        description: 'Thank-you page',
        icon: SparklesIcon,
        popular: true
      },
      {
        type: 'url_redirect' as FieldType,
        label: 'URL Redirect',
        description: 'Redirect to a URL',
        icon: LinkIcon,
        popular: false
      },
      
    ],
    'Choice Fields': [
      {
        type: 'dropdown' as FieldType,
        label: 'Dropdown',
        description: 'Select from options',
        icon: ListBulletIcon,
        popular: true
      },
      {
        type: 'multiple_choice' as FieldType,
        label: 'Multiple Choice',
        description: 'Radio button options',
        icon: CheckCircleIcon,
        popular: true
      },
      {
        type: 'checkbox' as FieldType,
        label: 'Checkboxes',
        description: 'Multiple selections',
        icon: CheckCircleIcon,
        popular: false
      },
      {
        type: 'yes_no' as FieldType,
        label: 'Yes or No',
        description: 'Simple yes/no question',
        icon: QuestionMarkCircleIcon,
        popular: true
      },
      {
        type: 'matrix_grid' as FieldType,
        label: 'Matrix/Grid',
        description: 'Grid of questions and options',
        icon: TableCellsIcon,
        popular: false
      },
      {
        type: 'signature_upload' as FieldType,
        label: 'Signature Upload',
        description: 'Digital signature field',
        icon: PencilIcon,
        popular: false
      }
    ],
    'Date & Time': [
      {
        type: 'date' as FieldType,
        label: 'Date',
        description: 'Single date picker',
        icon: CalendarIcon,
        popular: true
      },
      {
        type: 'multiple_dates' as FieldType,
        label: 'Multiple Dates',
        description: 'Select multiple dates',
        icon: CalendarIcon,
        popular: false
      },
      {
        type: 'time' as FieldType,
        label: 'Time',
        description: 'Time picker',
        icon: ClockIcon,
        popular: false
      },
      {
        type: 'time_range' as FieldType,
        label: 'Time Range',
        description: 'Start and end time',
        icon: ClockIcon,
        popular: false
      }
    ],
    'Rating & Scale': [
      {
        type: 'star_rating' as FieldType,
        label: 'Star Rating',
        description: '5-star rating system',
        icon: StarIcon,
        popular: true
      },
      {
        type: 'linear_scale' as FieldType,
        label: 'Linear Scale',
        description: '1-10 scale rating',
        icon: HashtagIcon,
        popular: false
      },
      {
        type: 'nps_score' as FieldType,
        label: 'NPS Score',
        description: 'Net Promoter Score (0-10)',
        icon: HeartIcon,
        popular: false
      },
      {
        type: 'likert_scale' as FieldType,
        label: 'Likert Scale',
        description: 'Agreement scale (1-5)',
        icon: CheckCircleIcon,
        popular: false
      },
      {
        type: 'ranking' as FieldType,
        label: 'Ranking',
        description: 'Drag to rank options',
        icon: ListBulletIcon,
        popular: false
      }
    ],
    'Location & Security': [
      {
        type: 'location' as FieldType,
        label: 'Location',
        description: 'Address or coordinates',
        icon: MapPinIcon,
        popular: false
      },
      {
        type: 'captcha' as FieldType,
        label: 'Captcha',
        description: 'Security verification',
        icon: LockClosedIcon,
        popular: false
      }
    ],
    'Special Fields': [
      {
        type: 'address' as FieldType,
        label: 'Address',
        description: 'Google-powered address',
        icon: MapPinIcon,
        popular: true
      },
      {
        type: 'file_upload' as FieldType,
        label: 'File Upload',
        description: 'Upload documents',
        icon: PaperClipIcon,
        popular: false
      },
      {
        type: 'payment' as FieldType,
        label: 'Payment',
        description: 'Payment processing',
        icon: CurrencyDollarIcon,
        popular: false
      },
      {
        type: 'image_upload' as FieldType,
        label: 'Image Upload',
        description: 'Upload images',
        icon: PhotoIcon,
        popular: false
      },
      {
        type: 'video_upload' as FieldType,
        label: 'Video Upload',
        description: 'Upload videos',
        icon: PhotoIcon,
        popular: false
      },
      {
        type: 'phone' as FieldType,
        label: 'Phone Number',
        description: 'Phone number input',
        icon: PhoneIcon,
        popular: false
      },
      {
        type: 'name' as FieldType,
        label: 'Full Name',
        description: 'First and last name',
        icon: UserIcon,
        popular: false
      },
      {
        type: 'password' as FieldType,
        label: 'Password',
        description: 'Secure password field',
        icon: ShieldCheckIcon,
        popular: false
      }
    ]
  }

  const handleAddField = (fieldType: FieldType, fieldLabel: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType,
      label: '', // Don't set a default label - let the placeholder show
      required: false,
      placeholder: '',
      options: fieldType === 'dropdown' || fieldType === 'multiple_choice' || fieldType === 'checkbox' 
        ? ['Option 1', 'Option 2', 'Option 3'] 
        : fieldType === 'yes_no'
        ? ['Yes', 'No']
        : fieldType === 'star_rating'
        ? ['1', '2', '3', '4', '5']
        : fieldType === 'linear_scale'
        ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        : fieldType === 'nps_score'
        ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        : fieldType === 'likert_scale'
        ? ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
        : fieldType === 'ranking'
        ? ['Option 1', 'Option 2', 'Option 3', 'Option 4']
        : fieldType === 'multiple_dates'
        ? ['Date 1', 'Date 2', 'Date 3']
        : fieldType === 'time_range'
        ? ['Start Time', 'End Time']
        : fieldType === 'matrix_grid'
        ? ['Row 1', 'Row 2', 'Row 3']
        : fieldType === 'captcha'
        ? ['Verify', 'Refresh']
        : undefined,
      validation: [],
      settings: {}
    }
    addField(newField)
  }

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const filteredFieldTypes = Object.entries(fieldTypes).reduce((acc, [category, fields]) => {
    const filteredFields = fields.filter(field =>
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filteredFields.length > 0) {
      acc[category as keyof typeof fieldTypes] = filteredFields
    }
    return acc
  }, {} as typeof fieldTypes)

  return (
    <div className="w-72 bg-white border-r border-gray-200 shadow-lg overflow-y-auto h-full sidebar-scroll">
      {/* Header */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-[#6C5CE7] to-purple-600">
        <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <SparklesIcon className="h-3.5 w-3.5 md:h-5 md:w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm md:text-lg font-semibold text-white">Form Fields</h3>
            <p className="text-xs md:text-sm text-white text-opacity-80">Add fields to your form</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          />
        </div>
      </div>

      {/* Field Categories */}
      <TooltipProvider>
      <div className="p-2 md:p-3">
        {Object.entries(filteredFieldTypes).map(([category, fields]) => {
          const isCollapsed = collapsedCategories.includes(category)
          return (
            <div key={category} className="mb-4 md:mb-6">
            <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full text-left p-2 md:p-2.5 rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
              >
                                 <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide group-hover:text-gray-900">
                   {category}
                 </h4>
                {isCollapsed ? (
                  <ChevronRightIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                ) : (
                  <ChevronDownIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              )}
            </button>
            
              {!isCollapsed && (
                <div className="space-y-1 md:space-y-1.5 mt-1.5 md:mt-2 animate-in slide-in-from-top-2 duration-200">
                  {fields.map((field) => {
                    const IconComponent = field.icon
                    return (
                  <Tooltip key={field.type}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => handleAddField(field.type, field.label)}
                        className="group cursor-pointer p-2 md:p-2.5 rounded-lg border border-gray-200 hover:border-[#6C5CE7] hover:bg-[#6C5CE7] hover:bg-opacity-5 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-[#6C5CE7] to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <IconComponent className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-1 md:space-x-2">
                              <span className="text-[11px] md:text-[12px] font-medium text-gray-900 group-hover:text-[#6C5CE7] transition-colors">
                                {field.label}
                              </span>
                            </div>
                          </div>
                          <PlusIcon className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-400 group-hover:text-[#6C5CE7] transition-colors" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">{field.description}</p>
                    </TooltipContent>
                  </Tooltip>
                    )
                  })}
              </div>
            )}
          </div>
          )
        })}

        {/* No results message */}
        {Object.keys(filteredFieldTypes).length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <MagnifyingGlassIcon className="h-8 w-8 mx-auto" />
      </div>
            <p className="text-sm text-gray-500">No fields found matching "{searchQuery}"</p>
          <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-[#6C5CE7] hover:underline"
            >
              Clear search
          </button>
        </div>
        )}
      </div>
      </TooltipProvider>
    </div>
  )
} 