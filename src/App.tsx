import Movie from "./components/Movie";
import Navbar from "./components/Navbar";
import { useMovies } from "./context/MovieProvider";

function App() {
  const { query, setQuery, movies, isLoading } = useMovies();

  return (
    <main className="min-h-screen min-w-screen pb-6 bg-background flex justify-start flex-col outline-dotted box-content">
      <Navbar query={query} setQuery={setQuery} />
      <div className="container w-full mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading && <p>Loading...</p>}
          {movies?.map((movie) => (
            <Movie movie={movie} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
