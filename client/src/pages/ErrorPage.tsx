import { useRouteError } from "react-router-dom";
import * as React from "react";

interface RoutingError {
  statusText: string;
  message: string;
}

export default function ErrorPage() {
  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
    </div>
  );
}
