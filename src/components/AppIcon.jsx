import { useEffect, useRef } from 'react';

const statusLabels = {
  safe: 'Seguro',
  under_attack: 'Bajo ataque',
  locked: 'Bloqueado',
  protected: 'Protegido',
};

export default function AppIcon({
  app,
  iconUrl,
  status,
  notificationCount,
  attackTimer,
  messageTimer,
  onOpen,
  onLayout,
  isActive,
  tools,
  assetFor,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !onLayout) return;
    const rect = ref.current.getBoundingClientRect();
    onLayout(app.id, rect);
  });

  const fullyProtected = tools?.passwordManager && tools?.twoFactor;

  return (
    <button
      ref={ref}
      className={`app-icon ${isActive ? 'active' : ''} ${status}`}
      type="button"
      onClick={() => onOpen(app.id)}
    >
      <div className="app-icon-image">
        <img src={iconUrl} alt={app.name} />
        {notificationCount > 0 && (
          <span className="app-badge">{notificationCount}</span>
        )}
        {status === 'under_attack' && attackTimer != null && (
          <span className="attack-timer">{attackTimer}s</span>
        )}
        {messageTimer != null && status !== 'under_attack' && (
          <span className="attack-timer">{messageTimer}s</span>
        )}
      </div>
      <div className="app-icon-label">{app.name}</div>
      <div className="app-status">{statusLabels[status] || 'Seguro'}</div>
      {tools && (
        <div className="mini-tools">
          <img
            className={tools.passwordManager ? 'active' : ''}
            src={assetFor('NT6I15')}
            alt="Gestor de contraseñas"
          />
          <img
            className={tools.twoFactor ? 'active' : ''}
            src={assetFor('NT6I16')}
            alt="Autenticación 2FA"
          />
          {fullyProtected && (
            <img className="active" src={assetFor('NT6I17')} alt="Protegido" />
          )}
        </div>
      )}
    </button>
  );
}
