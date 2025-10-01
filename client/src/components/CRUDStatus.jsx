import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Database, Wifi, WifiOff } from 'lucide-react';
import { gemstoneAPI } from '../services/api';

const CRUDStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    database: 'checking',
    crud: {
      create: 'pending',
      read: 'pending',
      update: 'pending',
      delete: 'pending'
    }
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Test backend connection
      const response = await gemstoneAPI.getGemstones({ limit: 1 });
      setStatus(prev => ({
        ...prev,
        backend: 'connected',
        database: response.success ? 'connected' : 'error'
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backend: 'error',
        database: 'error'
      }));
    }
  };

  const testCRUDOperations = async () => {
    setStatus(prev => ({ ...prev, crud: { create: 'testing', read: 'testing', update: 'testing', delete: 'testing' } }));

    try {
      // Test CREATE
      const testData = {
        name: 'CRUD Test Gemstone',
        description: 'This is a test gemstone for CRUD operations',
        category: 'Diamond',
        minimumBid: 100,
        weight: 1.0,
        color: 'clear',
        origin: { country: 'Test Country' }
      };

      const formData = new FormData();
      Object.keys(testData).forEach(key => {
        if (typeof testData[key] === 'object') {
          Object.keys(testData[key]).forEach(subKey => {
            formData.append(`${key}.${subKey}`, testData[key][subKey]);
          });
        } else {
          formData.append(key, testData[key]);
        }
      });

      const createResponse = await gemstoneAPI.createGemstone(formData);
      setStatus(prev => ({ ...prev, crud: { ...prev.crud, create: createResponse.success ? 'success' : 'error' } }));

      if (createResponse.success) {
        const gemstoneId = createResponse.data.gemstone.id;

        // Test READ
        const readResponse = await gemstoneAPI.getGemstone(gemstoneId);
        setStatus(prev => ({ ...prev, crud: { ...prev.crud, read: readResponse.success ? 'success' : 'error' } }));

        // Test UPDATE
        const updateData = new FormData();
        updateData.append('name', 'Updated CRUD Test Gemstone');
        const updateResponse = await gemstoneAPI.updateGemstone(gemstoneId, updateData);
        setStatus(prev => ({ ...prev, crud: { ...prev.crud, update: updateResponse.success ? 'success' : 'error' } }));

        // Test DELETE
        const deleteResponse = await gemstoneAPI.deleteGemstone(gemstoneId);
        setStatus(prev => ({ ...prev, crud: { ...prev.crud, delete: deleteResponse.success ? 'success' : 'error' } }));
      }
    } catch (error) {
      console.error('CRUD Test Error:', error);
      setStatus(prev => ({ 
        ...prev, 
        crud: { 
          create: 'error', 
          read: 'error', 
          update: 'error', 
          delete: 'error' 
        } 
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'success':
        return 'Working';
      case 'error':
        return 'Error';
      case 'testing':
        return 'Testing...';
      default:
        return 'Pending';
    }
  };

  const allCRUDWorking = Object.values(status.crud).every(s => s === 'success');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`mb-2 p-2 rounded-full shadow-lg transition-all ${
          allCRUDWorking ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        title="CRUD Status"
      >
        <Database className="h-5 w-5" />
      </button>

      {/* Status Panel */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">System Status</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Backend Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {status.backend === 'connected' ? (
                <Wifi className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span className="text-sm text-gray-600">Backend</span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(status.backend)}
              <span className="ml-1 text-sm text-gray-600">{getStatusText(status.backend)}</span>
            </div>
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">Database</span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(status.database)}
              <span className="ml-1 text-sm text-gray-600">{getStatusText(status.database)}</span>
            </div>
          </div>

          <hr className="mb-3" />

          {/* CRUD Operations */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">CRUD Operations</h4>
            {Object.entries(status.crud).map(([operation, opStatus]) => (
              <div key={operation} className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 capitalize">{operation}</span>
                <div className="flex items-center">
                  {getStatusIcon(opStatus)}
                  <span className="ml-1 text-sm text-gray-600">{getStatusText(opStatus)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Test Button */}
          <button
            onClick={testCRUDOperations}
            disabled={status.backend === 'error'}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Test CRUD Operations
          </button>

          {/* Overall Status */}
          <div className="mt-3 p-2 rounded text-center text-sm">
            {allCRUDWorking ? (
              <span className="text-green-600 font-semibold">✅ All Systems Working</span>
            ) : (
              <span className="text-yellow-600 font-semibold">⚠️ Some Issues Detected</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CRUDStatus;
