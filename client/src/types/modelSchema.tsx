export interface MilalFriendData {
  id: string;
  created_at: string;
  last_updated: string;
  description: string;
  dob: string;
  first_name: string;
  last_name: string;
  active: boolean;
  is_day_matched: boolean;
  recommended_match: Record<string, string | number>[];
}

export interface VolunteerData {
  id: string;
  created_at: string;
  last_updated: string;
  description: string;
  dob: string;
  first_name: string;
  last_name: string;
  active: boolean;
  graduation_year: number;
  is_day_matched: boolean;
  recommended_match: Record<string, string | number>[];
}

export interface MatchData {
  id: string;
  milal_friend: MilalFriendData;
  volunteer: VolunteerData;
  created_at: string;
  last_updated: string;
  match_date: string;
}

export interface VolunteerHoursData {
  id: string;
  created_at: string;
  last_updated: string;
  service_type: string;
  service_date: string;
  hours: number;
  description: string;
  volunteer: string;
  email: string;
}
