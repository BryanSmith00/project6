import React, { useEffect, useState } from "react";
import { Typography, Paper } from "@mui/material";

import "./styles.css";
import axios from 'axios';

function UserDetail({ userId }) {
  const [user, updateUser] = useState({});

  useEffect(() => {
    axios.get("http://localhost:3000/user/" + userId)
      .then((result) => {
        console.log(result.data);
        updateUser(result.data);
      })
      .catch(() => {
        updateUser({});
      });
  }, [userId]);

  return (
    <div className="detailcontainer">
      <div className="userdetail">
        <Typography variant="h4">
          {user.first_name} {user.last_name}
        </Typography>
        <Typography variant="h4">Location: {user.location}</Typography>
        <Typography variant="h4">Occupation: {user.occupation}</Typography>
        <Typography variant="h4">Description: {user.description}</Typography>
        <Typography variant="h4">id: {user._id}</Typography>
      </div>
      <Paper elevation={7} className="photolinkcontainer">
        <a className="photolink" href={"#photos/" + userId}>
          View Photos
        </a>
      </Paper>
    </div>
  );
}

export default UserDetail;
