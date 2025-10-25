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
import AssetForm from './components/AssetForm.jsx' // Import new form
import NetworkHierarchy from './components/NetworkHierarchy.jsx' // Import new page
import TaskList from './components/TaskList.jsx'

// Define the application routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      {
        index: true, 
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
        path: "assets/new", // Add Asset route
        element: <AssetForm />,
      },
      {
        path: "assets/edit/:assetId", // Edit Asset route
        element: <AssetForm />,
      },
      {
        path: "network-hierarchy", // Add Network route
        element: <NetworkHierarchy />,
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