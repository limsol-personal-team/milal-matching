import React from "react";
import { Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

interface DataType {
  key: string;
  milalFriendName: string;
  volunteerName: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: "MilalFriend",
    dataIndex: "milalFriendName",
    key: "milalFriendName",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Volunteer",
    dataIndex: "volunteerName",
    key: "volunteerName",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Match</a>
        <a>Unmatch</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    milalFriendName: "John Brown",
    volunteerName: "John Green",
  },
  {
    key: "2",
    milalFriendName: "Jim Green",
    volunteerName: "Jim Brown",
  },
  {
    key: "3",
    milalFriendName: "Joe Black",
    volunteerName: "Joe Green",
  },
];

const App: React.FC = () => <Table columns={columns} dataSource={data} />;

export default App;
