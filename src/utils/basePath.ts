const currentPath = window.location.pathname;
let basePath = currentPath;

const pathSegments = currentPath.split('/').filter(Boolean);
if (pathSegments.pop() === 'hub') {
  basePath = '/' + pathSegments.join('/');
}
if (!basePath.endsWith('/')) {
  basePath += '/';
}
// export the basePath
export default basePath;
