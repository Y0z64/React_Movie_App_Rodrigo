import { useAuth } from "@/hooks/useAuth";
import { useRatedMovies } from "@/hooks/useRated";
import Movie from "./Movie";

type Props = {};

export default function RatedMovies({}: Props) {
  const { user, loading: authLoading } = useAuth();
  const { ratedMovies, isLoading: ratingsLoading } = useRatedMovies();


  const isLoading = authLoading || ratingsLoading;

  if (authLoading) return <div>Loading auth...</div>;
  if (!user) return <div>Please log in to view your rated movies</div>;
  if (isLoading) return <div>Loading rated movies...</div>;

  if (!ratedMovies || ratedMovies.length === 0) {
    return (
      <>
        <h2 className="mb-2 text-xl">Rated Movies</h2>
        <p>You haven't rated any movies yet.</p>
      </>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-xl">Rated Movies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ratedMovies.map((movie) => (
          <Movie key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  );
}
