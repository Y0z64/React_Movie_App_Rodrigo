import Movie from "./components/Movie";
import { useMovies } from "./context/MovieProvider";

function App() {
  const { movies, isLoading } = useMovies();

  return (
    <div className="container w-full mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading && <p>Loading...</p>}
        {movies?.map((movie) => (
          <Movie movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default App;
