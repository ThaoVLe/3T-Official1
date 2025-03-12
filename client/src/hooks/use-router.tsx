
import { useLocation, useNavigate } from "wouter";

export function useRouter() {
  const [location] = useLocation();
  const navigate = useNavigate();

  return {
    pathname: location,
    navigate,
    goBack: () => window.history.back(),
  };
}
