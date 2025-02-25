import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';

export interface Movie {
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

interface MovieContextType {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  movies: Movie[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

interface MovieProviderProps {
  children: ReactNode;
}

export function MovieProvider({ children }: MovieProviderProps) {
  const [location, _] = useLocation();
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
    enabled: location == "/",
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
                Authorization: `Bearer ${
                  import.meta.env.VITE_TMDB_ACCESS_TOKEN
                }`,
                "Content-Type": "application/json;charset=utf-8",
              },
            }
          );
          resolve(response.data.results);
        }, 300);
      });

      return handler;
    },
    enabled: !!query && location == "/",
    staleTime: 300000, 
  });

  useEffect(() => {
    if (query) {
      search.refetch();
    }
  }, [query]);

  const movies = query ? search.data : popular.data;
  const isLoading = query ? search.isLoading : popular.isLoading;
  const error = query ? search.error : popular.error;

  return (
    <MovieContext.Provider value={{ query, setQuery, movies, isLoading, error }}>
      {children}
    </MovieContext.Provider>
  );
}

export const useMovies = (): MovieContextType => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};