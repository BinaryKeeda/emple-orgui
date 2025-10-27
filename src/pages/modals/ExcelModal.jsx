import { Close } from '@mui/icons-material';
import { Button, CircularProgress, IconButton } from '@mui/material';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { csvToJson } from '../utils/lib/jsonParser';
import { BASE_URL } from '../../../lib/config';

export default function ExcelModal({ setModalClose, id }) {
    const [file, setFiles] = useState(null);
    const [loading, setLoading] = useState(false);
    const { getRootProps, getInputProps } = useDropzone({
        onDropAccepted: (acceptedFiles) => {
            console.log(acceptedFiles);

            setFiles(...acceptedFiles);
        },
        onDropRejected: (rejectedFiles) => {
            // Handle rejected file and provide feedback
            rejectedFiles.forEach((file) => {
                console.log(`${file.name} has an invalid MIME type.`);
            });
        },
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
    });


    const uploadCsv = async () => {
        setLoading(true);
        try {
            const data = await csvToJson(file , id);
            console.log(data);
            const res = axios.post(`${BASE_URL}/api/v1/quiz/add/questions`, {data:data , quizId:id}, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            console.log(res);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="h-screen w-screen bg-opacity-25 px-36 py-24 bg-black fixed top-0 left-0 z-[2099]">
                <div className="rounded-md relative h-full w-full transition-all ease-linear duration-300 bg-white">

                    <div className="flex justify-end">
                        <IconButton onClick={() => { setModalClose(true); }}>
                            <Close />
                        </IconButton>
                    </div>
                    <section className='p-5  gap-5' >
                        <div
                            className='p-10 cursor-pointer flex-1 flex justify-center border-dashed border-2 border-black'
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} />
                            {

                                file ? <small>{file.name}</small> :

                                    <small>Upload here {'(Only .xls & .xlsx supported)'}</small>
                            }
                        </div>
                        {
                            file &&
                            <Button onClick={uploadCsv} className='mt-3' sx={{
                                marginTop: '10px'
                            }} variant='contained' color='primary' >Validate & Upload</Button>
                        }

                        {
                            loading &&
                            <div className="loader"></div>
                        }
                    </section>
                </div>
            </div>
        </>
    );
}
