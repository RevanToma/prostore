'use client';

import { useToast } from '@/hooks/use-toast';
import { FC, useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';

type DeleteDialogProps = {
  id: string;
  action: (id: string) => Promise<{ success: boolean; message: string }>;
};

const DeleteDialog: FC<DeleteDialogProps> = ({ id, action }) => {
  const [open, setOpen] = useState(false),
    [isPending, startTransition] = useTransition(),
    { toast } = useToast();

  const handleDeleteClick = async () => {
    startTransition(async () => {
      const { success, message } = await action(id);

      if (!success) {
        toast({
          variant: 'destructive',
          description: message,
        });
      } else {
        setOpen(false);
        toast({
          description: message,
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={'sm'} variant='destructive' className='ml-2'>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can not be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant='destructive'
            size='sm'
            disabled={isPending}
            onClick={handleDeleteClick}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
