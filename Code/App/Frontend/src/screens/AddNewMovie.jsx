  import React, { useState } from "react";
  import { Button } from "../components/add_new_movie/button";
  import { Input } from "../components/add_new_movie/input";
  import {
    Select as SingleSelect,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "../components/add_new_movie/select";
  import Select from "react-select";

  import { Textarea } from "../components/add_new_movie/textarea";
import { UserNavigationBar } from "../components/navigation_bar/UserNavigationBar";
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';

// For multi select
const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#ffffff33",
    borderRadius: "20px",
    borderColor: "#817d7d",
    minHeight: "50px",
    padding: "2px 10px",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#ccc",
    borderRadius: "10px",
    padding: "2px 6px",
  }),
};

const options = [
  { value: "Action", label: "Action" },
  { value: "Superhero", label: "Superhero" },
  { value: "Adventure", label: "Adventure" },
  { value: "Animation", label: "Animation" },
  { value: "Anime", label: "Anime" },
  { value: "Comedy", label: "Comedy" },
  { value: "Crime", label: "Crime" },
  { value: "Documentary", label: "Documentary" },
  { value: "Drama", label: "Drama" },
  { value: "Family", label: "Family" },
  { value: "Fantasy", label: "Fantasy" },
  { value: "Game Show", label: "Game Show" },
  { value: "Horror", label: "Horror" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Music", label: "Music" },
  { value: "Musical", label: "Musical" },
  { value: "Mystery", label: "Mystery" },
  { value: "Reality TV", label: "Reality TV" },
  { value: "Romance", label: "Romance" },
  { value: "Sci-Fi", label: "Sci-Fi" },
  { value: "Seasonal", label: "Seasonal" },
  { value: "Short", label: "Short" },
  { value: "Sport", label: "Sport" },
  { value: "Thriller", label: "Thriller" },
  { value: "Western", label: "Western" }
]

const languages = [
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "English", label: "English" },
  { value: "Chinese", label: "Chinese" },
  { value: "Spanish", label: "Spanish" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Bengali", label: "Bengali" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Russian", label: "Russian" },
  { value: "Japanese", label: "Japanese" },
  { value: "Bengali", label: "Bengali" },
  { value: "Korean", label: "Korean" },
]

  export const AddNewMovie = () => {
    const navigate = useNavigate();
    const [selectedTypes, setSelectedTypes] = useState([]);
    
    const [selectedFiles, setSelectedFiles] = useState({
      poster: null,
      review: null,
    });
    const [fileNames, setFileNames] = useState({
      poster: "",
      review: "",
    });
    
    const handleFileChange = (fieldId, e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFiles(prev => ({
          ...prev,
          [fieldId]: file
        }));
        setFileNames(prev => ({
          ...prev,
          [fieldId]: file.name
        }));
      }
    };
    
    const handleSelectChange = (selectedOptions) => {
      const values = selectedOptions.map(option => option.value);
      setSelectedTypes(values);
    };
    
    const formFields = [
      {
        id: "name",
        label: "Movie name",
        type: "text",
        placeholder: "Enter movie name here",
      },
      {
        id: "type",
        label: "Movie type",
        type: "select",
        placeholder: "Choose movie type",
      },
      {
        id: "language",
        label: "Language",
        type: "select",
        placeholder: "Choose language",
      },
      {
        id: "trailer_url",
        label: "Movie trailer Youtube ID",
        type: "text",
        placeholder: "Enter ID of movie trailer",
      },
      {
        id: "poster",
        label: "Poster",
        type: "file",
        placeholder: "Choose image file of poster",
        accept: "image/*",
      },
      {
        id: "review",
        label: "Movie review",
        type: "file",
        placeholder: "Choose .csv file of movie review",
        accept: ".csv",
      },
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter movie description here",
      },
    ];
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!selectedFiles.poster) {
        toast.error('No poster file selected!');
        return;
      }
      
      if (!selectedFiles.review) {
        toast.error('No review file selected!');
        return;
      }

      const formData = new FormData(e.target);
      formData.append('poster', selectedFiles.poster);
      formData.append('reviews', selectedFiles.review);
      formData.set('type', selectedTypes);

      const add_movie_response = await fetch('/api/movies/add', {
        method: 'POST',
        body: formData
      });
      
      const data = await add_movie_response.json();

      if (!add_movie_response.ok) {
        toast.error(`${data.detail}!`);
          return;
      }
    
      toast.success('Add movie successfully!');
      navigate('/user_home')

    };
  
    return (
      <div className="bg-white flex flex-row justify-center w-screen h-screen">
            {/* Background */}
            <div className="absolute w-full h-full top-0 left-0 bg-white" />
  
            {/* Header */}
            <UserNavigationBar title="ADDING A MOVIE"/>
  
            {/* Form */}
            <div className="absolute top-[100px] left-1/2 transform -translate-x-1/2">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {formFields.map((field) => (
                  <div key={field.id} className="flex items-start">
                    <label
                      className="w-[279px] h-[50px] font-['Inter',Helvetica] font-normal text-black text-2xl leading-[31.2px]"
                      htmlFor={field.id}
                    >
                      {field.label}
                    </label>
  
                    <div className="flex-1">
                      {field.type === "text" && (
                        <Input
                          id={field.id}
                          name={field.id}
                          className="w-[560px] h-[50px] bg-[#ffffff33] border border-solid border-[#817d7d]"
                          placeholder={field.placeholder}
                        />
                      )}
  
                      {field.type === "select" && (
                        <>
                        {
                          field.id === 'language' ? (
                            <SingleSelect name={field.id}>
                            <SelectTrigger className="w-[560px] h-[50px] bg-[#ffffff33] rounded-[20px] border border-solid border-[#817d7d]">
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                languages.map((language, index) => (
                                  <SelectItem key={index} value={language.value}>{language.label}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </SingleSelect>
                          ) : (
                            <Select name={field.id}
                            isMulti
                            options={options}
                            styles={customStyles}
                            placeholder={field.placeholder}
                            className="w-[560px]"
                            onChange={handleSelectChange}
                          />
                          )
                        }
                        </>
                      )}
  
                      {field.type === "file" && (
                        <div className="w-[560px] h-[50px] bg-[#ffffff33] border border-solid border-[#817d7d] flex items-center relative">
                          <input
                            type="file"
                            id={field.id} 
                            accept={field.accept}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(field.id, e)}
                          />
                          <Button
                            type="button"
                            className="w-[100px] h-[25px] ml-6 bg-[#817d7d] rounded-[20px] border border-solid shadow-[0px_4px_4px_#00000040] text-white text-sm"
                          >
                            Choose file
                          </Button>
                          <span className="ml-6 font-['Inter',Helvetica] font-normal text-[#817d7d] text-sm">
                            {fileNames[field.id] || field.placeholder}
                          </span>
                        </div>
                      )}
  
                      {field.type === "textarea" && (
                        <Textarea
                          id={field.id}
                          name={field.id}
                          className="w-[560px] h-[100px] bg-[#ffffff33] focus-visible:ring-0 border border-solid border-[#817d7d]"
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  </div>
                ))}
  
                {/* Submit Button */}
                <div className="flex justify-center mt-10">
                  <Button
                    type="submit"
                    className="w-[149px] h-[52px] ml-[300px] bg-[#ff0000] rounded-[20px] border border-solid shadow-[0px_4px_4px_#00000040] font-['Inter',Helvetica] font-bold text-white text-2xl"
                  >
                    SUBMIT
                  </Button>
                </div>
              </form>
            </div>
  
            {/* Navigation Buttons */}
            {/* <div className="absolute bottom-4 right-4 flex gap-6">
              <div className="flex flex-col items-center">
                <Button variant="ghost" className="w-[70px] h-[70px] p-0">
                  <CornerUpLeftIcon className="w-[70px] h-[70px]" />
                </Button>
                <span className="font-['Inter',Helvetica] font-normal text-black text-sm text-center">
                  BACK
                </span>
              </div>
  
              <div className="flex flex-col items-center">
                <Button variant="ghost" className="w-[70px] h-[70px] p-0">
                  <HomeIcon className="w-[70px] h-[70px]" />
                </Button>
                <span className="font-['Inter',Helvetica] font-normal text-black text-sm text-center">
                  HOME
                </span>
              </div>
            </div> */}

      </div>
    );
  };