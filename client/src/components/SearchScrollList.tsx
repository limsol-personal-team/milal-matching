import { List, Skeleton } from 'antd';
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import '../static/Antdstyle.css';
import { TextField } from '@mui/material';

export interface ScrollListItem {
  id: string;
  display: string;
  showCheck?: boolean;
}

export interface ScrollListProps {
  initialItemList: any[]; 
  handleOptionClick: Function,
  isMultiSelect?: boolean; 
}

export function SearchScrollList({ initialItemList, handleOptionClick, isMultiSelect = false}: ScrollListProps) {

  const [itemList, setItemList] = useState<ScrollListItem[]>(initialItemList);
  const [itemMap, setItemMap] = useState<Map<string, ScrollListItem>>(new Map());
  const [filteredData, setFilteredData] = useState<ScrollListItem[]>(initialItemList);
  const [selectedIds, setSelectedIds] = useState<any>([]);
  const [filter, setFilter] = useState('');

  // Effect to update itemList when initialItemList changes
  useEffect(() => {
    const newMap = new Map<string, ScrollListItem>();
    initialItemList.forEach((item : ScrollListItem) => {
      newMap.set(item.id, item);
      setItemMap(newMap)
    });
    setItemList(initialItemList);
  }, [initialItemList]);

  // Effect to filter data based on input and itemList change
  useEffect(() => {
    setFilteredData(
      itemList.filter((item: ScrollListItem) =>
        item.display.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [filter, itemList]); 

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
    <>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <div
        id="scrollableDiv"
        style={{
          height: 200,
          width: "100%",
          overflow: 'auto',
          padding: '0 16px',
          border: '1px solid rgba(140, 140, 140, 0.35)'
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
            dataSource={filteredData}
            renderItem={(item : ScrollListItem) => (
              <List.Item
                style={{borderLeft: 50}}
                className= {selectedIds.includes(item.id) ? "ant-menu-item-selected" : ""}
                key={item.id}
                onClick={() => {
                  updateSelectedIds(item.id);
                  }}
              >
                <List.Item.Meta
                  style={{margin: "-5px 0 -5px 5px", fontFamily: '3px'}}
                  // @ts-ignore for now
                  title={`${item.showCheck ? '✅ ' : ''}${item.display}`}
                />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
      <br></br>
    </>
  )
}