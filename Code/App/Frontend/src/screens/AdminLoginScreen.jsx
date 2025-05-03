import {
  CheckIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { Button } from "../components/admin_ui/button";
import { Card, CardContent } from "../components/admin_ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/admin_ui/table";
import { AdminNavigationBar } from "../components/navigation_bar/AdminNavigationBar";
import { useCookies } from 'react-cookie';
import {toast} from 'react-toastify';
    
const fetchUsers = async () => {
  const get_users_response = await fetch("/api/admin/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const users = await get_users_response.json();
  if (!get_users_response.ok) {
    toast.error(`${users.detail}!`);
  }
  return users;
};

export const AdminLoginScreen = () => {
  const [users, setUsers] = React.useState([]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const usersPerPage = 5;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);


  React.useEffect(() => {
    const loadUsers = async () => {
      const users = await fetchUsers();
      setUsers(users);
    };

    loadUsers();
  }, []);

  const handleDeleteUser = async (username) => {
    const get_user_response = await fetch(`/api/users/${username}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
    const user = await get_user_response.json();
  
    if (!get_user_response.ok) {
      toast.error(`${user.detail}!`);
        return;
    }
  
    const delete_response = await fetch(`/api/admin/users/${user.username}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await delete_response.json();
  
    if (!delete_response.ok) {
      toast.error(`${data.detail}!`);
        return;
    }
  
    toast.success('Delete successfully!');
    const users = await fetchUsers();
    setUsers(users);
  }

  const handleStatusToggle = async (username) => {
    const status_response = await fetch(`/api/admin/users/${username}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await status_response.json();
  
    if (!status_response.ok) {
      toast.error(`${data.detail}!`);
        return;
    }
  
    toast.success('Change status successfully!');
    const users = await fetchUsers();
    setUsers(users);
  }

  return (
    <div className="bg-white flex flex-row justify-center w-screen h-screen">
      <div className="bg-white overflow-hidden w-full h-full relative">
        {/* Header */}
        <AdminNavigationBar title="ADMINISTRATION"/>

        {/* Main Content */}
        <main className="p-6">
          <div className="flex justify-end items-center mb-8">
            {/* <Button
              variant="ghost"
              className="flex items-center gap-2 text-2xl font-['Inter',Helvetica] font-normal"
            >
              <PlusCircleIcon className="w-12 h-12" />
              <span className="font-['Inter',Helvetica] font-normal text-2xl">
                Add new movie
              </span>
            </Button> */}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[37px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      ID
                    </TableHead>
                    <TableHead className="w-[151px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      Username
                    </TableHead>
                    <TableHead className="w-[207px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      Email address
                    </TableHead>
                    <TableHead className="w-[159px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      First name
                    </TableHead>
                    <TableHead className="w-[159px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      Last name
                    </TableHead>
                    <TableHead className="w-[159px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      Type
                    </TableHead>
                    <TableHead className="w-[97px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      Status
                    </TableHead>
                    <TableHead className="w-[300px] h-[50px] bg-[#bebe2e] text-center text-2xl text-black font-bold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={
                        (index-1) % 2 === 0 ? "bg-[#f6f6f6]" : "bg-[#d9d9d9]"
                      }
                    >
                      <TableCell className="text-center text-xl h-[150px]">
                        {index+1}
                      </TableCell>
                      <TableCell className="text-center text-2xl h-[150px]">
                        {user.username}
                      </TableCell>
                      <TableCell className="text-center text-2xl h-[150px]">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center text-2xl h-[150px]">
                        {user.first_name}
                      </TableCell>
                      <TableCell className="text-center text-2xl h-[150px]">
                        {user.last_name}
                      </TableCell>
                      <TableCell className="text-center text-2xl h-[150px]">
                        {user.role}
                      </TableCell>
                      <TableCell className="text-center h-[150px]">
                        {user.is_active === true ? (
                          <CheckIcon className="w-12 h-12 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-12 h-12 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="h-[150px] space-y-4 py-4">
                      {
                        user.role === 'user' && (
                          <>
                            <Button
                              onClick={() => handleDeleteUser(user.username)}
                              className="w-[190px] h-[50px] mr-2 bg-[#df1d1d] text-white text-2xl shadow-[0px_4px_10px_#00000040] hover:bg-[#c01a1a]"
                            >
                              Delete
                            </Button>

                            {user.is_active ? (
                              <Button onClick={() => handleStatusToggle(user.username)} className="w-[190px] h-[50px] bg-[#8f0707] text-black text-2xl shadow-[0px_4px_10px_#00000040] hover:bg-[#7a0606]">
                                Deactivate
                              </Button>
                            ) : (
                              <Button onClick={() => handleStatusToggle(user.username)} className="w-[190px] h-[50px] bg-[#62bf36] text-black text-2xl shadow-[0px_4px_10px_#00000040] hover:bg-[#52a32e]">
                                Activate
                              </Button>
                            )}
                          </>
                        )
                      }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex justify-center mt-4 space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-[#bebe2e] text-black px-4 py-2 rounded"
          >
            Prev
          </Button>

          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`${
                currentPage === index + 1 ? "bg-[#8f0707] text-white" : "bg-[#d9d9d9] text-black"
              } px-4 py-2 rounded`}
            >
              {index + 1}
            </Button>
          ))}

          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-[#bebe2e] text-black px-4 py-2 rounded"
          >
            Next
          </Button>
        </div>

        </main>
      </div>
    </div>
  );
};
