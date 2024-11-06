import React, { useEffect, useState } from "react";
import { Paper } from "@mui/material";

import "./styles.css";
import axios from 'axios';

function UserPhotos({ userId }) {
  const [photos, updatePhotos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/photosOfUser/" + userId)
      .then((data) => {
        updatePhotos(JSON.parse(JSON.stringify(data.data)));
      })
      .catch(() => {
        updatePhotos("");
      });
  }, [userId]);

  return (
    <div className="gridcontainer">
      {photos.length >= 1
        ? photos.map((item) => (
            <Paper elevation={4} className="photocontainer" key={item._id}>
              <img className="photo" src={"../images/" + item.file_name} />
              <div className="metadata">
                <p>
                  {new Date(Date.parse(item.date_time)).toLocaleString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: false,
                    }
                  )}
                </p>
              </div>
              <Paper elevation={6} className="comments">
                {item.comments ? (
                  item.comments.map((comment) => (
                    <React.Fragment key={comment._id}>
                      <div className="commentheader">
                        <a href={"#users/" + comment.user._id}>
                          {comment.user.first_name} {comment.user.last_name}
                        </a>
                        &nbsp;&nbsp;
                        {new Date(Date.parse(comment.date_time)).toLocaleString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: false,
                          }
                        )}
                      </div>
                      <div className="commentbody">
                        <p>{comment.comment}</p>
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <p className="nocomment">No comments yet</p>
                )}
              </Paper>
            </Paper>
          ))
        : null}
    </div>
  );
}

export default UserPhotos;
