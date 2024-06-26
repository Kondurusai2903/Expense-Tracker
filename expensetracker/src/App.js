import Home from "./Pages/Home/Home";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <SnackbarProvider>
      <div>
        <Home />
      </div>
    </SnackbarProvider>
  );
}

export default App;
