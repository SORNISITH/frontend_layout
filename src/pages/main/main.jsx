import { useNavigate } from "react-router";
import { Button } from "@mui/material";
export default function MainPage() {
  const navigate = useNavigate();
  return (
    <div className="w-full  h-full flex flex-col justify-center items-center">
      <div className="w-full h-full gap-3 flex   ">
        <div className="mt-10 gap-5 flex h-10">
          <Button onClick={() => navigate("/pdfview")} variant="contained">
            PDF viewer
          </Button>
          <Button onClick={() => navigate("/test")} variant="contained">
            test
          </Button>
          <Button onClick={() => navigate("/portfolio")} variant="contained">
            portfolio
          </Button>
          <Button onClick={() => navigate("/login")} variant="contained">
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
