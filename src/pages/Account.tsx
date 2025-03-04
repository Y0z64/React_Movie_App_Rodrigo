import { useEffect } from "react";
import { SaveIcon, User, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";


// Define your schema
const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type UserProfile = z.infer<typeof formSchema>;

export default function Account() {
  const { user, loading: isLoadingUser } = useAuth();
  const db = getFirestore();
  const queryClient = useQueryClient();

  // Get current user ID
  const userId = user?.uid;

  // Fetch user profile from Firestore
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        // If user profile doesn't exist, create one with email from auth
        const newProfile: UserProfile = {
          email: user?.email || "",
          name: user?.displayName || "",
          phone: "",
          address: "",
        };
        
        await setDoc(docRef, newProfile);
        return newProfile;
      }
    },
    enabled: !!userId,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (values: UserProfile) => {
      if (!userId) throw new Error("Not authenticated");
      await updateDoc(doc(db, "users", userId), values);
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      toast("Success", {
        description: "Profile updated successfully!",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: `Failed to update profile: ${error.message}`,
      });
    },
  });

  const form = useForm<UserProfile>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      phone: "",
      address: "",
    },
  });

  // Update form values when user profile loads
  useEffect(() => {
    if (userProfile) {
      form.reset(userProfile);
    }
  }, [form, userProfile]);

  const isModified = Object.keys(form.formState.dirtyFields).length > 0;

  const handleSubmit = async (values: UserProfile) => {
    updateUserMutation.mutate(values);
  };

  if (isLoadingUser || isLoadingProfile) {
    return <div className="flex justify-center p-8">Loading user data...</div>;
  }
  
  return (
    <div className="max-w-[600px] mx-auto p-5">
      <h1 className="text-xl font-bold mb-6">Account Information</h1>
      <Card className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input placeholder="Full Name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input type="email" placeholder="Email" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input placeholder="Phone Number" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Address" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!isModified || updateUserMutation.isPending}
              className="flex items-center text-white stroke-white"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
