import { useState } from 'react';

export default function PasswordChangeModal({
  app,
  requiresOld,
  onCancel,
  onSubmit,
  onAutoChange,
  showAuto,
  error,
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="window-header">
          <strong>Cambiar contraseña - {app.name}</strong>
          <button type="button" className="window-close" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="window-body">
          {requiresOld && (
            <label className="form-field">
              Contraseña actual
              <input
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </label>
          )}
          <label className="form-field">
            Nueva contraseña
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="window-actions">
            <button
              type="button"
              className="btn"
              onClick={() => onSubmit({ oldPassword, newPassword })}
            >
              Guardar
            </button>
            {showAuto && (
              <button type="button" className="btn ghost" onClick={onAutoChange}>
                Usar gestor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
