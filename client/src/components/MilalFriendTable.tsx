import { Box } from "@mui/material";
import { Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import "../static/MilalFriendTable.css";

interface DataType {
  key: string;
  milalFriendName: string;
  volunteerName: string;
}

const COLUMN_STYLE = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

function renderText(text: String) {
  return (
    // @ts-ignore for now
    <div className="responsive-column" style={COLUMN_STYLE}>
      {text}
    </div>
  );
}

const columns: ColumnsType<DataType> = [
  {
    title: "MilalFriend",
    dataIndex: "milalFriendName",
    key: "milalFriendName",
    render: renderText,
  },
  {
    title: "Volunteer",
    dataIndex: "volunteerName",
    key: "volunteerName",
    render: renderText,
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Add</a>
        <a>Rem</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    milalFriendName: "John ASDFSDFADSFasdfasdfa ",
    volunteerName: "John Greenasdfasdfasdfadsf",
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

export default function MilalFriendTable() {
  return (
    <Box>
      <Table columns={columns} dataSource={data} />
    </Box>
  );
}
