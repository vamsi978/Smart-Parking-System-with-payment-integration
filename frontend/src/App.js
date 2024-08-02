import {Container} from 'react-bootstrap'
import React from 'react'
import Header from './components/Header'
import toast, { Toaster } from "react-hot-toast";
import {Outlet,useLocation} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query';

// create a new QueryClient
const queryClient = new QueryClient();

const App = () => {
 

  
  return (
   <>
       <Toaster/>
      <Header />
      <main className='py-1'>
      <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </main>
     
   </>
  )
};
// const CustomToast = styled(ToastContainer)`
//  height:60px; 
//   background-color: red;
//   color: white;
//   font-size: 16px;
//  
// `;
export default App
