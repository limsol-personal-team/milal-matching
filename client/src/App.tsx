import React from "react";
import { Layout, Menu } from "antd";
import SignupGrid from "./pages/SignupGrid";
import NavBar from "./components/NavBar";
import "./App.css";

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout className="layout">
      <NavBar />
      <Content style={{ padding: "0 50px" }}>
        <SignupGrid />
      </Content>
      <Footer style={{ position: "absolute", bottom: 0, width: "100%" }}>
        Milal School ©2023 Created by SJS Studios
      </Footer>
    </Layout>
  );
}

export default App;
