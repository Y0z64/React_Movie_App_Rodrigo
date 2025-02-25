import { useQuery } from "@tanstack/react-query";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useAuth } from "./useAuth";
import { Movie } from "../context/MovieProvider";

export function useFavorites() {
  const { user } = useAuth();
  const db = getFirestore();

  const {
    data: favorites,
    isLoading,
    error,
    refetch,
  } = useQuery<Movie[]>({
    queryKey: ["favorites", user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const querySnapshot = await getDocs(
        collection(db, "favorites", user.uid, "movies")
      );

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id,
          title: data.title,
          poster_path: data.poster_path,
          overview: data.overview,
          // Add any other fields you need
        } as Movie;
      });
    },
    enabled: !!user,
  });

  return {
    favorites: favorites || [],
    isLoading,
    error,
    refetch,
  };
}
