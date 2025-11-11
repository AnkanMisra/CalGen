import { useState, useEffect } from 'react';

const StatusLog = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getTypeIcon = (type) => {
    const icons = {
      success: (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    };

    return icons[type] || icons.info;
  };

  const getTypeStyles = (type) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return styles[type] || styles.info;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Expose addLog method to parent components
  useEffect(() => {
    window.addStatusLog = addLog;
    return () => {
      delete window.addStatusLog;
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Status Log</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isVisible && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No status messages yet
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getTypeStyles(log.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.message}</p>
                  <p className="text-xs opacity-75 mt-1">{formatTime(log.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StatusLog;
