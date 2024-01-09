'use client';

import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
}

const UserCard = ({ id, name, username, imgUrl, personType }: Props) => {
  const router = useRouter();

  const handleView = (event: any) => {
    event.preventDefault();
    console.log("handleView");
    if (personType === "User") {
      router.push(`/profile/${id}`);
    } else if (personType === "Organization") {
      router.push(`/organization/${id}`);
    }
  };

  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <Image
          src={imgUrl}
          alt="User Avatar"
          width={48}
          height={48}
          className="rounded-full"
        />

        <div className="flex-1 text-ellipsis">
          <h4 className="text-base-semibold text-light-1">{name}</h4>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>
      <Button className="user-card_btn" onClick={(event) => handleView(event)}>
        View
      </Button>
    </article>
  );
};

export default UserCard;
