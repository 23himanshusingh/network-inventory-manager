import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'

// Import the layout and page components
import App from './App.jsx'
import Dashboard from './components/Dashboard.jsx'
import CustomerList from './components/CustomerList.jsx'
import AssetList from './components/AssetList.jsx'
import TaskList from './components/TaskList.jsx'
// import ErrorPage from './ErrorPage.jsx'; // Good to add later

// Define the application routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App.jsx is the root layout
    // errorElement: <ErrorPage />, // You can add an error boundary here
    children: [
      {
        index: true, // Renders Dashboard at the root path "/"
        element: <Dashboard />,
      },
      {
        path: "customers",
        element: <CustomerList />,
      },
      {
        path: "assets",
        element: <AssetList />,
      },
      {
        path: "tasks",
        element: <TaskList />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)