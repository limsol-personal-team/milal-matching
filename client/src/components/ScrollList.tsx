import { List, Skeleton } from 'antd';
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import '../static/Antdstyle.css';

export default function ScrollList(props: any) {

  const {
    itemList,
    handleOptionClick,
    isMultiSelect = false
  } = props;

  const [selectedIds, setSelectedIds] = useState<any>([]);

  const updateSelectedIds = (id : any) => {
    let tempIds: any[] = [];
    if (isMultiSelect) {
      tempIds = [...selectedIds];
      if(selectedIds.includes(id)) {
        tempIds.splice(tempIds.indexOf(id), 1);
      } else {
        tempIds.push(id);
      }
    } else {
      tempIds.push(id);
    }
    setSelectedIds(tempIds);
    handleOptionClick(tempIds);
  }

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
                className= {selectedIds.includes(item.id) ? "ant-menu-item-selected" : ""}
                key={item.id}
                onClick={() => {
                  updateSelectedIds(item.id);
                  }}
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