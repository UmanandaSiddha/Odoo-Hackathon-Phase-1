import { DashboardLayout } from '../layouts/DashboardLayout';

export const HomePage = () => {
  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Skill Swap</h1>
        <p className="mt-4 text-gray-600">
          Connect with others to exchange skills and knowledge.
        </p>
      </div>
    </DashboardLayout>
  );
}; 