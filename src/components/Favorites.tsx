import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import Movie from './Movie';

type Props = {}

export default function Favorites({}: Props) {
    const { user, loading: authLoading } = useAuth();
    const { favorites, isLoading } = useFavorites();

    if (authLoading) return <div>Loading auth...</div>;
    if (!user) return <div>Please log in to view your favorites</div>;
    if (isLoading) return <div>Loading favorites...</div>;

  return (
    <>
      {favorites?.map((movie) => (
        <Movie movie={movie} />
      ))}
    </>
  );
}