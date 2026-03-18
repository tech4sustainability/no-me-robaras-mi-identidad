export default function SecurityToolsPanel({
  app,
  tools,
  assetFor,
  costs,
  points,
  onActivate,
  onClose,
}) {
  const fullyProtected = tools.passwordManager && tools.twoFactor;

  return (
    <div className="window">
      <div className="window-header">
        <strong>Herramientas - {app.name}</strong>
        <button type="button" className="window-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="window-body">
        <div className="tools-grid">
          <div className={`tool-card ${tools.passwordManager ? 'active' : ''}`}>
            <img src={assetFor('NT6I15')} alt="Gestor de contraseñas" />
            <h4>Gestor de contraseñas</h4>
            <p>Crea y recuerda contraseñas fuertes.</p>
            <button
              type="button"
              className="btn"
              disabled={tools.passwordManager || points < costs.passwordManager}
              onClick={() => onActivate('passwordManager')}
            >
              {tools.passwordManager ? 'Activado' : `Activar (${costs.passwordManager})`}
            </button>
          </div>
          <div className={`tool-card ${tools.twoFactor ? 'active' : ''}`}>
            <img src={assetFor('NT6I16')} alt="Autenticación 2FA" />
            <h4>Autenticación 2FA</h4>
            <p>Añade un código extra para verificar accesos.</p>
            <button
              type="button"
              className="btn"
              disabled={tools.twoFactor || points < costs.twoFactor}
              onClick={() => onActivate('twoFactor')}
            >
              {tools.twoFactor ? 'Activado' : `Activar (${costs.twoFactor})`}
            </button>
          </div>
        </div>
        {fullyProtected && (
          <div className="protected-banner">
            <img src={assetFor('NT6I17')} alt="Protegido" />
            <span>Esta cuenta ya está totalmente protegida.</span>
          </div>
        )}
      </div>
    </div>
  );
}
