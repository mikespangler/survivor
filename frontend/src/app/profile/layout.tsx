import { AuthenticatedLayout } from '@/components/navigation/AuthenticatedLayout';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
