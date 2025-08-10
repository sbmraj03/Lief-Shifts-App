import MainLayout from '../../components/MainLayout';
import AuthGuard from '../../components/AuthGuard';
import ShiftsPage from '../../components/shifts/ShiftsPage';

export default function ShiftsRoute() {
  return (
    <MainLayout>
      <AuthGuard>
        <ShiftsPage />
      </AuthGuard>
    </MainLayout>
  );
}