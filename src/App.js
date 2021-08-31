import Uploady, {
  UploadyContext,
  useItemStartListener,
  useItemFinishListener,
  useItemProgressListener,
  useAbortItem,
  useItemAbortListener
} from "@rpldy/uploady";
import { asUploadButton } from "@rpldy/upload-button";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import React, { forwardRef, useContext, useState } from "react";

const DivUploadButton = asUploadButton(
  forwardRef((props, ref) => (
    <span {...props} className="FileBrowser-toolbarButton">
      ⇧ Upload
    </span>
  ))
);

const FileViewer = () => {
  const [items, setItems] = useState([
    { name: "Example_file1.txt" },
    { name: "Example_file2.jpg" },
    { name: "Example_filex.pdf" }
  ]);
  const [uploads, setUploads] = useState([]);
  const progressData = useItemProgressListener();
  const abortItem = useAbortItem();

  useItemStartListener((item) => {
    setUploads((uploads) => [
      ...uploads,
      { id: item.id, name: item.file.name }
    ]);
  });

  if (progressData && progressData.completed) {
    let newUploads = uploads.slice();
    const ind = newUploads.findIndex((f) => f.id === progressData.id);
    if (newUploads[ind]) {
      newUploads[ind].progress = progressData.completed;
    }
  }

  useItemFinishListener((item) => {
    const filename = JSON.parse(item.uploadResponse.data).name;
    let newUploads = uploads.slice();
    const ind = newUploads.findIndex((f) => f.id === item.id);
    newUploads.splice(ind);
    setUploads(newUploads);
    setItems((items) => [...items, { name: filename }]);
  });

  useItemAbortListener((item) => {
    let newUploads = uploads.slice();
    const ind = newUploads.findIndex((f) => f.id === item.id);
    newUploads.splice(ind);
    setUploads(newUploads);
  });

  const uploadyContext = useContext(UploadyContext);

  const [{ isDragging }, dropRef] = useDrop({
    accept: NativeTypes.FILE,
    collect: (monitor) => ({
      isDragging: !!monitor.isOver()
    }),
    drop: (item) => {
      if (uploadyContext) {
        uploadyContext.upload(item.files);
      }
    }
  });

  return (
    <div className="FileViewer">
      <div className="FileBrowser-toolbar">
        <DivUploadButton />
      </div>
      <table
        className={"FileViewer-list" + (isDragging ? " is-hovered" : "")}
        ref={dropRef}
      >
        <tbody>
          {uploads.map((item) => (
            <tr
              key={"upload-" + item.name}
              className="FileViewer-listRow FileViewer-listRow--upload"
            >
              <td>
                {item.name} (Uploading - {Math.round(item.progress || 0)}%)
                <button onClick={() => abortItem(item.id)}>cancel</button>
              </td>
            </tr>
          ))}
          {items.map((item) => (
            <tr key={item.name} className="FileViewer-listRow">
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const App = () => (
  <div className="FileBrowser">
    <DndProvider backend={HTML5Backend}>
      <Uploady destination={{ url: "/api/upload" }}>
        <FileViewer />
      </Uploady>
    </DndProvider>
  </div>
);

export default App;
