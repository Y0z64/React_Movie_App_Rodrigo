import { Star } from "lucide-react";
import { Movie as MovieType } from "../context/MovieProvider";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { toast } from "sonner";

type Props = {
  movie: MovieType;
};

export default function Movie({ movie }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const db = getFirestore();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Check if movie is favorited
  const { data: favoriteStatus, isLoading, error} = useQuery({
    queryKey: ["favorite", user?.uid, movie.id],
    queryFn: async () => {
      if (!user) return false;

      const docRef = doc(
        db,
        "favorites",
        user.uid,
        "movies",
        movie.id.toString()
      );
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    },
    enabled: !!user, // Only run query if user is logged in
  });

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error("Could not fetch favorite status", {
        description: error.message,
      });
    }
  }, [error]);

  // Update local state when query data changes
  useEffect(() => {
    if (favoriteStatus !== undefined) {
      setIsFavorite(favoriteStatus);
    }
  }, [favoriteStatus]);
  

  // Add to favorites mutation
  const addToFavorites = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const movieRef = doc(
        db,
        "favorites",
        user.uid,
        "movies",
        movie.id.toString()
      );
      await setDoc(movieRef, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        added_at: new Date(),
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorite", user?.uid, movie.id],
      });
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.uid] });
    },
    onError: (e) => {
      toast.error("Could not add to favorites", {
        description: e.message,
        
      })
    }
  });

  // Remove from favorites mutation
  const removeFromFavorites = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const movieRef = doc(
        db,
        "favorites",
        user.uid,
        "movies",
        movie.id.toString()
      );
      await deleteDoc(movieRef);

      return false;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorite", user?.uid, movie.id],
      });
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.uid] });
    },
  });

  // Toggle favorite status
  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites.mutate();
    } else {
      addToFavorites.mutate();
    }
  };

  return (
    <a
      href={`https://www.themoviedb.org/movie/${movie.id}`}
      key={movie.id}
      className="bg-card relative outline-dotted hover:outline-none rounded-lg shadow-lg overflow-hidden transform transition duration-200 hover:scale-105"
    >
      {user && (
        <Button
          variant="outline"
          className={`dark:text-white absolute top-2 right-2 z-10 hover:outline ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          size={"icon"}
          onClick={toggleFavorite}
          disabled={
            isLoading ||
            addToFavorites.isPending ||
            removeFromFavorites.isPending
          }
        >
          <Star
            className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
          />
        </Button>
      )}
      <div className="relative pb-[150%]">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {movie.title}
        </h2>
        {movie.overview && (
          <p className="text-accent-foreground text-sm line-clamp-3">
            {movie.overview}
          </p>
        )}
      </div>
    </a>
  );
}
