import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

interface FormData {
  name: string;
  checked: boolean;
  time: Date;
}

const CheckInPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const onSubmit = (data: FormData) => {
    const submissionTime = new Date();
    console.log("Name:", data.name);
    console.log("Checked:", data.checked ? "Checking In" : "Checking Out");

    //adding submission time to data
    data["time"] = submissionTime;
    console.log(data);
    // Reset form after submission
    reset();

    // Send form data to server
    axios
      .post("http://localhost:4000/write-to-sheet", data)
      .then((response) => {
        console.log(response.data.message);
        // Show success alert
        setSubmissionStatus("Success");
        // Reset alert after 2 seconds
        setTimeout(() => {
          setSubmissionStatus(null);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  };

  return (
    <div
      style={{
        backgroundColor: "#e0f2f1",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          backgroundColor: "#80cbc4",
          padding: "1rem",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1>Milal Sign In</h1>
      </header>
      {submissionStatus && (
        <div
          style={{
            backgroundColor: submissionStatus === "Success" ? "green" : "red",
            color: "white",
            textAlign: "center",
            padding: "0.5rem",
          }}
        >
          {submissionStatus}
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form
          style={{
            backgroundColor: "#e0f2f1",
            padding: "1rem",
            color: "#37474f",
            width: "300px",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="name" style={{ fontSize: "30px" }}>
              Name:
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: true })}
              style={{ fontSize: "22px" }}
            />
            {errors.name && (
              <span style={{ color: "red" }}>Name is required</span>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="checked" style={{ fontSize: "30px" }}>
              Check:
            </label>
            <input
              type="checkbox"
              id="checked"
              {...register("checked")}
              style={{ transform: "scale(1.5)" }}
            />
          </div>

          <button type="submit" style={{ fontSize: "30px" }}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckInPage;
