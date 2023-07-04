import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}
