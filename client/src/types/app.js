import React from "react";
import ReactQueryProvider from "./ReactQueryProvider";
import UsersList from "./UsersList";

function App() {
  return (
    <ReactQueryProvider>
      <UsersList />
    </ReactQueryProvider>
  );
}

export default App;
