import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  backdrop_path: string | null;
  genre_ids: number[];
}

interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

function App() {
  const [query, setQuery] = useState<string>("");

  const popular = useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const response = await axios.get<MovieResponse>(
        `https://api.themoviedb.org/3/movie/popular`,
        {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            language: "en-US",
            page: 1,
          },
        }
      );
      return response.data.results;
    },
  });

  const search = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const handler = new Promise<Movie[]>((resolve) => {
        setTimeout(async () => {
          const response = await axios.get<MovieResponse>(
            "https://api.themoviedb.org/3/search/movie",
            {
              params: {
                query: query,
              },
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
                "Content-Type": "application/json;charset=utf-8",
              },
            }
          );
          resolve(response.data.results);
        }, 300);
      });

      return handler;
    },
    enabled: !!query,
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    if (query) {
      search.refetch();
    }
  }, [query]);

  const movies = query ? search.data : popular.data;

  return (
    <main className="min-h-screen min-w-screen pb-6 bg-background flex justify-start flex-col outline-dotted box-content">
      <Navbar query={query} setQuery={setQuery} />
      <div className="container w-full mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popular.isLoading && search.isLoading && <p>Loading...</p>}
          {movies?.map((movie) => (
            <div
              key={movie.id}
              className="bg-card outline-dotted hover:outline-none rounded-lg shadow-lg overflow-hidden transform transition duration-200 hover:scale-105"
            >
              <div className="relative pb-[150%]">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-foreground  mb-2 line-clamp-2">
                  {movie.title}
                </h2>
                {movie.overview && (
                  <p className="text-accent-foreground text-sm line-clamp-3">
                    {movie.overview}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
