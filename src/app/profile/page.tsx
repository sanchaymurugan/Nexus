
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { AuthGuard } from '../auth-guard';
import Link from 'next/link';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  email: z.string().email(),
});

type ProfileFormValue = z.infer<typeof profileSchema>;

function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const form = useForm<ProfileFormValue>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: (userProfile as any).name || '',
        phoneNumber: (userProfile as any).phoneNumber || '',
        email: user?.email || '',
      });
    } else if (user) {
        form.reset({
            name: user.displayName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || ''
        })
    }
  }, [userProfile, user, form]);

  const handleUpdateProfile = async (data: ProfileFormValue) => {
    if (!user || !userDocRef) return;
    setLoading(true);

    try {
      // Update Firestore document
      await updateDoc(userDocRef, {
        name: data.name,
        phoneNumber: data.phoneNumber,
      });

      // Update Firebase Auth profile
      if (user.displayName !== data.name) {
        await updateProfile(user, { displayName: data.name });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your account details.</p>
        </div>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdateProfile)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
                <Link href="/" passHref>
                    <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}


export default function Profile() {
    return (
        <AuthGuard>
            <ProfilePage />
        </AuthGuard>
    )
}
