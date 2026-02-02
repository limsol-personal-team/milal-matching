import React, { useEffect, useState } from "react";
import { TextField, Table, TableBody, TableRow, TableCell, TableContainer, Paper } from '@mui/material';

export interface ScrollListItem {
  id: string;
  display: string;
  showCheck?: boolean;
}

export interface ScrollListProps {
  initialItemList: any[];
  handleOptionClick: Function,
  isMultiSelect?: boolean;
  selectedIds?: string[];
}

export function SearchScrollList({ initialItemList, handleOptionClick, isMultiSelect = false, selectedIds}: ScrollListProps) {

  const [itemList, setItemList] = useState<ScrollListItem[]>(initialItemList);
  const [itemMap, setItemMap] = useState<Map<string, ScrollListItem>>(new Map());
  const [filteredData, setFilteredData] = useState<ScrollListItem[]>(initialItemList);
  const [internalSelectedIds, setInternalSelectedIds] = useState<any>([]);
  const [filter, setFilter] = useState('');

  // Use external selectedIds if provided, otherwise use internal state
  const currentSelectedIds = selectedIds || internalSelectedIds;

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
      tempIds = [...currentSelectedIds];
      if(currentSelectedIds.includes(id)) {
        tempIds.splice(tempIds.indexOf(id), 1);
      } else {
        tempIds.push(id);
      }
    } else {
      tempIds.push(id);
    }

    // Update internal state if not using external selectedIds
    if (!selectedIds) {
      setInternalSelectedIds(tempIds);
    }

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
        style={{ marginBottom: '8px' }}
      />
      <TableContainer component={Paper} sx={{ maxHeight: 200, minHeight: 200 }}>
        <Table size="small">
          <TableBody>
            {filteredData.map((item: ScrollListItem) => (
              <TableRow
                key={item.id}
                hover
                selected={currentSelectedIds.includes(item.id)}
                onClick={() => updateSelectedIds(item.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ py: 0.5 }}>
                  {item.showCheck ? '✅ ' : ''}{item.display}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
    </>
  )
}
