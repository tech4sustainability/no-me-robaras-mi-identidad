import AppIcon from './AppIcon';

export default function Desktop({
  apps,
  appStates,
  assetFor,
  onOpenApp,
  onLayout,
  activeAppId,
  backgroundUrl,
  onOpenTips,
}) {
  return (
    <div className="desktop no-background">
      <button type="button" className="tips-icon" onClick={onOpenTips}>
        <img src={assetFor('NT6I11')} alt="Consejos de seguridad" />
        <span>Consejos</span>
      </button>
      <div className="desktop-grid">
        {apps.map((app) => {
          const state = appStates[app.id];
          return (
            <AppIcon
              key={app.id}
              app={app}
              iconUrl={assetFor(app.icon)}
              status={state.status}
              notificationCount={state.notificationCount}
              attackTimer={state.attackTimer}
              messageTimer={state.messageTimer}
              onOpen={onOpenApp}
              onLayout={onLayout}
              isActive={activeAppId === app.id}
              tools={state.tools}
              assetFor={assetFor}
            />
          );
        })}
      </div>
    </div>
  );
}
