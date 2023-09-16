import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Avatar, Divider, List, Skeleton } from 'antd';
import '../static/Antdstyle.css';

export default function ScrollList(props: any) {

  const [selectedId, setSelectedId] = useState("");
  
  const {
    itemList,
    itemDataMap,
    setItemId,
    setItemData,
    handleOptionClick,
  } = props;

  return (
      <div
        id="scrollableDiv"
        style={{
          height: 200,
          width: 200,
          overflow: 'auto',
          padding: '0 16px',
          border: '1px solid rgba(140, 140, 140, 0.35)',
        }}
      >
        <InfiniteScroll
          dataLength={5}
          next={()=>{}}
          hasMore={false}
          loader={<Skeleton />}
          scrollableTarget="scrollableDiv"
        >
          <List
            // @ts-ignore for now
            dataSource={itemList}
            renderItem={(item : {id: string, fullName: string}) => (
              <List.Item
                style={{borderLeft: 50}}
                className= {selectedId === item.id ? "ant-menu-item-selected" : ""}
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  handleOptionClick(item.id, itemDataMap, setItemId, setItemData)}}
              >
                <List.Item.Meta
                  style={{marginLeft: 5}}
                  // @ts-ignore for now
                  title={item.display}
                />
            </List.Item>
          )}
        />
        </InfiniteScroll>
      </div>
  )
}