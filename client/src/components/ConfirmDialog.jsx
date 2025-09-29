import React from 'react';

const ConfirmDialog = ({ open, title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;


