import { Typography, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { SearchScrollList, ScrollListItem, ScrollListProps } from './SearchScrollList';
import { getEmailAccounts, getMatchData, getUserData, patchEmailAccounts, postMatchData, postUnmatchData } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { UserTypes } from '../utils/constants';
import { getCurrentDateTimeISO } from '../utils/dateTime';
import AlertToaster from './AlertToaster';
import { MatchData, MilalFriendData, VolunteerData } from '../types/modelSchema';


export default function UserDetail() {
  const { getAccessTokenSilently } = useAuth0();

  // Pull initial data into structs
  const [userNameList, setUserNameList] = useState<ScrollListItem[]>([]);
  const [userDataMap, setUserDataMap] = useState<any>({});

  // Update selected entity displayed
  const [userId, setUserId] = useState<string>("");
  const [userData, setUserData] = useState<Partial<VolunteerData>>({});
  const [userMatchList, setUserMatchList] = useState<string[]>([]);

  // Pull initial data into structs
  const [friendNameList, setFriendNameList] = useState<ScrollListItem[]>([]);
  const [friendDataMap, setFriendDataMap] = useState<any>({});

  // Update selected entity displayed
  const [friendId, setFriendId] = useState<string>("");
  const [friendData, setFriendData] = useState<Partial<MilalFriendData>>({});
  const [friendMatchList, setFriendMatchList] = useState<string[]>([]);

  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus}

  
  const pullUserData = async (userType : UserTypes) => {
    const authToken = await getAccessTokenSilently();
    const res = await getUserData(authToken, userType);
    if (!res.error) {
      let nameList : ScrollListItem[] = res.data.map(({ id, first_name, last_name, is_day_matched }: 
        VolunteerData | MilalFriendData) => ( 
        { 
          id: id,
          display: first_name + " " + last_name,
          showCheck: is_day_matched
        })
      );
        // @ts-ignore for now
      let dataMap = res.data.reduce((obj, item) => {
        obj[item.id] = item;
        return obj;
      }, {});
      // Initialize data structs
      if (userType === UserTypes.Volunteers) {
        setUserNameList(nameList);
        setUserDataMap(dataMap);
      } else {
        setFriendNameList(nameList);
        setFriendDataMap(dataMap);
      }
    }
  }

  const pullMatchData = async (userId: string, userType : UserTypes) => {
    // Don't pull match data for empty strings (i.e. initial state, non selection)
    if (!userId) {
      return;
    }
    const authToken = await getAccessTokenSilently();
    const isVolunteer = userType === UserTypes.Volunteers;
    const queryString = `${isVolunteer ? "volunteer" : "milal_friend"}=${userId}` +
      `&match_date=${getCurrentDateTimeISO(true)}`
    const res = await getMatchData(authToken, queryString);
    if (!res.error) {
      // If match is null, assuming the user is self-matched
      let matchList : string[] = res.data.map(({ milal_friend, volunteer }: MatchData) => { 
          const userData = isVolunteer ? milal_friend : volunteer;
          return userData ? `${userData.first_name} ${userData.last_name}` : "Self"
        }
      );
      isVolunteer ? setUserMatchList(matchList) : setFriendMatchList(matchList);
    }
  }

  const submitMatchData = async (noVolunteer? : boolean, unmatch? : boolean) => {
    // MilalFriend must be selected minimally
    if (!friendId) {
      setErrorStatus(true);
      return;
    }
    let reqBody = {
      "volunteer": noVolunteer ? null: userId,
      "milal_friend": friendId
    };
    const authToken = await getAccessTokenSilently();
    const res = unmatch ? await postUnmatchData(authToken, reqBody) : 
      await postMatchData(authToken, reqBody);
    if (res.error) {
      setErrorStatus(true);
      return;
    } else {
      // Update data by re-fetching all data
      pullUserData(UserTypes.Volunteers);
      pullMatchData(userId, UserTypes.Volunteers);
      pullUserData(UserTypes.MilalFriends);
      pullMatchData(friendId, UserTypes.MilalFriends);
      setSuccessStatus(true);
    }
  }

  const handleSelfMatchSubmit = async () => {
    submitMatchData(true);
  }

  const handleMatchSubmit = async () => {
    submitMatchData();
  }
  
  const handleUnmatchSubmit = async () => {
    submitMatchData(false, true);
  }

  // @ts-ignore for now
  const handleUserOptionClick = (idList) => {
    pullMatchData(idList[0], UserTypes.Volunteers)
    setUserId(idList[0]);
    setUserData(userDataMap[idList[0]]);
  }

  // @ts-ignore for now
  const handleFriendOptionClick = (idList) => {
    pullMatchData(idList[0], UserTypes.MilalFriends)
    setFriendId(idList[0]);
    setFriendData(friendDataMap[idList[0]]);
  }

  useEffect(() => {
    pullUserData(UserTypes.Volunteers);
    pullUserData(UserTypes.MilalFriends);
  }, []);

  const scrollListUserProps: ScrollListProps = {
    initialItemList: userNameList,
    handleOptionClick: handleUserOptionClick
  }
  
  const scrollListFriendProps: ScrollListProps = {
    initialItemList: friendNameList,
    handleOptionClick: handleFriendOptionClick
  }

  interface UserDetailInfoProps {
    detailData: Partial<VolunteerData | MilalFriendData>;
    matchList: string[];
  }

  const UserDetailInfo: React.FC<UserDetailInfoProps> = ({ 
    detailData,
    matchList 
  }) => (
    <>
      <div><b>Name</b>: {detailData.first_name} {detailData.last_name}</div>
      <div><b>Match</b>: {matchList.join(', ')}</div>
      <div><b>Recommended</b>: {detailData.recommended_match?.map(
        item => `${item.name} (${item.count})`).join(", ")}</div>
    </>
  );
  return (
    <>
      <AlertToaster
          {...alertProps}
          successMessage="Match updated!"
        />
      <div style={{margin: '0 -30px'}}>
        <Grid container spacing={2} justifyContent='center'>
          <Grid item xs={6}>
            <SearchScrollList
              {...scrollListFriendProps}
            />
            <UserDetailInfo
              detailData={friendData}
              matchList={friendMatchList}
            />
          </Grid>
          <Grid item xs={6}>
            <SearchScrollList
              {...scrollListUserProps}
            />
            <UserDetailInfo
              detailData={userData}
              matchList={userMatchList}
            />
          </Grid>
        </Grid>
        <br></br>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Button 
              type="submit" 
              variant="contained"
              onClick={() => {
                handleSelfMatchSubmit();
              }}
            >
              Self
            </Button>
          </Grid>
          {
            userId && friendId && (
              <>
                <Grid item xs={4}>
                  <Button 
                    type="submit" 
                    variant="contained"
                    onClick={() => {
                      handleMatchSubmit();
                    }}
                  >
                    Match
                  </Button>
                </Grid>
              </>
            )
          }
          <Grid item xs={4}>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                backgroundColor: "red",
                color: "white",
                "&:hover": {
                  backgroundColor: "darkred",
                },
              }}
              onClick={() => {
                handleUnmatchSubmit();
              }}
            >
              Unmatch
            </Button>
          </Grid>
        </Grid>
        <br></br>
        <br></br>
      </div>
    </>
  );
}