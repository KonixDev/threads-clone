"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { deleteThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
}

function DeleteThread({
  threadId,
  currentUserId,
  authorId,
  parentId,
  isComment,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId || pathname === "/") return null;

  const handleDeleteThread = async (e: any) => {
    e.preventDefault();
    //Are you sure dialog
    const confirmation = confirm("Are you sure you want to delete this thread?");
    if (confirmation) {
      await deleteThread(JSON.parse(threadId), pathname);
          if (!parentId || !isComment) {
            router.push(pathname);
          }
      }
  };


  return (
    <Image
      src='/assets/delete.svg'
      alt='delte'
      width={18}
      height={18}
      className='cursor-pointer object-contain'
      onClick={async (e) => {
        handleDeleteThread(e);
      }}
    />
  );
}

export default DeleteThread;