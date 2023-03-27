import React from "react";
import { Layout, Menu } from "antd";

const { Header } = Layout;

function NavBar() {
  return (
    <Header>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1">Homepage</Menu.Item>
        <Menu.Item key="2">Volunteers</Menu.Item>
        <Menu.Item key="3">Friends</Menu.Item>
        <Menu.Item key="4">About</Menu.Item>
      </Menu>
    </Header>
  );
}

export default NavBar;
