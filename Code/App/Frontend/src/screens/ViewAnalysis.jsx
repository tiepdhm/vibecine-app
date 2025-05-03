import {
    CornerUpLeftIcon,
    HomeIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
  } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../components/view_analysis/button";
import {
Card,
CardContent,
CardHeader,
CardTitle,
} from "../components/view_analysis/card";

import { WordCloudComponent } from "../components/WordCloud";

import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import { UserNavigationBar } from "../components/navigation_bar/UserNavigationBar";
import { PieChart } from 'react-minimal-pie-chart';
import { useCookies } from 'react-cookie';
import { GuestNavigationBar } from "../components/navigation_bar/GuestNavigationBar";
import { useParams } from 'react-router-dom';
import {toast} from 'react-toastify';
import LoadingSpinner from "../components/LoadingSpinner";
import ReviewModal from "../components/modal/ReviewModal";
import UploadCsvModal from "../components/modal/UploadCsvModal";
import { useNavigate } from "react-router-dom";
  const headCells = [
    {
      id: 'review',
      numeric: false,
      disablePadding: true,
      label: 'Review',
    },
    {
      id: 'polarity',
      numeric: false,
      disablePadding: false,
      label: 'Polarity',
    },
  ]
  
  // Data for tool box buttons
  // If change label, change them in code too
  const toolboxButtons = [
    { id: 1, label: "Add new review" },
    { id: 2, label: "Upload CSV" },
    { id: 3, label: "Run analysis" },
  ];

  // #region table enhancement
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, user } =
      props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow className="bg-pink-100">
          {
            user.role === 'user' && (
            <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts',
              }}
            />
          </TableCell>)

          }
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'center'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };
  
  function EnhancedTableToolbar(props) {
    const { numSelected, user, handleDeleteReviews} = props;
  
    if (numSelected < 1 || user.role === 'guest') {
      return null; // Don't render anything if nothing is selected or user role is guest
    }
  
    return (
      <Toolbar
        sx={[
          {
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          },
          {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          },
        ]}
      >
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
  
        <Tooltip title="Delete">
          <IconButton onClick={() => handleDeleteReviews()}>
            <DeleteIcon/>
          </IconButton>
        </Tooltip>
      </Toolbar>
    );
  }
  
  
  EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };
  // #endregion

  const fetchMovie = async (movieId) => {
      const get_movies_response = await fetch(`/api/movies/details/${movieId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    
      const movie = await get_movies_response.json();
      if (!get_movies_response.ok) {
        toast.error(`${movie.detail}!`);
      }
      return movie;
    };

    const fetchReviews = async (movieId) => {
      const get_reviews_response = await fetch(`/api/reviews/list/${movieId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    
      const reviews = await get_reviews_response.json();
      if (!get_reviews_response.ok) {
        toast.error(`${reviews.detail}!`);
      }
      return reviews;
    };

  export const ViewAnalysis = () => {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('polarity');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [cookies] = useCookies(['user']);
    const user = cookies.user || { role: 'guest' };
    const { movieId } = useParams();
    const [movie, setMovie] = React.useState({});
    const [reviews, setReviews] = React.useState([]);
    const [wordFrequencies, setWordFrequencies] = React.useState([]);
    const [pieChartData, setPieChartData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [addReviewModalOpen, setAddReviewModalOpen] = useState(false);
    const [uploadCSVModalOpen, setUploadCSVModalOpen] = useState(false);  
    const navigate = useNavigate();

    const loadData = async () => {
      const [movie, reviews] = await Promise.all([
        fetchMovie(movieId),
        fetchReviews(movieId),
      ]);

      setMovie(movie);  
      setReviews(reviews);

      const wordFrequencies = movie.word_cloud.map(item => ({
        text: item.word,
        value: item.frequency,
      }));
      setWordFrequencies(wordFrequencies);

      const positive_rate = Math.round((movie.positive_reviews / movie.total_reviews) * 100);
      const negative_rate = Math.round((movie.negative_reviews / movie.total_reviews) * 100);

      const pieChartData = [
        { title: 'Positive', value: positive_rate, color: '#4CAF50' },
        { title: 'Negative', value: negative_rate, color: '#F44336' },
      ];
      setPieChartData(pieChartData);
      setLoading(false);
    }
    
    React.useEffect(() => {
      loadData();
    }, []);
    
  const handleToolBox = async (label) => {
    switch(label) {
      case "Add new review":
        setAddReviewModalOpen(true);
        break;

      case "Upload CSV":
        setUploadCSVModalOpen(true);
        break;

      case "Run analysis":
        const loadingToast = toast.loading('Analysing...');
        const analysis_response = await fetch(`/api/analysis/run-analysis/${movieId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          
            const data = await analysis_response.json();
          
            if (!analysis_response.ok) {
              toast.update(loadingToast, {
                render: `${data.detail}!`,
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
              return;
            }

            toast.update(loadingToast, {
              render: "Run analysis successfully!",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            
            loadData();
        break;
    }
  }

  const handleAddReviewSubmit = async (reviewText) => {
    const review_response = await fetch(`/api/reviews/add/${movieId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "content": reviewText
            })
          });
        
          const data = await review_response.json();
        
          if (!review_response.ok) {
            toast.error(`${data.detail}!`);
              return;
          }
        
          toast.success('Add a review successfully!');
          const reviews = await fetchReviews(movieId);
          setReviews(reviews);
  }

  const handleUploadCSV = async (file) => {
    const formData = new FormData();
    formData.append('csv_file', file);

    const review_response = await fetch(`/api/reviews/add_csv/${movieId}`, {
      method: 'POST',
      body: formData
    });
  
    const data = await review_response.json();
  
    if (!review_response.ok) {
      toast.error(`${data.detail}!`);
        return;
    }
  
    toast.success('Upload CSV successfully!');
    const reviews = await fetchReviews(movieId);
    setReviews(reviews);
  }

  const handleDeleteReviews = async () => {
    const delete_response = await fetch(`/api/reviews/delete-multiple?movie_id=${movieId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selected)
    });
  
    const data = await delete_response.json();

    console.log(data)
    if (!delete_response.ok) {
      toast.error(`${data.detail}!`);
        return;
    }
  
    toast.success('Delete selected reviews successfully!');
    navigate(0);

  }
    // #region table functions
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
      };
    
      const handleSelectAllClick = (event) => {
        if (event.target.checked) {
          const newSelected = reviews.map((n) => n.id);
          setSelected(newSelected);
          return;
        }
        setSelected([]);
      };
    
      const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
    
        if (selectedIndex === -1) {
          newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
          newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
          newSelected = newSelected.concat(
            selected.slice(0, selectedIndex),
            selected.slice(selectedIndex + 1),
          );
        }
        setSelected(newSelected);
      };
    
      const handleChangePage = (event, newPage) => {
        setPage(newPage);
      };
    
      const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };
    
      const handleChangeDense = (event) => {
        setDense(event.target.checked);
      };
    
      // Avoid a layout jump when reaching the last page with empty rows.
      const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reviews.length) : 0;
    
      const visibleRows = React.useMemo(
        () =>
          [...reviews]
            .sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [reviews, order, orderBy, page, rowsPerPage],
      );
    // #endregion
    if (loading) {
      return <LoadingSpinner/>;
    }

    return (
      <div className="bg-white h-full w-full flex flex-col items-center space-y-6 overflow-auto">
        {
          user.role === "user" ?
          <UserNavigationBar title="VIEW ANALYSIS"/> :
          <GuestNavigationBar/>
        }
  
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Movie poster */}
          <div className="col-span-1">
            <img
              className="rounded-xl shadow-md w-full h-auto object-cover"
              alt={`${movie.name} Poster`}
              src={movie.poster}
            />
          </div>
  
          {/* Analysis summary */}
          <div className="col-span-2 flex flex-col space-y-4">
            <Card className="bg-[#833228] rounded-3xl text-white shadow-md py-4 px-8 text-center">
              <CardTitle className="text-3xl md:text-4xl">
                Detail analysis of <span className="font-bold">{movie.name}</span>
              </CardTitle>
            </Card>
  
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#e5c96c] text-center font-bold text-xl rounded-xl p-4 shadow-md">
                Total review
                <div className="text-3xl mt-2">{movie.total_reviews}</div>
              </div>
  
              <div className="bg-[#62bf36] text-center text-xl rounded-xl p-4 shadow-md">
                Positive review
                <div className="flex justify-center items-center mt-2 text-2xl font-bold space-x-2">
                  <span>{movie.positive_reviews}</span>
                  <ThumbsUpIcon />
                </div>
              </div>
  
              <div className="bg-[#c87b7b] text-center text-xl rounded-xl p-4 shadow-md">
                Negative review
                <div className="flex justify-center items-center mt-2 text-2xl font-bold space-x-2">
                  <span>{movie.negative_reviews}</span>
                  <ThumbsDownIcon />
                </div>
              </div>
            </div>
            {
              wordFrequencies.length !== 0 && (
                <div className="bg-white border rounded-xl shadow-md p-4 text-center">
                {/* Wordcloud */}
                <WordCloudComponent words={wordFrequencies} />
              </div>
              )
            }
          </div>

          <div className="col-span-1">
            {
              (movie.positive_reviews !== 0 || movie.negative_reviews !== 0) && (
                <div className="flex flex-col items-center">
                <PieChart
                  data={pieChartData}
                  radius={40}
                  label={({ dataEntry }) =>
                    dataEntry.percentage > 0 ? `${Math.round(dataEntry.percentage)} %` : ''
                  }
                  labelStyle={{
                    fontSize: '5px',
                    fill: '#000000',
                    fontFamily: 'inherit',
                    fontWeight: 'bold'
                  }}
                />
              </div>
              )}
    </div>
        </div>
  
        {/* Review and Toolbox section side-by-side */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Review Table */}
          <div className="lg:col-span-2 space-y-4">
            <Box>
              <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} user={user} handleDeleteReviews={handleDeleteReviews}/>
                <TableContainer>
                  <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
                  <TableHead>
            <TableRow align="center" className="bg-pink-300">
              <TableCell align="center" colSpan={3}>
              <Typography variant="h5" fontWeight="bold" className="text-center py-2">
              List of reviews
            </Typography>
              </TableCell>
              </TableRow>
              </TableHead>
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={handleSelectAllClick}
                      onRequestSort={handleRequestSort}
                      rowCount={reviews.length}
                      user={user}
                    />
                    <TableBody>
                      {visibleRows.map((row, index) => {
                        const isItemSelected = selected.includes(row.id);
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow
                            hover
                            onClick={(event) => handleClick(event, row.id)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                            sx={{ cursor: 'pointer' }}
                          >
                            {
                              user.role === 'user' && (
                              <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </TableCell>
                      )}
                            <TableCell component="th" id={labelId} scope="row" padding="normal" dangerouslySetInnerHTML={{ __html: row.content }}>
                              {/* {row.content} */}
                            </TableCell>
                            <TableCell align="right">{row.polarity}</TableCell>
                          </TableRow>
                        );
                      })}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={reviews.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
                    {/* <FormControlLabel
                      control={<Switch checked={dense} onChange={handleChangeDense} />}
                      label="Dense padding"
                    /> */}
            </Box>
          </div>
          
          {
            user.role === 'user' && (
              /* Toolbox */
              <div className="space-y-4">
              <Card className="bg-pink-300 rounded-xl p-4 text-center">
                <CardTitle className="text-2xl font-bold">Tool box</CardTitle>
              </Card>
              <Card className="bg-[#f3d5ae] rounded-xl p-4 flex flex-col space-y-2">
                {toolboxButtons.map((button) => (
                  <Button
                    key={button.id}
                    className="bg-[#e7b37f] hover:bg-[#d9a06c] rounded-xl text-lg font-semibold py-2"
                    onClick={() => handleToolBox(button.label)}
                  >
                    {button.label}
                  </Button>
                ))}

                {/* Modal */}
                <ReviewModal
                  isOpen={addReviewModalOpen}
                  onClose={() => setAddReviewModalOpen(false)}
                  onSubmit={handleAddReviewSubmit}
                />
                <UploadCsvModal
                  isOpen={uploadCSVModalOpen}
                  onClose={() => setUploadCSVModalOpen(false)}
                  onUpload={handleUploadCSV}
                />
              </Card>
            </div>
            )
          }
        </div>
  
        {/* Navigation buttons */}
        {/* <div className="flex space-x-4">
          <Button variant="ghost" className="flex flex-col items-center">
            <CornerUpLeftIcon className="w-10 h-10" />
            <span className="text-sm mt-1">BACK</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center">
            <HomeIcon className="w-10 h-10" />
            <span className="text-sm mt-1">HOME</span>
          </Button>
        </div> */}
      </div>
    );
  };
  