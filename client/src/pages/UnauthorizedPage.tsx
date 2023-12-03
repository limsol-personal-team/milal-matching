import { useRouteError } from "react-router-dom";
import * as React from "react";

interface RoutingError {
  statusText: string;
  message: string;
}

export default function UnauthorizedPage() {
  return (
    <div id="error-page">
      <h1>Sorry!</h1>
      <p>You do not have permission to see this page.</p>
    </div>
  );
}
