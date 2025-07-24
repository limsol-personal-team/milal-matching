export const UserFormSchema = [
  {
    key: "first_name",
    isRequired: true,
    props: {
      name: "first_name" ,
      label: "First Name",
      type: "text"
    }
  },
  {
    key: "last_name",
    isRequired: true,
    props: {
      name: "last_name" ,
      label: "Last Name",
      type: "text"
    }
  },
  {
    key: "description",
    isRequired: false,
    props: {
      name: "description",
      label: "Description", 
      type: "text" 
    }
  },
  {
    key: "dob",
    isRequired: false,
    props: {
      name: "dob",
      label: "Date of Birth",
      type: "date" 
    }
  },
  {
    key: "graduation_year",
    isRequired: false,
    props: {
      name: "graduation_year",
      label: "Graduation Year", 
      type: "number" 
    }
  },
  {
    key: "bonus_percentage",
    isRequired: false,
    props: {
      name: "bonus_percentage",
      label: "Bonus Percentage", 
      type: "number" 
    }
  },
  {
    key: "active",
    isRequired: false,
    props: {
      name: "active",
      label: "active", 
      type: "boolean" 
    }
  }
]

export const MilalFriendFormSchema = [
  {
    key: "first_name",
    isRequired: true,
    props: {
      name: "first_name" ,
      label: "First Name",
      type: "text"
    }
  },
  {
    key: "last_name",
    isRequired: true,
    props: {
      name: "last_name" ,
      label: "Last Name",
      type: "text"
    }
  },
  {
    key: "description",
    isRequired: false,
    props: {
      name: "description",
      label: "Description", 
      type: "text" 
    }
  },
  {
    key: "dob",
    isRequired: false,
    props: {
      name: "dob",
      label: "Date of Birth",
      type: "date" 
    }
  },
  {
    key: "active",
    isRequired: false,
    props: {
      name: "active",
      label: "active", 
      type: "boolean" 
    }
  }
]

export const AttendanceFormSchema = [
  {
    key: "date",
    isRequired: false,
    props: {
      name: "date",
      label: "Date",
      type: "date" 
    }
  }
]

export const VolunteerHoursFormSchema = [
  {
    key: "service_type",
    isRequired: true,
    props: {
      name: "service_type",
      label: "Service Type",
      type: "select",
      options: [
        { value: "saturday_agape", label: "Saturday Agape" },
        { value: "orientation", label: "Orientation" },
        { value: "backfill", label: "Backfill" },
        { value: "other", label: "Other" }
      ]
    }
  },
  {
    key: "service_date",
    isRequired: true,
    props: {
      name: "service_date",
      label: "Service Date",
      type: "datetime-local"
    }
  },
  {
    key: "hours",
    isRequired: true,
    props: {
      name: "hours",
      label: "Hours",
      type: "number"
    }
  },
  {
    key: "description",
    isRequired: false,
    props: {
      name: "description",
      label: "Description",
      type: "text"
    }
  }
]

export const EmailAccountFormSchema = [
  {
    key: "email",
    isRequired: true,
    props: {
      name: "email",
      label: "Email Address",
      type: "email"
    }
  },
  {
    key: "display_name",
    isRequired: false,
    props: {
      name: "display_name",
      label: "Display Name",
      type: "text"
    }
  }
]