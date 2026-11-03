import { Link } from 'react-router-dom';
import { buttonClass, Card, EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <Card className="mt-10">
      <EmptyState title="Page not found">
        That page doesn’t exist.
        <div className="mt-4">
          <Link to="/" className={buttonClass('primary')}>
            Back to dashboard
          </Link>
        </div>
      </EmptyState>
    </Card>
  );
}
