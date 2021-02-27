import React, { useEffect, useState } from "react";
import "./Feed.css";
import MessageSender from "./MessageSender";
import Post from "./Post";
import StoryReel from "./StoryReel";
import axios from "../axios";
import Pusher from "pusher-js";

import db from "../firebase";

const pusher = new Pusher("3c8b4c12d9bbf6b49efd", {
  cluster: "ap2",
});

const Feed = () => {
  const [profilePic, setProfilePic] = useState("");
  const [postsData, setPostsData] = useState([]);

  useEffect(() => {
    axios.get("/retrieve/posts").then((res) => {
      setPostsData(res.data.posts);
    });
  }, []);
  useEffect(() => {
    const channel = pusher.subscribe("posts");
    channel.bind("inserted", function (data) {
      axios.get("/retrieve/posts").then((res) => {
        setPostsData(res.data.posts);
      });
    });
  }, []);
  return (
    <div className="feed">
      <StoryReel />
      <MessageSender />
      {postsData.map((entry) => (
        <Post
          profilePic={entry.avatar}
          message={entry.text}
          timestamp={entry.timestamp}
          imgName={entry.imgName}
          username={entry.user}
        />
      ))}
    </div>
  );
};

export default Feed;
