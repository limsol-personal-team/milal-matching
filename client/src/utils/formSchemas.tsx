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