import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { urlAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  LinkIcon, 
  ClipboardDocumentIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline'

const UrlShortener = () => {
  const [shortenedUrl, setShortenedUrl] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const shortenMutation = useMutation({
    mutationFn: urlAPI.shortenUrl,
    onSuccess: (response) => {
      setShortenedUrl(response.data.url)
      toast.success('URL shortened successfully!')
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to shorten URL')
    }
  })

  const onSubmit = (data) => {
    const payload = {
      originalUrl: data.originalUrl,
      ...(data.customAlias && { customAlias: data.customAlias }),
      ...(data.expiresAt && { expiresAt: data.expiresAt })
    }
    shortenMutation.mutate(payload)
  }

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const createAnother = () => {
    setShortenedUrl(null)
    reset()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <LinkIcon className="mx-auto h-12 w-12 text-primary-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-800">Shorten Your URL</h1>
        <p className="mt-2 text-gray-600">
          Create short, memorable links that are easy to share
        </p>
      </div>

      {!shortenedUrl ? (
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original URL *
              </label>
              <input
                type="url"
                className={`input-field ${errors.originalUrl ? 'border-red-500' : ''}`}
                placeholder="https://example.com/very-long-url"
                {...register('originalUrl', {
                  required: 'URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
              />
              {errors.originalUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.originalUrl.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Alias (Optional)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      {import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}/
                    </span>
                    <input
                      type="text"
                      className={`input-field rounded-l-none ${errors.customAlias ? 'border-red-500' : ''}`}
                      placeholder="my-custom-link"
                      {...register('customAlias', {
                        minLength: {
                          value: 3,
                          message: 'Custom alias must be at least 3 characters'
                        },
                        maxLength: {
                          value: 20,
                          message: 'Custom alias cannot exceed 20 characters'
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9_-]+$/,
                          message: 'Custom alias can only contain letters, numbers, hyphens, and underscores'
                        }
                      })}
                    />
                  </div>
                  {errors.customAlias && (
                    <p className="text-red-500 text-sm mt-1">{errors.customAlias.message}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Leave empty for auto-generated short code
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      className={`input-field pl-10 ${errors.expiresAt ? 'border-red-500' : ''}`}
                      min={new Date().toISOString().slice(0, 16)}
                      {...register('expiresAt', {
                        validate: (value) => {
                          if (value && new Date(value) <= new Date()) {
                            return 'Expiration date must be in the future'
                          }
                          return true
                        }
                      })}
                    />
                  </div>
                  {errors.expiresAt && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiresAt.message}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Leave empty for permanent link
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={shortenMutation.isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shortenMutation.isLoading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                URL Shortened Successfully!
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shortenedUrl.shortUrl}
                      readOnly
                      className="input-field bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(shortenedUrl.shortUrl)}
                      className="btn-secondary"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original URL
                  </label>
                  <input
                    type="text"
                    value={shortenedUrl.originalUrl}
                    readOnly
                    className="input-field bg-gray-50 text-sm"
                  />
                </div>

                {shortenedUrl.expiresAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expires At
                    </label>
                    <input
                      type="text"
                      value={new Date(shortenedUrl.expiresAt).toLocaleString()}
                      readOnly
                      className="input-field bg-gray-50 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={createAnother}
                className="flex-1 btn-primary"
              >
                Create Another
              </button>
              
              <button
                onClick={() => window.open(shortenedUrl.shortUrl, '_blank')}
                className="flex-1 btn-secondary"
              >
                Test Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4">
          <LinkIcon className="mx-auto h-8 w-8 text-primary-600 mb-2" />
          <h3 className="font-medium text-gray-800">Custom Aliases</h3>
          <p className="text-sm text-gray-600">Create memorable short links</p>
        </div>
        
        <div className="text-center p-4">
          <CalendarIcon className="mx-auto h-8 w-8 text-primary-600 mb-2" />
          <h3 className="font-medium text-gray-800">Expiration Dates</h3>
          <p className="text-sm text-gray-600">Set automatic link expiry</p>
        </div>
        
        <div className="text-center p-4">
          <ClipboardDocumentIcon className="mx-auto h-8 w-8 text-primary-600 mb-2" />
          <h3 className="font-medium text-gray-800">Easy Sharing</h3>
          <p className="text-sm text-gray-600">One-click copy to clipboard</p>
        </div>
      </div>
    </div>
  )
}

export default UrlShortener