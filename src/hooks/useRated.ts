import { useQuery } from "@tanstack/react-query";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useAuth } from "./useAuth";
import { Movie } from "../context/MovieProvider";

// Extend the Movie interface with the rating property
interface RatedMovie extends Movie {
  rating: number; // Fixed the typo 'ratinig' to 'rating'
}

export function useRatedMovies() {
  const { user } = useAuth();
  const db = getFirestore();

  const {
    data: ratedMovies,
    isLoading,
    error,
    refetch,
  } = useQuery<RatedMovie[]>({
    queryKey: ["ratings", user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const querySnapshot = await getDocs(
        collection(db, "ratings", user.uid, "movies")
      );

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Create a movie object with all required properties
        return {
          id: parseInt(doc.id), // Convert string ID back to number
          title: data.title || "",
          poster_path: data.poster_path || null,
          overview: data.overview || "",
          release_date: data.release_date || "",
          vote_average: data.vote_average || 0,
          backdrop_path: data.backdrop_path || null,
          genre_ids: data.genre_ids || [],
          rating: data.rating || 0,
          // Add any other required properties from the Movie interface
        } as RatedMovie;
      });
    },
    enabled: !!user,
  });

  return {
    ratedMovies: ratedMovies || [],
    isLoading,
    error,
    refetch,
  };
}