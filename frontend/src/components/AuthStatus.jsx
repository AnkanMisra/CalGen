import { useState, useEffect } from "react";

const AuthStatus = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      setAuthStatus({ authenticated: false, reason: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Clear local state and refresh auth status
        setAuthStatus({
          authenticated: false,
          reason: "Logged out successfully",
        });
      } else {
        console.error("Logout failed:", data);
        alert("Logout failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout error: " + error.message);
    } finally {
      setLogoutLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">
            Checking authentication status...
          </span>
        </div>
      </div>
    );
  }

  if (!authStatus?.authenticated) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
              Not Authenticated
            </h3>
            <p className="text-red-700 mt-1">
              {authStatus?.reason || "Please authorize with Google Calendar"}
            </p>
            <div className="mt-4">
              <a
                href="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Authorize with Google
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {authStatus?.user?.photo ? (
            <img
              src={authStatus.user.photo}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="flex-shrink-0 mr-3">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-green-800">
              Authenticated ✅
            </h3>
            {authStatus?.user && (
              <>
                <p className="text-green-700 font-medium">
                  {authStatus.user.name}
                </p>
                <p className="text-green-600 text-sm">
                  {authStatus.user.email}
                </p>
              </>
            )}
            <p className="text-green-700 text-sm mt-1">
              Ready to create and manage fake events
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={checkAuthStatus}
            className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 inline-block mr-1"></div>
                Logging out...
              </>
            ) : (
              "Logout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthStatus;
