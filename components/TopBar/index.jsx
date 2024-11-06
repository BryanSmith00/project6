import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useLocation, Link } from "react-router-dom";

import "./styles.css";
import axios from "axios";

function TopBar() {
  const [user, updateUser] = useState("");
  const [version, updateVer] = useState("");
  const location = useLocation();
  const view = location.pathname.substring(
    1,
    location.pathname.indexOf("/", 1)
  );
  const userId = location.pathname.substring(
    location.pathname.indexOf("/", 1) + 1
  );

  useEffect(() => {
    axios
      .get("http://localhost:3000/user/list")
      .then((users) => {
        for (let i = 0; i < users.data.length; i++) {
          if (users.data[i]._id === userId) {
            updateUser(users.data[i]);
          }
        }
      })
      .catch(() => {
        updateUser("");
      });

    axios
      .get("http://localhost:3000/test/info")
      .then((data) => {
        updateVer(data.data.__v);
      })
      .catch(() => {
        updateVer("");
      });
  }, [location]);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="nav">
        <Typography variant="h5" color="inherit">
          <Link to="/">Bryan Smith</Link>
        </Typography>
        <Typography variant="h5" color="inherit">
          Version: {version}
        </Typography>
        <Typography variant="h5" color="inherit">
          {user
            ? view === "users"
              ? user.first_name + " " + user.last_name
              : user.first_name + " " + user.last_name + "'s photos"
            : "Home"}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
