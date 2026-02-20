import { useLocation, useNavigate } from 'react-router';

export function useBackToList(listPath: string) {
  const location = useLocation();
  const navigate = useNavigate();

  const fromPage = (location.state as { fromPage?: number } | null)?.fromPage ?? 1;
  const backUrl = fromPage > 1 ? `${listPath}?page=${fromPage}` : listPath;

  const goBack = () => navigate(backUrl);

  const navigateWithPage = (path: string) => {
    navigate(path, { state: { fromPage } });
  };

  return { backUrl, goBack, fromPage, navigateWithPage };
}
