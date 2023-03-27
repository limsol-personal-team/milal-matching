import React from 'react';
import { Layout, Menu } from 'antd';
import SignupGrid from './pages/SignupGrid.tsx';
import './App.css';

const { Header, Content, Footer } = Layout;


function App() {
  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" >Homepage</Menu.Item>
          <Menu.Item key="2">Volunteers</Menu.Item>
          <Menu.Item key="3">Friends</Menu.Item>
          <Menu.Item key="4">About</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
          <SignupGrid/>
      </Content>
      <Footer style={{ position: 'absolute', bottom: 0, width: '100%' }}>
        Milal School ©2023 Created by SJS Studios
      </Footer>
    </Layout>
  );
}

export default App;
