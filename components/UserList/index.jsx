import React, { useEffect, useState } from "react";
import { Divider, List, ListItem, ListItemText } from "@mui/material";

import "./styles.css";
import axios from 'axios';

function UserList(userId) {
const [users, updateUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/user/list")
      .then((data) => {
        updateUsers(data.data);
      })
      .catch(() => {
        updateUsers({});
      });
  }, [userId]);

  return (
    <div>
      <List component="nav">
        {users.map((item) => (
          <React.Fragment key={item._id + "frag"}>
            <ListItem>
              <ListItemText>
                <a href={"#users/" + item._id}>
                  {item.first_name} {item.last_name}
                </a>
              </ListItemText>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
