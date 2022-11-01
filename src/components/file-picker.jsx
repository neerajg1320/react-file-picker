import axios from "axios";
import classNames from "classnames";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DropZone } from "./drop-zone";
import styles from "./file-picker.module.css";
import { FilesList } from "./files-list";

const FilePicker = ({ accept, uploadURL, loginURL }) => {

  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploadStarted, setUploadStarted] = useState(false);
  const [jwtToken, setJwtToken] = useState('Unauthenticated');

  // handler called when files are selected via the Dropzone component
  const handleOnChange = useCallback((files) => {
    let filesArray = Array.from(files);

    filesArray = filesArray.map((file) => ({
      id: nanoid(),
      file,
    }));

    setFiles(filesArray);
    setProgress(0);
    setUploadStarted(false);
  }, []);

  // handle for removing files form the files list view
  const handleClearFile = useCallback((id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  // whether to show the progress bar or not
  const canShowProgress = useMemo(() => files.length > 0, [files.length]);

  const handleLoginClick = useCallback(async  () => {
    const data = {
      "email": "staff@abc.com",
      "password": "Super123"
    };

    const res = await axios.request({
      url: loginURL,
      method: "POST",
      headers: {Authorization: `Bearer ${jwtToken}`},
      data
    });

    // console.log(`res=${JSON.stringify(res, null, 2)}`)
    // TBD: Need to get the right way
    if (res.status == 200) {
      setJwtToken(res.data.access);
      // console.log(`jwtToken: ${jwtToken}`);
    }
  });

  // execute the upload operation
  const handleUpload = useCallback(async () => {
    // console.log(`handleUpload(): jwtToken: ${jwtToken}`);
    try {
      const data = new FormData();

      files.forEach((file) => {
        data.append("file", file.file);
        data.append("source", "webapp");
      });

      const res = await axios.request({
        url: uploadURL,
        method: "POST",
        headers: {Authorization: `Bearer ${jwtToken}`},
        data,
        onUploadProgress: (progressEvent) => {
          setUploadStarted(true);
          const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

    } catch (error) {
      console.log(error);
    }
  }, [files.length, jwtToken]);

  useEffect(() => {
    if (jwtToken !== 'Unauthenticated') {
      console.log(`Authenitcation Successful`);
    }
    // console.log(`useEffect: jwtToken=${jwtToken}`);
  }, [jwtToken]);

  // set progress to zero when there are no files
  useEffect(() => {
    if (files.length < 1) {
      setProgress(0);
    }
  }, [files.length]);

  // set uploadStarted to false when the upload is complete
  useEffect(() => {
    if (progress === 100) {
      setUploadStarted(false);
    }
  }, [progress]);

  const uploadComplete = useMemo(() => progress === 100, [progress]);

  return (
      <div className={styles.wrapper}>

        <button onClick={handleLoginClick} className={styles.login_button}>
          Login
        </button>

        {/* canvas */}
        <div className={styles.canvas_wrapper}>
          <DropZone onChange={handleOnChange} accept={accept} />
        </div>

        {/* files listing */}
        {files.length ? (
            <div className={styles.files_list_wrapper}>
              <FilesList
                  files={files}
                  onClear={handleClearFile}
                  uploadComplete={uploadComplete}
              />
            </div>
        ) : null}

        {/* progress bar */}
        {canShowProgress ? (
            <div className={styles.files_list_progress_wrapper}>
              <progress value={progress} max={100} style={{ width: "100%" }} />
            </div>
        ) : null}

        {/* upload button */}
        {files.length ? (
            <button
                onClick={handleUpload}
                className={classNames(
                    styles.upload_button,
                    uploadComplete || uploadStarted ? styles.disabled : ""
                )}
            >
              {`Upload ${files.length} Files`}
            </button>
        ) : null}
      </div>
  );
};

export { FilePicker };
