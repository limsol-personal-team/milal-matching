import React from "react";

export const Auth0Loader: React.FC = () => {
  const loadingImg = "https://cdn.auth0.com/blog/hello-auth0/loader.svg";

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
   }}>
      <img 
        src={loadingImg} 
        alt="Loading..." 
        style={{ 
          width: '75%', 
          height: '75%' 
        }} 
      />
   </div>
  );
};
