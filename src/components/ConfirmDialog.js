import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info' // 'info', 'warning', 'danger', 'success'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🗑️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'warning':
        return 'dialog-warning';
      case 'danger':
        return 'dialog-danger';
      case 'success':
        return 'dialog-success';
      default:
        return 'dialog-info';
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className={`confirm-dialog ${getTypeClass()}`} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-icon">{getIcon()}</div>

        <div className="dialog-content">
          <h3 className="dialog-title">{title}</h3>
          <p className="dialog-message">{message}</p>
        </div>

        <div className="dialog-actions">
          <button
            className="dialog-btn dialog-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`dialog-btn dialog-btn-confirm ${getTypeClass()}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
