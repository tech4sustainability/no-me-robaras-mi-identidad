import Timer from './Timer';

export default function MessageWindow({
  app,
  message,
  timer,
  onClose,
  onTrust,
  onDelete,
  localFeedback,
  localFeedbackType,
}) {
  if (!message) return null;
  return (
    <div className="window">
      <div className="window-header">
        <span className="message-app">{app.name}</span>
        <button type="button" className="window-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="window-body">
        <p className="window-intro">
          Revisa el mensaje y decide si es seguro o sospechoso.
        </p>
        <div className="message-card">
          <p className="window-text">{message.text}</p>
        </div>
        <div className="window-actions">
          <button type="button" onClick={onTrust} className="btn">
            Es seguro
          </button>
          <button type="button" onClick={onDelete} className="btn danger">
            Eliminar
          </button>
        </div>
        {localFeedback && (
          <div className={`inline-feedback ${localFeedbackType}`}>{localFeedback}</div>
        )}
      </div>
    </div>
  );
}
