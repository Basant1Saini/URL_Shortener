import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LinkIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <LinkIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">URL Shortener</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  to="/shorten" 
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <LinkIcon className="h-5 w-5" />
                  <span>Shorten</span>
                </Link>

                <div className="flex items-center space-x-2 text-gray-600">
                  <UserCircleIcon className="h-5 w-5" />
                  <span>{user.username}</span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar