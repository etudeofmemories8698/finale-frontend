import React, { Component } from "react";
import "./App.css";
import { Route, Switch } from "react-router-dom";
import request from "superagent";
import Login from "./Login";
import Navbar from "./Navbar";
import Home from "./Home";
import Signup from "./Signup";
import Profile from "./Profile";
import SellForm from "./SellForm";
import AgentsList from "./AgentsList";

const CLOUDINARY_UPLOAD_PRESET = "etudeofmemories";
const CLOUDINARY_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/etudeofmemories8698/upload";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      token: "",
      uploadedFileCloudinaryUrl: "",
      uploadedFile: null,
      is_broker: false,
      agentsList: []
    };
  }

  componentDidMount() {
    const existingToken = localStorage.getItem("token");
    const existingUser = localStorage.getItem("username");
    const existingUserId = localStorage.getItem("user_id");
    const existingImgurl = localStorage.getItem("imgurl");
    const existingBroker = localStorage.getItem("is_broker");
    let is_broker;
    if (existingBroker && typeof existingBroker === "string") {
      if (existingBroker === "true") {
        is_broker = true;
      } else if (existingBroker === "false") {
        is_broker = false;
      }
    }
    // console.log("existing token: ", existingToken);
    if (existingToken) {
      this.setState({
        token: existingToken,
        username: existingUser,
        imgurl: existingImgurl,
        is_broker: is_broker,
        user_id: existingUserId
      });
    }
    this.fetchAgentsList();
  }

  fetchAgentsList = () => {
    const url = "http://localhost:5000/agentslist";
    const token = "Token " + this.state.token;
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
      }
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState({
          agentsList: data.agentsList
        });
      });
  };

  handleLogin = (email, password) => {
    const url = "http://localhost:5000/login";
    const token = "Token " + this.state.token;
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        localStorage.setItem("token", data["token"]);
        localStorage.setItem("username", data["username"]);
        localStorage.setItem("imgurl", data["imgurl"]);
        localStorage.setItem("is_broker", data["is_broker"]);
        localStorage.setItem("user_id", data["user_id"]);

        this.setState({
          token: data["token"],
          username: data["username"],
          imgurl: data["imgurl"],
          is_broker: data["is_broker"],
          user_id: data["user_id"]
        });
      });
  };

  handleSignup = (email, password, username, is_broker) => {
    const url = "http://localhost:5000/signup";
    const token = "Token " + this.state.token;
    const imgurl = this.state.uploadedFileCloudinaryUrl;
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        email: email,
        password: password,
        username: username,
        imgurl: imgurl,
        is_broker: is_broker
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log(data);
      });
    // remove img url
    this.setState({
      uploadedFileCloudinaryUrl: "",
      uploadedFile: null
    });
  };

  handleListHouse = (address, city, district, ward, street, number) => {
    const url = "http://localhost:5000/sell";
    const token = "Token " + this.state.token;

    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        address: address,
        city: city,
        district: district,
        ward: ward,
        street: street,
        number: number
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log(data);
      });
  };

  handleLogout = () => {
    const url = "http://localhost:5000/logout";
    const token = "Token " + this.state.token;
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
      }
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log(data);
      });

    this.setState({
      username: "",
      token: ""
    });
    localStorage.clear();
  };

  onImageDrop = files => {
    this.setState({
      uploadedFile: files[0]
    });
    this.handleImageUpload(files[0]);
  };

  handleImageUpload = file => {
    let upload = request
      .post(CLOUDINARY_UPLOAD_URL)
      .field("upload_preset", CLOUDINARY_UPLOAD_PRESET)
      .field("file", file);

    upload.end((err, response) => {
      if (err) {
        console.error(err);
      }

      if (response.body.secure_url !== "") {
        this.setState(
          {
            uploadedFileCloudinaryUrl: response.body.secure_url
          },
          () => console.log(this.state.uploadedFileCloudinaryUrl)
        );
      }
    });
  };

  render() {
    return (
      <div className="App">
        <Navbar
          username={this.state.username}
          user_id={this.state.user_id}
          onClickLogout={this.handleLogout}
          imgurl={this.state.imgurl}
          is_broker={this.state.is_broker}
        />

        <Switch>
          <Route
            path="/login/"
            exact
            render={props => (
              <Login {...props} onClickLogin={this.handleLogin} />
            )}
          />
          <Route
            path="/signup/"
            exact
            render={props => (
              <Signup
                {...props}
                imgurl={this.state.uploadedFileCloudinaryUrl}
                onImageDrop={this.onImageDrop}
                onClickSignup={this.handleSignup}
                uploadedFile={this.state.uploadedFile}
              />
            )}
          />
          <Route
            path="/home/"
            exact
            render={props => (
              <Home
                username={this.state.username}
                email={this.state.email}
                is_broker={this.state.is_broker}
                {...props}
              />
            )}
          />
          <Route
            path="/profile/:id"
            exact
            render={props => <Profile token={this.state.token} {...props} />}
          />
          <Route
            path="/sell/"
            exact
            render={props => (
              <SellForm onClickListHouse={this.handleListHouse} {...props} />
            )}
          />
          <Route
            path="/discovery/"
            exact
            render={props => (
              <AgentsList agentsList={this.state.agentsList} {...props} />
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default App;
