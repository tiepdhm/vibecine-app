import {
    Check,
    SquareCheckBig,
    Download,
    Delete,
  } from "lucide-react";
  import React from "react";
  import { Button } from "../components/data_scientist/button";
  import { Card, CardContent } from "../components/data_scientist/card";
  import { Input } from "../components/data_scientist/input";
  import { Separator } from "../components/data_scientist/separator";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../components/data_scientist/table";
  
  import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { DataScentistNavigationBar } from "../components/navigation_bar/DataScentistNavigationBar";
import {toast} from 'react-toastify';

    // Available algorithms
    const algorithms = [
      {
        name: "Naive Bayes Classifier",
        value: "naive_bayes"
      },
      {
        name: "Linear Support Vector Machine",
        value: "linear_svm"
      }
  ];
  
const fetchModels = async () => {
  const get_models_response = await fetch("/api/training/models", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const models = await get_models_response.json();
  if (!get_models_response.ok) {
    toast.error(`${models.detail}!`);
  }
  return models;
};

  export const DataScientistLogin = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [models, setModels] = React.useState([]); 
    const fileInputRef = React.useRef(null);
    const [selectedFileName, setSelectedFileName] = React.useState('');
    const [modelName, setModelName] = React.useState('');
    const [parameters, setParameters] = React.useState('');
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState({});
    const [inputTextTest, setInputTextTest] = React.useState("");
    const [predictResult, setPredictResult] = React.useState(null);

    const [currentPage, setCurrentPage] = React.useState(1);
    const modelsPerPage = 5;
  
    const indexOfLastModel = currentPage * modelsPerPage;
    const indexOfFirstModel = indexOfLastModel - modelsPerPage;
    const currentModels = models.slice(indexOfFirstModel, indexOfLastModel);
  
    const totalPages = Math.ceil(models.length / modelsPerPage);

      React.useEffect(() => {
        const loadModels = async () => {
          const models = await fetchModels();
          setModels(models);
        };
    
        loadModels();
      }, []);

    // Toggle dropdown visibility
    const toggleDropdown = () => setIsOpen((prev) => !prev);
  
    // Handle selecting an algorithm
    const handleSelect = (algorithm) => {
      setSelectedAlgorithm(algorithm);
      setIsOpen(false); // Close the dropdown when an option is selected
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFileName(file.name);
      }
    };

    const handleToggleModel = async (model_name) => {
      const status_response = await fetch(`/api/training/models/${model_name}/in-use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      const data = await status_response.json();
    
      if (!status_response.ok) {
        toast.error(`${data.detail}!`);
          return;
      }
    
      toast.success('Change in-use status successfully!');
      const models = await fetchModels();
      setModels(models);
    }

    const handleTraining = async () => {
      if (!fileInputRef.current.files[0]) {
        toast.error("Please choose a file!");
        return;
      }
    
      const formData = new FormData();
      formData.append('model_name', modelName);
      formData.append('algorithm', selectedAlgorithm.value);
      formData.append('alpha', parameters);
      formData.append('dataset', fileInputRef.current.files[0]);

      const loadingToast = toast.loading('Training new model, this will take a while...');
        const training_response = await fetch('/api/training/train', {
              method: 'POST',
              body: formData
            });
            
            const data = await training_response.json();

            if (!training_response.ok) {
              toast.update(loadingToast, {
                render: `${data.detail}!`,
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
              return;
            }

            toast.update(loadingToast, {
              render: "Training new model successfully!",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });

      const models = await fetchModels();
      setModels(models);            

      console.log({
        file: formData.get('file'),
        modelName: formData.get('model_name'),
        selectedAlgorithm: formData.get('algorithm'),
        parameters: formData.get('parameters'),
      });
    };

    const handleDeleteModel = async (model_name) => {
      const delete_response = await fetch(`/api/training/models/${model_name}`, {
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
    
      toast.success('Delete model successfully!');
      const models = await fetchModels();
      setModels(models);
    }

    const handlePredict = async () => {
      const loadingToast = toast.loading('Predicting...');
      const predict_response = await fetch('/api/training/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "review": inputTextTest
        })
      });
    
      const data = await predict_response.json();
    
      if (!predict_response.ok) {
        toast.update(loadingToast, {
          render: `${data.detail}!`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
          return;
      }
      
      toast.update(loadingToast, {
        render: "Predict successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setPredictResult(data.sentiment);
    }
    
    return (
      <div className="bg-white w-screen h-screen flex flex-col">
        {/* Header */}
        <DataScentistNavigationBar title="TRAINING MODEL"/>
  
        <div className="flex flex-1 p-4 gap-6 overflow-hidden justify-center">
          {/* Left Panel - Training Configuration */}
          <Card className="w-[502px] rounded-[20px] border-[#817d7d] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-[32px] font-bold text-black text-center mb-4">
                Training Configuration
              </h2>
              <Separator className="mb-4" />
  
              <div className="space-y-6">
                {/* Dataset Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-2">Dataset</h3>
                    <div className="flex items-center bg-[#817d7d33] rounded-[5px] border border-solid p-4 h-[70px]">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".csv"
                        className="hidden" 
                      />
                      <Button 
                        className="h-[50px] w-[109px] bg-[#817d7d] rounded-[20px] shadow-[0px_4px_4px_#00000040] text-white font-bold"
                        onClick={() => fileInputRef.current.click()}
                      >
                        Choose file
                      </Button>
                      <span className="ml-6 text-sm text-[#817d7d]">
                        {selectedFileName || "Upload your .csv file here"}
                      </span>
                    </div>
                  </div>
  
                {/* Model Name Section */}
                <div>
                  <h3 className="text-xl font-bold mb-2">Model name</h3>
                  <div className="bg-[#817d7d33] rounded-[5px] border border-solid h-[70px] flex items-center justify-center">
                    <Input
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="border-none bg-transparent text-center text-[#817d7d] text-sm placeholder:text-[#817d7d] w-full h-full"
                      placeholder="Enter name of your model"
                    />
                  </div>
                </div>
  
                {/* Algorithm Section */}
                <div>
                <h3 className="text-2xl font-bold mb-2">Algorithm</h3>
                <div className="relative bg-[#817d7d33] rounded-[5px] border border-solid h-[70px] flex items-center">
                    <button
                    onClick={toggleDropdown} // Toggle the dropdown when the select box or icon is clicked
                    className="w-full h-full flex items-center justify-between px-4 bg-transparent text-[#817d7d] text-sm border-none focus:outline-none cursor-pointer"
                    >
                    <span className="flex-1 text-center">
                        {selectedAlgorithm.name || "Choose the algorithm to use"}
                    </span>
                    <ChevronUpDownIcon className="w-6 h-6" />
                    </button>

                    {/* Dropdown options */}
                    {isOpen && (
                    <ul className="absolute bg-white rounded-md shadow-lg mt-1 py-2 w-full max-h-[300px] overflow-auto z-50 top-full left-0">
                        {algorithms.map((algorithm) => (
                        <li
                            key={algorithm.name}
                            onClick={() => handleSelect(algorithm)} // Handle selection
                            className="px-4 py-2 hover:bg-[#817d7d33] cursor-pointer"
                        >
                            {algorithm.name}
                        </li>
                        ))}
                    </ul>
                    )}
                </div>
                </div>
  
                {/* Parameters Input Section */}
                <div>
                  <h3 className="text-xl font-bold mb-2">Parameter input</h3>
                  <div className="bg-[#817d7d33] rounded-[5px] border border-solid h-[70px] flex items-center justify-center">
                    <Input
                      value={parameters}
                      onChange={(e) => setParameters(e.target.value)}
                      className="border-none bg-transparent text-center text-[#817d7d] text-sm placeholder:text-[#817d7d] w-full h-full"
                      placeholder="Enter alpha value (e.g., 0.1)"
                    />
                  </div>
                </div>
  
                {/* Training Button */}
                <div className="flex justify-center mt-8">
                  <Button onClick={handleTraining} className="w-full h-[52px] bg-[#14b5d2] rounded-[20px] border border-solid border-[#14b6d2] shadow-[0px_4px_4px_#00000040] text-black text-2xl font-bold">
                    TRAINING
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
  
          {/* Right Panel - Results */}
          <Card className="flex rounded-none border-none overflow-y-auto">
            <CardContent className="p-0">
              <h2 className="text-[32px] font-bold text-black text-center my-2">
                RESULT
              </h2>
              <Separator className="mb-2" />
  
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-[#bebe2e] text-xl text-black text-center w-[65px] font-bold">
                      Name
                    </TableHead>
                    <TableHead className="bg-[#bebe2e] text-xl text-black text-center w-[87px] font-bold">
                      F1_score
                    </TableHead>
                    <TableHead className="bg-[#bebe2e] text-xl text-black text-center w-[92px] font-bold">
                      Alpha
                    </TableHead>
                    <TableHead className="bg-[#bebe2e] text-xl text-black text-center w-[88px] font-bold">
                      In-use
                    </TableHead>
                    <TableHead className="bg-[#bebe2e] text-xl text-black text-center font-bold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentModels.map((model, index) => (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-[#d9d9d9]" : "bg-[#f6f6f6]"}
                    >
                      <TableCell className="text-base text-black text-center border border-solid border-black h-32 py-4">
                        {model.model_name}
                      </TableCell>
                      <TableCell className="text-xl text-black text-center h-32 py-4">
                        {Number(model.f1_score.toFixed(3))}
                      </TableCell>
                      <TableCell className="text-[15px] text-black text-center h-32 py-4">
                        {model.alpha}
                      </TableCell>
                      <TableCell className="text-center h-32 py-4">
                        {model.in_use && <Check className="w-12 h-12 mx-auto" />}
                      </TableCell>
                      <TableCell className="h-32 py-4">
                        <div className="flex gap-2">
                          <Button onClick={() => handleDeleteModel(model.model_name)} className="flex items-center gap-2 bg-[#8f0707] shadow-[0px_4px_4px_#00000040] text-black text-2xl h-[45px] w-[202px]">
                            <Delete className="w-9 h-9" />
                            Remove
                          </Button>
                        <Button onClick={() => handleToggleModel(model.model_name)} className="flex items-center gap-2 bg-[#0b882c] shadow-[0px_4px_4px_#00000040] text-black text-2xl h-[45px] w-full">
                          <SquareCheckBig className="w-8 h-8" />
                          Choose as model
                        </Button>
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
            </CardContent>
          </Card>
        </div>
  
        {/* Test Section */}
        <div className="p-4 flex items-center gap-4 ml-20 pl-20">
          <span className="text-xl font-bold">Test</span>
          <Input
            className="w-80 h-[49px] border border-solid border-[#817d7d] placeholder:text-[#817d7d]"
            placeholder="e.g: This movie is too bad"
            value={inputTextTest}
            onChange={(e) => setInputTextTest(e.target.value)}
          />
          <Button onClick={()=> handlePredict()} className="h-8 bg-[#716c6c] rounded-[20px] border border-solid border-[#817d7d] shadow-[0px_4px_4px_#00000040] text-white">
            PREDICT
          </Button>

           {/* Show badge if result is ready */}
            {predictResult && (
              <span
                className={`px-3 py-1 rounded-full text-white text-sm ${
                  predictResult === "positive" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {predictResult.toUpperCase()}
              </span>
            )}
        </div>
      </div>
    );
  };