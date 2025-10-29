import { Typography, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { SearchScrollList, ScrollListItem, ScrollListProps } from './SearchScrollList';
import { getEmailAccounts, getMatchData, getUserData, patchEmailAccounts, postMatchData, postUnmatchData, getVolunteerListLightweight, getMilalFriendListLightweight, getMatchDataWithRecommendations } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { UserTypes, ACTIVE_FILTER_QUERY } from '../utils/constants';
import { getCurrentDateTimeISO } from '../utils/dateTime';
import AlertToaster from './AlertToaster';
import { MatchData, MilalFriendData, VolunteerData } from '../types/modelSchema';
import { useActiveFilter } from '../providers/activeFilterProvider';


export default function UserDetail() {
  const { getAccessTokenSilently } = useAuth0();
  const { showActiveOnly } = useActiveFilter();

  // Pull initial data into structs
  const [userNameList, setUserNameList] = useState<ScrollListItem[]>([]);
  const [userDataMap, setUserDataMap] = useState<any>({});

  // Update selected entity displayed
  const [userId, setUserId] = useState<string>("");
  const [userData, setUserData] = useState<Partial<VolunteerData>>({});
  const [userMatchList, setUserMatchList] = useState<string[]>([]);
  const [userRecommendedMatch, setUserRecommendedMatch] = useState<any[]>([]);

  // Pull initial data into structs
  const [friendNameList, setFriendNameList] = useState<ScrollListItem[]>([]);
  const [friendDataMap, setFriendDataMap] = useState<any>({});

  // Update selected entity displayed
  const [friendId, setFriendId] = useState<string>("");
  const [friendData, setFriendData] = useState<Partial<MilalFriendData>>({});
  const [friendMatchList, setFriendMatchList] = useState<string[]>([]);
  const [friendRecommendedMatch, setFriendRecommendedMatch] = useState<any[]>([]);

  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus}

  
  const pullUserData = async (userType : UserTypes) => {
    const authToken = await getAccessTokenSilently();
    const queryString = (showActiveOnly ? ACTIVE_FILTER_QUERY + '&' : '') + 'include_day_matched=true';
    
    if (userType === UserTypes.Volunteers) {
      // Use lightweight endpoint for volunteers with is_day_matched enabled
      const res = await getVolunteerListLightweight(authToken, queryString);
      if (!res.error) {
        let nameList : ScrollListItem[] = res.data.map(({ id, first_name, last_name, is_day_matched }: any) => ( 
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
        setUserNameList(nameList);
        setUserDataMap(dataMap);
      }
    } else {
      // Use lightweight endpoint for Milal friends with is_day_matched enabled
      const res = await getMilalFriendListLightweight(authToken, queryString);
      if (!res.error) {
        let nameList : ScrollListItem[] = res.data.map(({ id, first_name, last_name, is_day_matched }: any) => ( 
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
    
    // Use the new endpoint that includes recommendations
    const res = await getMatchDataWithRecommendations(authToken, queryString);
    
    if (!res.error) {
      // Extract match data from the matches array
      let matchList : string[] = res.data.matches.map(({ milal_friend, volunteer }: MatchData) => { 
          const userData = isVolunteer ? milal_friend : volunteer;
          return userData ? `${userData.first_name} ${userData.last_name}` : "Self"
        }
      );
      
      // Extract recommended_match data from the response
      const recommendedMatch = res.data.recommended_match || [];
      
      if (isVolunteer) {
        setUserMatchList(matchList);
        setUserRecommendedMatch(recommendedMatch);
      } else {
        setFriendMatchList(matchList);
        setFriendRecommendedMatch(recommendedMatch);
      }
    }
  }

  const submitMatchData = async (noVolunteer? : boolean) => {
    // MilalFriend must be selected minimally
    if (!friendId) {
      setErrorStatus(true);
      return;
    }
    // For self-match, match with none/null
    let reqBody = {
      "volunteer": noVolunteer ? null: userId,
      "milal_friend": friendId
    };
    const authToken = await getAccessTokenSilently();
    const res = await postMatchData(authToken, reqBody);
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

  const submitUnmatchData = async () => {
    // MilalFriend must be selected minimally
    if (!friendId) {
      setErrorStatus(true);
      return;
    }
    // For unmatch, clear milal-friend of all matches
    let reqBody = {
      "milal_friend": friendId
    };
    const authToken = await getAccessTokenSilently();
    const res = await postUnmatchData(authToken, reqBody);
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
    submitUnmatchData();
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
  }, [showActiveOnly]);

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
    recommendedMatch: any[];
  }

  const UserDetailInfo: React.FC<UserDetailInfoProps> = ({ 
    detailData,
    matchList,
    recommendedMatch
  }) => (
    <>
      <div><b>Name</b>: {detailData.first_name} {detailData.last_name}</div>
      <div><b>Match</b>: {matchList.join(', ')}</div>
      <div><b>Recommended</b>: {recommendedMatch?.map(
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
              recommendedMatch={friendRecommendedMatch}
            />
          </Grid>
          <Grid item xs={6}>
            <SearchScrollList
              {...scrollListUserProps}
            />
            <UserDetailInfo
              detailData={userData}
              matchList={userMatchList}
              recommendedMatch={userRecommendedMatch}
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