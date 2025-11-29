import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { urlAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  LinkIcon, 
  ChartBarIcon, 
  TrashIcon, 
  ClipboardDocumentIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['urls', currentPage, searchTerm],
    queryFn: () => urlAPI.getUserUrls({ 
      page: currentPage, 
      limit: 10, 
      search: searchTerm 
    }).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: urlAPI.deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries(['urls'])
      toast.success('URL deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete URL')
    }
  })

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      deleteMutation.mutate(id)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading URLs. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/shorten" className="btn-primary">
          Create Short URL
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <LinkIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total URLs</p>
              <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.urls?.reduce((sum, url) => sum + url.clicks, 0) || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <LinkIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active URLs</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.urls?.filter(url => url.isActive).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search URLs..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* URLs List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your URLs</h2>
        
        {data?.urls?.length === 0 ? (
          <div className="text-center py-8">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No URLs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first short URL.
            </p>
            <div className="mt-6">
              <Link to="/shorten" className="btn-primary">
                Create Short URL
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.urls?.map((url) => (
              <div key={url._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {url.shortUrl}
                      </h3>
                      <button
                        onClick={() => copyToClipboard(url.shortUrl)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {url.originalUrl}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{url.clicks} clicks</span>
                      <span>Created {formatDate(url.createdAt)}</span>
                      {url.expiresAt && (
                        <span className="text-orange-600">
                          Expires {formatDate(url.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/analytics/${url._id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(url._id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteMutation.isLoading}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {data.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
              disabled={currentPage === data.totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard