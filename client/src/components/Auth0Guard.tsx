import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import React, { ComponentType, useEffect } from "react";
import { Auth0Loader } from "./Auth0Loader";
import jwt_decode from 'jwt-decode';
import { AUTH0_ADMIN_PERM } from "../utils/constants";
import { Navigate, useNavigate } from "react-router-dom";

interface Auth0Guard {
  component: ComponentType;
}

export const Auth0Guard: React.FC<Auth0Guard> = ({
  component,
}) => {
  const Component = withPermissionRequired(component, AUTH0_ADMIN_PERM)
  return <Component />;
};

export const withPermissionRequired = (Component: ComponentType,  requiredPermission: string) => {
  const WithPermissionRequired = (props: any) => {
    const { getAccessTokenSilently } = useAuth0();
    const [hasPermission, setHasPermission] = React.useState(null);

    useEffect(() => {
      const checkPermissions = async () => {
        const token = await getAccessTokenSilently();
        const decodedToken = jwt_decode(token);
        //@ts-ignore
        const userPermissions = decodedToken.permissions;
        setHasPermission(userPermissions && userPermissions.includes(requiredPermission));
      };
      checkPermissions();
    }, []);

    // Since async, firs render will have hasPermission === null. 
    // Navigate breaks state changes so use Navigate AFTER token check run and fails. 
    // Use null as an indicator if token check as completed was run.
    if (hasPermission) {
      return <Component {...props} />;
    } 
    if (hasPermission === false) {
      return <Navigate to="/401"/>;
    }
    return null
  };

  return withAuthenticationRequired(WithPermissionRequired, {
    onRedirecting: () => <Auth0Loader />,
  });
};
