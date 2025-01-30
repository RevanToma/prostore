'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateProfileSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { updateUserProfile } from '@/lib/actions/user.actions';

const ProfileForm = () => {
  const { data: session, update } = useSession(),
    form = useForm<z.infer<typeof updateProfileSchema>>({
      resolver: zodResolver(updateProfileSchema),
      defaultValues: {
        name: session?.user?.name ?? '',
        email: session?.user?.email ?? '',
      },
    }),
    { toast } = useToast();

  const onSubmit = async (data: z.infer<typeof updateProfileSchema>) => {
    const { message, success } = await updateUserProfile(data);

    if (!success) {
      toast({
        variant: 'destructive',
        description: message,
      });
      return;
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: data.name,
      },
    };

    await update(newSession);

    toast({
      description: message,
    });
  };
  return (
    <Form {...form}>
      <form
        className='flex flex-col gap-5'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='flex flex-col gap-5'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled
                    placeholder='Email'
                    className='input-field'
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder='name'
                    className='input-field'
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button
          type='submit'
          size={'lg'}
          className='button col-span-2 w-full'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
