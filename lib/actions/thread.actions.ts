"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { FilterQuery } from "mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: communityId ? communityId : null,
    });

    //Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (err: any) {
    console.log(err);
    return null;
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    //Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    const postsQuery = await Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      })
      .exec();

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    }).countDocuments();

    const isNext = totalPostsCount > pageNumber * pageSize;

    return { posts: postsQuery, isNext };
  } catch (err: any) {
    console.log(err);
    return null;
  }
}

export async function fetchThread(threadId: string) {
  try {
    connectToDB();

    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    //adding a comment
    console.log("adding a comment");

    //Find the original thread by id
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("No thread found");
    }

    //Create a new thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    //Save the new thread
    const savedCommentThread = await commentThread.save();

    //Update the original thread
    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();

    revalidatePath(path);
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    //TODO: Populate Community
    const threads = await User.findOne({ id: userId })
      .populate({
        path: "threads",
        model: Thread,
        populate: {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",
          },
        },
      })
      .exec();

    return threads;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }
    const sortOptions: any = { createdAt: sortBy };

    const usersQuery: any = await User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize).exec();

    const totalUsersCount = await User.find(query).countDocuments();

    const isNext = totalUsersCount > skipAmount + usersQuery.length;

    return { usersQuery, isNext };

  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
}
