export const getPageFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  return page ? parseInt(page, 10) : 1;
}