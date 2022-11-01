import './App.css';
import { FilePicker } from "./components/FilePicker";


function App() {
  return (
    <div className="App">
      <FilePicker
          uploadURL={"http://localhost:8080/api/v1/dms/fileparts/"}
          loginURL={"http://localhost:8080/api/v1/auth/jwt/create/"}
      />
    </div>
  );
}

export default App;
