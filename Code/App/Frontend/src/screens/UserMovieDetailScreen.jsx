import {HomeIcon, PlusCircleIcon} from "@heroicons/react/24/outline";
  import React from "react";
  import { Button } from "../components/movie_detail/button";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../components/movie_detail/table";
  import { UserNavigationBar } from "../components/navigation_bar/UserNavigationBar";
  import { useCookies } from 'react-cookie';
import { GuestNavigationBar } from "../components/navigation_bar/GuestNavigationBar";
import { useNavigate } from "react-router-dom";
import {toast} from 'react-toastify';
  
  const fetchMovies = async () => {
    const get_movies_response = await fetch("/api/movies/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    const movies = await get_movies_response.json();
    if (!get_movies_response.ok) {
      toast.error(`${movies.detail}!`);
    }
    return movies;
  };

  export const UserMovieDetailScreen = () => {
    const [cookies] = useCookies(['user']);
    const user = cookies.user || { role: 'guest' };
    const navigate = useNavigate();

    const [movies, setMovies] = React.useState([]);

    const [currentPage, setCurrentPage] = React.useState(1);
    const moviesPerPage = 3;
  
    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
  
    const totalPages = Math.ceil(movies.length / moviesPerPage);

      React.useEffect(() => {
        const loadUsers = async () => {
          const movies = await fetchMovies();
          setMovies(movies);
        };
    
        loadUsers();
      }, []);

      const handleDeleteMovie = async (movie_id) => {
            const delete_response = await fetch(`/api/movies/delete/${movie_id}`, {
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
            const movies = await fetchMovies();
            setMovies(movies);
      }

      const handleViewAnalysis = (movie_id) => {
        navigate(`/view_analysis/${movie_id}`);
      };

    return (
      <div className="bg-white flex flex-row justify-center w-screen h-screen">
        <div className="bg-white overflow-hidden w-full h-full relative">
          {/* Header */}
          {
            user.role === 'user' ?
            <UserNavigationBar title="MOVIE DETAILS"/> :
            <GuestNavigationBar title="MOVIE DETAILS"/>
          }
          
          {user.role === 'user' && ( 
          /* Add new movie button */
          <div className="flex items-center justify-end mt-8 mr-16">
            <Button onClick={() => navigate('/add_movie')} variant="ghost" className="flex items-center gap-2">
              <PlusCircleIcon className="w-12 h-12" />
              <span className="font-['Inter',Helvetica] font-normal text-2xl">
                Add new movie
              </span>
            </Button>
          </div>
          )}

          {/* Movie table */}
          <div className="px-[70px] mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] h-[50px] bg-[#bebe2e] text-center font-['Inter',Helvetica] text-2xl text-black font-bold">
                    ID
                  </TableHead>
                  <TableHead className="w-[300px] h-[50px] bg-[#bebe2e] text-center font-['Inter',Helvetica] text-2xl text-black font-bold">
                    Image
                  </TableHead>
                  <TableHead className="w-[300px] h-[50px] bg-[#bebe2e] text-center font-['Inter',Helvetica] text-2xl text-black font-bold">
                    Title
                  </TableHead>
                  <TableHead className="w-[300px] h-[50px] bg-[#bebe2e] text-center font-['Inter',Helvetica] text-2xl text-black font-bold">
                    Positive Rate
                  </TableHead>
                  <TableHead className="w-[300px] h-[50px] bg-[#bebe2e] text-center font-['Inter',Helvetica] text-2xl text-black font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMovies.map((movie,index) => (
                  <TableRow
                    key={movie.id}
                    className={
                      (index-1) % 2 === 0 ? "bg-[#f6f6f6]" : "bg-[#d9d9d9]"
                    }
                  >
                    <TableCell className="h-[150px] text-center font-['Inter',Helvetica] font-normal text-2xl">
                      {index+1}
                    </TableCell>
                    <TableCell className="h-[150px] text-center">
                      <div className="flex justify-center">
                        <img
                          src={movie.poster}
                          alt={movie.name}
                          className="w-20 h-[120px] object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="h-[150px] text-center font-['Inter',Helvetica] font-normal text-2xl">
                      {movie.name}
                    </TableCell>
                    <TableCell className="h-[150px] text-center font-['Inter',Helvetica] font-normal text-2xl">
                      {Math.round((movie.positive_reviews / movie.total_reviews) * 100)}%
                    </TableCell>
                    <TableCell className="h-[150px]">
                      <div className="flex flex-col gap-4 items-center">
                        <Button onClick={() => handleViewAnalysis(movie.id)} className="w-[190px] h-[50px] bg-[#078f88] shadow-[0px_4px_10px_#00000040] text-black font-['Inter',Helvetica] font-normal text-2xl">
                          View analysis
                        </Button>
                        {
                          user.role === 'user' && (
                            <Button onClick={() => handleDeleteMovie(movie.id)} className="w-[190px] h-[50px] bg-[#8f0707] shadow-[0px_4px_10px_#00000040] text-black font-['Inter',Helvetica] font-normal text-2xl">
                            Remove
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          </div>
  
          {/* HomeIcon button */}
          {/* <div className="absolute bottom-0 right-4 flex flex-col items-center">
            <HomeIcon className="w-[55px] h-[49px]" />
            <span className="font-['Inter',Helvetica] font-normal text-sm text-center">
              HOME
            </span>
          </div> */}
        </div>
      </div>
    );
  };