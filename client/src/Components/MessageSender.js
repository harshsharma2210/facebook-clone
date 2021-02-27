import React, { useState } from "react";
import "./MessageSender.css";
import { Avatar, Input } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import { useStateValue } from "../StateProvider";
import firebase from "firebase";
import db from "../firebase";

import axios from "../axios";
import FormData from "form-data";

const MessageSender = () => {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [image, setImage] = useState(null);
  const [{ user }, dispatch] = useStateValue();

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (image) {
      console.log(Date.now());
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "facebook-clone");
      data.append("cloud_name", "dggwrslgs");
      axios
        .post("https://api.cloudinary.com/v1_1/dggwrslgs/image/upload", data)
        .then((data) => {
          axios.post(`/upload/post`, {
            user: user.displayName,
            imgName: data.data.url,
            text: input,
            avatar: user.photoURL,
            timestamp: Date.now(),
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios.post(`/upload/post`, {
        text: input,
        user: user.displayName,
        avatar: user.photoURL,
        timestamp: Date.now(),
      });
    }

    setImageUrl("");
    setInput("");
    setImage(null);
  };

  return (
    <div className="messageSender">
      <div className="messageSender__top">
        <Avatar src={user.photoURL} />
        <form>
          <input
            type="text"
            className="messageSender__input"
            placeholder="What's on your mind?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Input
            type="file"
            className="messageSender__fileSelector"
            onChange={handleChange}
          />
          <button onClick={handleSubmit} type="submit">
            Hidden Submit
          </button>
        </form>
      </div>
      <div className="messageSender__bottom">
        <div className="messageSender__option">
          <VideocamIcon style={{ color: "red" }} />
          <h3>Live Video</h3>
        </div>
        <div className="messageSender__option">
          <PhotoLibraryIcon style={{ color: "green" }} />
          <h3>Photo/Video</h3>
        </div>
        <div className="messageSender__option">
          <InsertEmoticonIcon style={{ color: "orange" }} />
          <h3>Feeling/Activity</h3>
        </div>
      </div>
    </div>
  );
};

export default MessageSender;
