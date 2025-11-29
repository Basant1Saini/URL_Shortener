import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { urlAPI } from '../services/api'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
  GlobeAltIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const Analytics = () => {
  const { id } = useParams()

  const { data: urlData, isLoading: urlLoading } = useQuery({
    queryKey: ['url', id],
    queryFn: () => urlAPI.getUrlById(id).then(res => res.data.url)
  })

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => urlAPI.getUrlAnalytics(id).then(res => res.data.analytics),
    enabled: !!id
  })

  const isLoading = urlLoading || analyticsLoading

  // Process click history for charts
  const processClickData = (clickHistory) => {
    if (!clickHistory || clickHistory.length === 0) return null

    // Group clicks by date
    const clicksByDate = clickHistory.reduce((acc, click) => {
      const date = new Date(click.timestamp).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Get last 7 days
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      last7Days.push(date.toLocaleDateString())
    }

    return {
      labels: last7Days,
      datasets: [{
        label: 'Clicks',
        data: last7Days.map(date => clicksByDate[date] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: true
      }]
    }
  }

  // Process referrer data
  const processReferrerData = (clickHistory) => {
    if (!clickHistory || clickHistory.length === 0) return null

    const referrerCounts = clickHistory.reduce((acc, click) => {
      const referrer = click.referrer === 'direct' ? 'Direct' : 
                     click.referrer ? new URL(click.referrer).hostname : 'Unknown'
      acc[referrer] = (acc[referrer] || 0) + 1
      return acc
    }, {})

    const sortedReferrers = Object.entries(referrerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      labels: sortedReferrers.map(([referrer]) => referrer),
      datasets: [{
        label: 'Clicks by Referrer',
        data: sortedReferrers.map(([, count]) => count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 1
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!urlData || !analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Analytics data not found.</p>
        <Link to="/dashboard" className="btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const clickData = processClickData(analyticsData.clickHistory)
  const referrerData = processReferrerData(analyticsData.clickHistory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/dashboard" 
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">URL Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed insights for your short URL</p>
        </div>
      </div>

      {/* URL Info */}
      <div className="card">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Short URL</label>
            <p className="text-lg font-mono text-primary-600">{urlData.shortUrl}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Original URL</label>
            <p className="text-sm text-gray-600 break-all">{urlData.originalUrl}</p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>Created: {new Date(urlData.createdAt).toLocaleDateString()}</span>
            {urlData.expiresAt && (
              <span>Expires: {new Date(urlData.expiresAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalClicks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(analyticsData.clickHistory?.map(click => click.ip)).size || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <GlobeAltIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Referrer Sources</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(analyticsData.clickHistory?.map(click => 
                  click.referrer === 'direct' ? 'Direct' : 
                  click.referrer ? new URL(click.referrer).hostname : 'Unknown'
                )).size || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Clicked</p>
              <p className="text-sm font-bold text-gray-900">
                {analyticsData.lastClicked 
                  ? new Date(analyticsData.lastClicked).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {analyticsData.totalClicks > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clicks Over Time */}
          {clickData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Clicks Over Time (Last 7 Days)
              </h3>
              <Line data={clickData} options={chartOptions} />
            </div>
          )}

          {/* Referrer Sources */}
          {referrerData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Top Referrer Sources
              </h3>
              <Bar data={referrerData} options={chartOptions} />
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-8">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clicks yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Share your short URL to start collecting analytics data.
          </p>
        </div>
      )}

      {/* Recent Clicks */}
      {analyticsData.clickHistory && analyticsData.clickHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Clicks</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Agent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.clickHistory
                  .slice(-10)
                  .reverse()
                  .map((click, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(click.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {click.referrer === 'direct' ? 'Direct' : 
                         click.referrer ? new URL(click.referrer).hostname : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {click.userAgent || 'Unknown'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics