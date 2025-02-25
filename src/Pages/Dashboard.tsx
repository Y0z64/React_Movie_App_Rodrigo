import Favorites from "@/components/Favorites";
import Navbar from "@/components/Navbar";
import { useMovies } from "@/context/MovieProvider";

type Props = {};

export default function Dashboard({}: Props) {
  const { query, setQuery } = useMovies();

  

  return (
    <main className="min-h-screen min-w-screen pb-6 bg-background flex justify-start flex-col outline-dotted box-content">
      <Navbar query={query} setQuery={setQuery} />
      <div className="container w-full mx-auto px-4">
        <h4>Favorites</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Favorites />
        </div>
      </div>
    </main>
  );
}
