const assetModules = import.meta.glob('/src/assets/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const normalizedMap = Object.entries(assetModules).reduce((acc, [path, url]) => {
  const file = path.split('/').pop() || '';
  const base = file.split('.').slice(0, -1).join('.');
  acc[base.toLowerCase()] = url;
  return acc;
}, {});

export const getAsset = (name, fallback) => {
  if (!name) return fallback;
  const key = name.toLowerCase();
  return normalizedMap[key] || fallback;
};

export const placeholderAsset = normalizedMap.placeholder || '';
