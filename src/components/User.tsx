import { Button } from "./ui/button";
import { User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const firebaseConfig = {
  apiKey: "AIzaSyBPLoSu1fclr-HA6xvLG6Ff8foJH8RryOE",
  authDomain: "react-sem-6.firebaseapp.com",
  projectId: "react-sem-6",
  storageBucket: "react-sem-6.firebasestorage.app",
  messagingSenderId: "428496535466",
  appId: "1:428496535466:web:41154065329385829ff5d3",
  measurementId: "G-JRWSM9Q9R4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// TypeScript interfaces
interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthError {
  code?: string;
  message?: string;
}

type Props = {};

export default function Onboarding({}: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [signIn, setSignIn] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>("");

  const queryClient = useQueryClient();

  // Query for current user
  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: () => {
      return new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          unsubscribe();
          resolve(currentUser);
        });
      });
    },
    staleTime: Infinity,
  });

  // Set up authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      queryClient.setQueryData(["user"], currentUser);

      if (currentUser) {
        setOpen(false);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Sign up mutation
  const signUpMutation = useMutation<any, AuthError, AuthCredentials>({
    mutationFn: async ({ email, password }: AuthCredentials) => {
      return await createUserWithEmailAndPassword(auth, email, password);
    },
    onSuccess: () => {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Sign in mutation
  const signInMutation = useMutation<any, AuthError, AuthCredentials>({
    mutationFn: async ({ email, password }: AuthCredentials) => {
      return await signInWithEmailAndPassword(auth, email, password);
    },
    onSuccess: () => {
      setEmail("");
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation<void, AuthError, void>({
    mutationFn: async () => {
      return await signOut(auth);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    if (!signIn) {
      // Handle sign up
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("Password should be at least 6 characters");
        return;
      }

      signUpMutation.mutate({ email, password });
    } else {
      // Handle sign in
      signInMutation.mutate({ email, password });
    }
  };

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  // Get error message
  const getErrorMessage = (error: AuthError | null): string | null => {
    if (!error) return null;

    if (typeof error === "string") return error;

    const errorCode = error.code;
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email is already in use";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/weak-password":
        return "Password is too weak";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password";
      default:
        return error.message || "An error occurred";
    }
  };

  // Get loading state
  const isLoading =
    signInMutation.isPending ||
    signUpMutation.isPending ||
    signOutMutation.isPending ||
    userLoading;

  // Get error
  useEffect(() => {
    if (signInMutation.error || signUpMutation.error) {
      setErrorMessage(
        getErrorMessage(signInMutation.error || signUpMutation.error)
      );
    }
  }, [signInMutation.error, signUpMutation.error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => (user ? handleSignOut() : setOpen(true))}
          disabled={isLoading}
        >
          <UserIcon className="h-[1.2rem] w-[1.2rem]" />
          {signOutMutation.isPending && (
            <span className="ml-2">Signing out...</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{signIn ? "Sign In" : "Sign Up"}</DialogTitle>
          <DialogDescription>
            {signIn ? "Welcome back" : "Please create an account to continue"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mt-5">
            <div className="flex items-center space-x-2">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            {!signIn && (
              <div className="flex items-center space-x-2 mt-5">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </div>
          <DialogFooter className="mt-5">
            <div className="flex justify-center items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSignIn(!signIn);
                  setErrorMessage("");
                }}
                className="dark:text-foreground"
                disabled={isLoading}
              >
                {signIn
                  ? "Need an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Button>
              <Button
                type="submit"
                className="dark:text-foreground"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading
                  ? signIn
                    ? "Signing in..."
                    : "Signing up..."
                  : signIn
                  ? "Sign In"
                  : "Sign Up"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
