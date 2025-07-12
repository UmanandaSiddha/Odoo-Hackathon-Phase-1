import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RefreshCcw } from 'lucide-react';

export const ErrorPage = () => {
  const error = useRouteError();
  
  let title = 'Oops! Something went wrong';
  let message = 'An unexpected error occurred. Please try again later.';
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page not found';
      message = 'Sorry, the page you are looking for does not exist.';
    } else if (error.status === 401) {
      title = 'Unauthorized';
      message = 'You need to be logged in to access this page.';
    } else if (error.status === 403) {
      title = 'Forbidden';
      message = 'You do not have permission to access this page.';
    }
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button
            variant="default"
            asChild
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}; 